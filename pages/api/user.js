export default async function handler(req, res) {
  const { method, query, body } = req;
  console.log('API Route Called. Method:', method);

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const databaseId = process.env.D1_DATABASE_ID;

  console.log('Environment Variables:', { accountId, databaseId }); // Don't log the API token for security reasons

  const headers = {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };

  if (method === 'GET') {
    const { email } = query;
    console.log('GET request received for email:', email);

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const sql = `SELECT * FROM users WHERE email = ?`;
    const params = [email];

    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sql, params }),
      });

      const data = await response.json();

      if (data.success && data.result && data.result[0] && data.result[0].results.length > 0) {
        res.status(200).json(data.result[0].results[0]);
      } else {
        res.status(200).json({ message: 'User not found', newUser: true });
      }
    } catch (error) {
      console.error('Error querying database:', error);
      res.status(500).json({ message: 'Error querying database', error: error.message });
    }
  } else if (method === 'POST') {
    const { email, name, planName, cardsRemaining } = body;
    console.log('Received data:', { email, name, planName, cardsRemaining });

    if (!email || !name || !planName || cardsRemaining === undefined) {
      console.error('Missing required data:', { email, name, planName, cardsRemaining });
      return res.status(400).json({ message: 'Missing required data' });
    }

    const sql = `INSERT INTO users (email, name, plan_name, cards_remaining, date_created) 
                 VALUES (?, ?, ?, ?, ?) 
                 ON CONFLICT(email) DO UPDATE SET 
                 name = ?, plan_name = ?, cards_remaining = ?, date_created = ?
                 RETURNING *`;
    const now = new Date().toISOString();
    const params = [email, name, planName, cardsRemaining, now, name, planName, cardsRemaining, now];

    console.log('SQL query:', sql);
    console.log('Params:', params);

    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sql, params }),
      });

      const data = await response.json();
      console.log('D1 API response for POST:', data);

      if (data.success && data.result && data.result[0] && data.result[0].results.length > 0) {
        res.status(200).json(data.result[0].results[0]);
      } else {
        console.error('D1 API error:', data.errors);
        res.status(500).json({ message: 'Error storing user data', error: data.errors });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ message: 'Error storing user data', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}