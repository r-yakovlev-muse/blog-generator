import { getSession } from 'next-auth/react'
import stripeInit from 'stripe'

const stripe = stripeInit(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  const { user } = await getSession({ req })

  const lineItems = [
    {
      price: process.env.STRIPE_PRODUCT_PRICE_ID,
      quantity: 1,
    },
  ]

  const protocol = process.env.NODE_ENV === 'development' ? 'http://' : 'https://'
  const host = req.headers.host

  const checkoutSession = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: `${protocol}${host}/success`,
    payment_intent_data: {
      metadata: {
        email: user.email,
      },
    },
    metadata: {
      email: user.email,
    },
  })

  res.status(200).json({ session: checkoutSession })
}
