import { getSession } from 'next-auth/react'
import clientPromise from '../../lib/mongodb'
import { DB_NAME, POSTS_COLLECTION, USERS_COLLECTION } from '../../constants/constants'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const { postId } = req.body
  delete req.body
  try {
    const { user } = await getSession({ req })
    const client = await clientPromise
    const db = client.db(DB_NAME)

    const userProfile = await db.collection(USERS_COLLECTION).findOne({
      auth0Mail: user.email,
    })

    await db.collection(POSTS_COLLECTION).deleteOne({
      userId: userProfile._id,
      _id: new ObjectId(postId),
    })
    res.status(200).json({ success: true })
  } catch (e) {
    console.log('ERROR DELETE POST', e)
  }

  return
}
