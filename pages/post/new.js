import { getSession } from 'next-auth/react'
import { useState } from 'react'
import { AppLayout } from '../../components/AppLayout/AppLayout'
import { useRouter } from 'next/router'
import { getAppProps } from '../../helpers/getAppProps'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBrain } from '@fortawesome/free-solid-svg-icons'

const NewPost = () => {
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`/api/generatePost`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ topic, keywords }),
      })
      const json = await response.json()
      if (json?.postId) {
        router.push(`/post/${json.postId}`)
      }
    } catch (e) {
      setLoading(false)
    }
  }

  return (
    <div className='h-screen overflow-hidden'>
      {loading && (
        <div className='text-green-500 flex h-full animate-pulse w-full flex-col justify-center items-center'>
          <FontAwesomeIcon icon={faBrain} className='text-8xl' />
          <h5>Генерируем ваш пост...</h5>
        </div>
      )}
      {!loading && (
        <div className='w-full h-full flex flex-col overflow-auto'>
          <form
            onSubmit={handleSubmit}
            className='m-auto w-full max-w-screen-sm bg-slate-100 p-4 rounded-md shadow-xl border border-slate-200 shadow-slate-200'
          >
            <div>
              <label htmlFor=''>
                <strong>Тема поста:</strong>
              </label>
              <textarea
                className='resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm'
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                maxLength={80}
              />
            </div>
            <div>
              <label htmlFor=''>
                <strong>Ключевые слова:</strong>
              </label>
              <textarea
                className='resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm'
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                maxLength={80}
              />
              <small>Разделите слова запятыми</small>
            </div>
            <button type='submit' className='btn' disabled={!topic.trim() || !keywords.trim()}>
              Сгенерировать
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

NewPost.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>
}

export async function getServerSideProps(context) {
  const session = await getSession(context)
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  const props = await getAppProps(context)
  if (!props.availableTokens) {
    return {
      redirect: {
        destination: '/token-topup',
        permanent: false,
      },
    }
  }
  return {
    props,
  }
}

export default NewPost
