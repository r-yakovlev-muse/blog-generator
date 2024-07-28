import { getSession } from 'next-auth/react'
import { AppLayout } from '../components/AppLayout'
import { getAppProps } from '../helpers/getAppProps'

const TokenTopup = (props) => {
  const handleClick = async (e) => {
    e.preventDefault()
    const result = await fetch(`/api/addTokens`, {
      method: 'POST',
    })
    const json = await result.json()
    window.location.href = json.session.url
  }

  return (
    <div className='h-screen overflow-hidden flex justify-center items-center'>
      <div className='m-auto w-full max-w-screen-sm text-center'>
        <h2>У вас {props.availableTokens} токенов</h2>
        <button className='btn' onClick={handleClick}>
          Купить токены
        </button>
      </div>
    </div>
  )
}

TokenTopup.getLayout = function getLayout(page, pageProps) {
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
  return {
    props,
  }
}
export default TokenTopup
