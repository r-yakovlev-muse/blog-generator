import { getSession } from 'next-auth/react'
import { getAppProps } from '../../helpers/getAppProps'
import { AppLayout } from '../../components/AppLayout'
import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHashtag } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { useRouter } from 'next/router'

const Post = (props) => {
  const router = useRouter()
  const { error, postContent, title, metaDescription, keywords } = props
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDeletePost = async () => {
    try {
      const responce = await fetch(`/api/deletePost`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ postId: props.id }),
      })
      const json = await responce.json()
      if (json.success) {
        router.replace(`/post/new`)
      }
    } catch (e) {}
  }

  return (
    <div className='overflow-auto max-h-screen'>
      <div className='max-w-screen-lg mx-auto'>
        <div className='text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm'>
          Название статьи и описание
        </div>
        <div className='p-4 my-2 border border-stone-200 rounded-md'>
          <div className='text-blue-600 text-2xl font-bold'>{title}</div>
          <div className='mt-2'>{metaDescription}</div>
        </div>
        <div className='text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm'>Ключевые слова</div>
        <div className='flex flex-wrap pt-2 gap-1'>
          {keywords.split(',').map((keyword) => (
            <div className='p-2 rounded-full bg-slate-800 text-white' key={keyword}>
              <FontAwesomeIcon icon={faHashtag} />
              {keyword}
            </div>
          ))}
        </div>
      </div>
      {error ? (
        <div className='max-w-screen-lg mx-auto my-5'>
          <div className='text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm'>Содержание поста</div>
          <h2>
            К сожалению нейронка от яндекса не может стабильно сгенерить JSON, потому что вот:
          </h2>
          <h3>{error}</h3>
          <h4>Поэтому вот такой пост получился:</h4>
          <br></br>
          {postContent}
          <button onClick={handleDeletePost} className='btn bg-red-600 hover:bg-red-700'>
            Удалить пост
          </button>
        </div>
      ) : (
        <div className='max-w-screen-lg mx-auto'>
          <div className='text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm'>Содержание поста</div>
          <div dangerouslySetInnerHTML={{ __html: postContent }} />
          <div className='my-4'>
            {!showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className='btn bg-red-600 hover:bg-red-700'
              >
                Удалить пост
              </button>
            )}
            {showDeleteConfirm && (
              <div>
                <p className='p-2 bg-red-300 text-center'>Вы уверены, что хотите удалить пост?</p>
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className='btn bg-stone-600 hover:bg-stone-700'
                  >
                    Отменить
                  </button>
                  <button onClick={handleDeletePost} className='btn bg-red-600 hover:bg-red-700'>
                    Удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

Post.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>
}

export async function getServerSideProps(context) {
  const session = await getSession(context)
  const props = await getAppProps(context)
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const client = await clientPromise
  const db = client.db('testBlog')
  const user = await db.collection('users').findOne({
    auth0Mail: session.user.email,
  })
  const post = await db.collection('posts').findOne({
    _id: new ObjectId(context.params.postId),
    userId: user._id,
  })
  if (!post) {
    return {
      redirect: {
        destination: '/post/new',
        permanent: false,
      },
    }
  }
  const { postContent, title, metaDescription, keywords, error } = post
  return {
    props: {
      id: context.params.postId,
      error,
      postContent,
      title,
      metaDescription,
      keywords,
      session,
      ...props,
    },
  }
}
export default Post
