import { DB_NAME, USERS_COLLECTION } from '../../constants/constants'
import { parseJson } from '../../helpers/helpers'
import clientPromise from '../../lib/mongodb'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const { topic, keywords } = req.body
  delete req.body
  const { user } = await getSession({ req })

  if (!topic || !keywords) {
    res.status(422)
    return
  }

  if (topic.length > 80 || keywords.length > 80) {
    res.status(422)
    return
  }

  const client = await clientPromise
  const db = client.db(DB_NAME)
  const userProfile = await db.collection(USERS_COLLECTION).findOne({
    auth0Mail: user.email,
  })

  if (!userProfile?.availableTokens) {
    res.status(403).json({ message: 'No tokens' })
    return
  }

  const folderKey = process.env.X_FOLDER_ID
  const apiKey = process.env.YANDEX_API_KEY

  const url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
  const body = {
    modelUri: process.env.YANDEX_API_MODEL,
    completionOptions: {
      stream: false,
      temperature: 0.3,
      maxTokens: '3500',
    },
    messages: [
      {
        role: 'system',
        text: 'Ты - генератор постов для блога',
      },
      {
        role: 'user',
        text: `Напиши длинный и детальный SEO-friendly пост в блоге о ${topic},
        который нацелен на следующие теги, разделенные запятой: ${keywords}.
        В ответе должны быть только данные в заданном формате JSON, без вводных фраз и объяснений.
        Не используй разметку Markdown!
        Ответ в формате JSON:
            "postContent": "содержание поста должно быть в двойных кавычках, отформатированное в HTML разметку в которой
            могут быть только такие теги: p, h1, h2, h3, h4, h5, h6, strong, li, ol, ul",
            "title": "заголовок поста",
            "metaDescription: "краткое содержание поста",
        Ответ должен быть в скобках {}
        `,
      },
    ],
  }

  const postContentResponse = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      Authorization: `Api-Key ${apiKey}`,
      'x-folder-id': folderKey,
    },
  })

  const json = await postContentResponse.json()
  const post = json.result.alternatives[0]?.message.text.split('\n').join('')
  const { title, metaDescription, postContent, error } = parseJson(post)

  await db.collection('users').updateOne(
    {
      auth0Mail: user.email,
    },
    {
      $inc: {
        availableTokens: -1,
      },
    }
  )

  const dbPost = await db.collection('posts').insertOne({
    postContent: postContent,
    error: error,
    title: title,
    metaDescription: metaDescription,
    topic,
    keywords,
    userId: userProfile._id,
    created: new Date(),
  })

  res.status(200).json({ postId: dbPost.insertedId })
}
