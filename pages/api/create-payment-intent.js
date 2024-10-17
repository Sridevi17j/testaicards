import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { amount, planName } = req.body

      if (!amount || !planName) {
        return res.status(400).json({ error: 'Missing required parameters' })
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'inr',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          planName,
        },
      })

      res.status(200).json({ clientSecret: paymentIntent.client_secret })
    } catch (error) {
      console.error('Error creating PaymentIntent:', error)
      res.status(500).json({ error: 'Error creating PaymentIntent' })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}