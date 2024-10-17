import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import * as fal from "@fal-ai/serverless-client";
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

fal.config({
  credentials: process.env.FAL_KEY,
});

const pdfBuffers: { [key: string]: { data: Buffer; timestamp: number; cardDetails: any } } = {};

// Directory to store temporary PDFs
const tempPdfDir = path.join(process.cwd(), 'public', 'temp_pdfs');

// Ensure the temporary PDF directory exists
if (!fs.existsSync(tempPdfDir)) {
  fs.mkdirSync(tempPdfDir, { recursive: true });
}
// Clean up old PDFs every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of Object.entries(pdfBuffers)) {
    if (now - value.timestamp > 3600000) { // 1 hour
      delete pdfBuffers[key];
      // Also delete the local file if it exists
      const localPath = path.join(tempPdfDir, `${key}.pdf`);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }
  }
}, 3600000); // Run every hour

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Received ${req.method} request to ${req.url}`);
  if (req.method === 'POST') {
    const { prompt, userId } = req.body;

    if (!prompt || !userId) {
      return res.status(400).json({ error: 'Prompt and userId are required' });
    }

    try {
      console.log('Generating card content using OpenAI...');

      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Analyze the following user prompt for greeting card generation and provide content suggestions. Use these categories and their associated keywords:

[Categories and keywords as previously listed]

For the user prompt, please:
1. Determine the category of the greeting card from the options above.
2. Identify the specific occasion or sentiment based on the keywords.
3. Extract any names or specific recipients mentioned.
4. Suggest a short, appropriate text for the front page of the card, following these guidelines:
   - The text should be 1-5 words long
   - It should be a common greeting or wish associated with the occasion
   - Do not include any specific names in this text
   - For general occasions, use a universal greeting
   - For specific holidays, use a traditional or popular greeting
   - For a new year greeting card dont add any year, as you are not sure of the year.
   - For a birthday greeting card, use 'Happy Birthday', and For Diwali greeting card, use 'Happy Diwali', similarly based on the occasion give the front page text
5. Generate a brief, heartfelt message for the inside of the card, following these guidelines:
   - Keep it between 7-10 easy to understand words
   - Include the recipient's name if provided
   - Make it personal and appropriate for the occasion
   - Express warm wishes or sentiments relevant to the category and occasion
   - Please ensure that all words in the output are correctly spelled and contextually accurate. Avoid substituting words that sound similar but have different meanings (e.g., 'bay' instead of 'day'). Pay extra attention to common homophones or words with close spelling, and ensure the sentence remains meaningful and coherent
   - Don't add [Your Name] at the end
6. Provide your analysis and suggestions in this format:
   Category: [Category]
   Occasion/Sentiment: [Occasion/Sentiment]
   Recipient(s): [Name(s) or 'None specified']
   Front Page Text: [Suggested text for the front page]
   Inside Message: [Suggested message for inside the card]`
          },
          { role: "user", content: prompt }
        ]
      });

      const openaiOutput = completion.choices[0].message?.content;

      if (!openaiOutput) {
        throw new Error('Failed to generate content from OpenAI');
      }

      const lines = openaiOutput.split('\n');
      const parsedOutput: { [key: string]: string } = {};
      for (const line of lines) {
        if (line.includes(':')) {
          const [key, value] = line.split(':', 2);
          parsedOutput[key.trim()] = value.trim();
        }
      }
      console.log('OpenAI response received.');

      interface FalResult {
        images: { url: string }[];
      }

      const frontResult = await fal.subscribe("fal-ai/flux-pro", {
        input: {
          prompt: `Generate a front page of the greeting card with text '${parsedOutput['Front Page Text']}'. The design should be festive and appropriate for ${parsedOutput['Occasion/Sentiment']}. Include decorative elements and a border typical of greeting cards.`,
          image_size: "portrait_4_3"
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      }) as FalResult;
      console.log('Generating front and inside card images using FAL...');

      const insideResult = await fal.subscribe("fal-ai/flux-pro", {
        input: {
          prompt: `Generate a inside page of the greeting card with text '${parsedOutput['Inside Message']}'.The text should be clearly visible and without mistakes and nicely integrated into the design. Include a decorative border or background suitable for ${parsedOutput['Occasion/Sentiment']}.`,
          image_size: "portrait_4_3"
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      }) as FalResult;
      console.log(frontResult, insideResult);

      const frontImageResponse = await fetch(frontResult.images[0].url);
      const insideImageResponse = await fetch(insideResult.images[0].url);
      const frontImageData = await frontImageResponse.arrayBuffer();
      const insideImageData = await insideImageResponse.arrayBuffer();

      console.log('Creating PDF with images...');

      const pdfId = uuidv4();

      const pdfBytes = await createPdfWithImages(frontImageData, insideImageData);

      console.log('PDF created successfully.');

      const base64Pdf = Buffer.from(pdfBytes).toString('base64');

      pdfBuffers[pdfId] = {
        data: Buffer.from(pdfBytes),
        timestamp: Date.now(),
        cardDetails: parsedOutput
      };
      // Save PDF locally
      const localPath = path.join(tempPdfDir, `${pdfId}.pdf`);
      //fs.writeFileSync(localPath, pdfBytes);
      console.log(`PDF saved locally at: ${localPath}`);

      console.log('Updating user data in D1 database...');

      // D1 database interaction
      const d1Response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${process.env.D1_DATABASE_ID}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: 'UPDATE users SET cards_remaining = cards_remaining - 1 WHERE id = ?',
          params: [userId],
        }),
      });
      console.log('User data updated in D1 database.');

      interface D1Response {
        success: boolean;
        // Add other properties that might be in the response
      }

      const d1Data = await d1Response.json() as D1Response;
      if (!d1Data.success) {
        throw new Error('Failed to update user data in D1');
      }

      res.status(200).json({
        front_image_url: frontResult.images[0].url,
        inside_image_url: insideResult.images[0].url,
        pdf_url: `/api/generate-card?pdfId=${pdfId}`, // Changed this line
        local_pdf_url: `/temp_pdfs/${pdfId}.pdf`,
        pdf_data: base64Pdf,
        card_details: parsedOutput
      });
    } catch (error) {
      console.error('An error occurred:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  } else if (req.method === 'GET') {
    console.log('I m here in the else if.');
    const { pdfId } = req.query;
    console.log(pdfId);
    console.log(`Attempting to download PDF with ID: ${pdfId}`);

    if (typeof pdfId !== 'string') {
      return res.status(400).json({ error: 'Invalid pdfId' });
    }

    const localPath = path.join(tempPdfDir, `${pdfId}.pdf`);
    if (fs.existsSync(localPath)) {
      console.log(`PDF found locally. Sending...`);
      const fileBuffer = fs.readFileSync(localPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="greeting_card_${pdfId}.pdf"`);
      res.send(fileBuffer);
    } else {
      console.log(`PDF not found locally.`);
      res.status(404).json({ error: 'PDF not found' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function createPdfWithImages(frontImageData: ArrayBuffer, insideImageData: ArrayBuffer) {
  const pdfDoc = await PDFDocument.create();
  const frontPage = pdfDoc.addPage();
  const backPage = pdfDoc.addPage();
  console.log('Embedding front image in PDF...');

  // Embed front image in PDF
  const frontImage = await pdfDoc.embedJpg(frontImageData);
  const { width: frontWidth, height: frontHeight } = frontPage.getSize();
  frontPage.drawImage(frontImage, {
    x: 0,
    y: 0,
    width: frontWidth,
    height: frontHeight,
  });
  console.log('Front image embedded successfully.');
  console.log('Embedding inside image in PDF...');

  // Embed inside image in PDF
  const insideImage = await pdfDoc.embedJpg(insideImageData);
  const { width: insideWidth, height: insideHeight } = backPage.getSize();
  backPage.drawImage(insideImage, {
    x: 0,
    y: 0,
    width: insideWidth,
    height: insideHeight,
  });
  console.log('Inside image embedded successfully.');
  console.log('Saving PDF...');

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}