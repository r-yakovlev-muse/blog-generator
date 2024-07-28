import { getSession } from 'next-auth/react'
import { AppLayout } from '../components/AppLayout'
import { getAppProps } from '../helpers/getAppProps'

const Success = () => {
  return (
    <div className='h-screen overflow-hidden flex justify-center items-center'>
      <div className='m-auto w-full max-w-screen-sm text-center'>
        <h1>Спасибо за покупку!</h1>
      </div>
    </div>
  )
}

Success.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>
}

export async function getServerSideProps(context) {
  const props = await getAppProps(context)
  const session = await getSession(context)
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
export default Success
