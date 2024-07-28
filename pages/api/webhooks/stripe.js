import Cors from 'micro-cors'
import stripeInit from 'stripe'
import verifyStripe from '@webdeveducation/next-verify-stripe'
import clientPromise from '../../../lib/mongodb'
import { DB_NAME, USERS_COLLECTION } from '../../../constants/constants'

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
})

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = stripeInit(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

const handler = async (req, res) => {
  if (req.method === 'POST') {
    let event
    try {
      event = await verifyStripe({
        req,
        stripe,
        endpointSecret,
      })
    } catch (e) {
      console.log('Error verifying Stripe signature:', e)
    }
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const client = await clientPromise
        const db = client.db(DB_NAME)

        const paymentIntent = event.data.object
        const auth0Mail = paymentIntent.metadata.email

        await db.collection(USERS_COLLECTION).updateOne(
          {
            auth0Mail,
          },
          {
            $inc: {
              availableTokens: 10,
            },
            $setOnInsert: {
              auth0Mail,
            },
          },
          {
            upsert: true,
          }
        )
      }
      default:
        console.log('UNHANDLED EVENT: ', event.type)
    }
    res.status(200).json({ received: true })
  }
}

export default cors(handler)
