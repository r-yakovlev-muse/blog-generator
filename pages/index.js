import Image from 'next/image'
import HeroImage from '../public/hero.webp'
import { signIn } from 'next-auth/react'
import { Logo } from '../components/Logo'

export const Home = () => {
  return (
    <div className='w-screen h-screen overflow-hidden flex justify-center items-center'>
      <Image src={HeroImage} alt='Hero' fill className='absolute' />
      <div className='relative z-10 text-white px-10 py-5 text-center max-w-screen-sm bg-slate-900/90 rounded-md backdrop-blur-sm'>
        <Logo />
        <p>The AI-powered SAAS solution to generate SEO-optimized blog posts in minutes</p>
        <button className='btn' onClick={() => signIn('google', { callbackUrl: '/post/new' })}>
          Begin
        </button>
      </div>
    </div>
  )
}

export default Home
