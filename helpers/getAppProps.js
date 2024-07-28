import { getSession } from 'next-auth/react'
import clientPromise from '../lib/mongodb'
import { DB_NAME, POSTS_COLLECTION, USERS_COLLECTION } from '../constants/constants'

export const getAppProps = async (context) => {
  const userSession = await getSession(context)
  const client = await clientPromise
  const db = client.db(DB_NAME)
  const user = await db.collection(USERS_COLLECTION).findOne({
    auth0Mail: userSession.user.email,
  })
  if (!user) {
    return {
      availableTokens: 0,
      posts: [],
    }
  }

  const posts = await db
    .collection(POSTS_COLLECTION)
    .find({
      userId: user._id,
    })
    .sort({
      created: -1,
    })
    .toArray()

  return {
    availableTokens: user.availableTokens,
    posts: posts.map(({ created, _id, userId, ...rest }) => ({
      _id: _id.toString(),
      created: created.toString(),
      ...rest,
    })),
    postId: context.params?.postId || null,
  }
}
