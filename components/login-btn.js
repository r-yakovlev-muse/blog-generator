import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'

export default function LoginBtn() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        <div className='min-w-[50px]'>
          <Image
            src={session.user.image}
            alt={session.user.name}
            height={50}
            width={50}
            className='rounded-full'
          />
        </div>
        <div className='flex-1'>
          <div className='font-bold'>{session.user.email}</div>
          <div className='text-sm'>
            <button onClick={() => signOut('google', { callbackUrl: '/' })}>Выйти</button>
          </div>
        </div>
      </>
    )
  }
}
