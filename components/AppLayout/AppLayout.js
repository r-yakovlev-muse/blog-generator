import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import LoginBtn from '../login-btn'
import Link from 'next/link'
import { faCoins } from '@fortawesome/free-solid-svg-icons'
import { Logo } from '../Logo'

export const AppLayout = ({ children, availableTokens, posts, postId }) => {
  return (
    <div className='grid grid-cols-[300px_1fr] max-h-screen'>
      <div className='flex flex-col text-white overflow-hidden'>
        <div className='bg-slate-800 px-2'>
          <Logo />
          <Link className='btn' href='/post/new'>
            Создать новый пост
          </Link>
          <Link className='block mt-2 text-center' href='/token-topup'>
            <FontAwesomeIcon icon={faCoins} className='text-yellow-500' />
            <span className='pl-1'>{availableTokens} токенов доступно</span>
          </Link>
        </div>
        <div className='px-4 flex-1 overflow-auto bg-gradient-to-b from-slate-800 to-cyan-800'>
          <div className='mt-10'>
            {posts.length === 0 ? null : <h3>Ваши посты:</h3>}
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/post/${post._id}`}
                className={`py-1 border border-white/0 block text-ellipsis overflow-hidden whitespace-nowrap my-1 px-2 bg-white/10 cursor-pointer rounded-sm ${
                  postId === post._id ? 'bg-white/20 border-white' : ''
                }`}
              >
                {post.topic}
              </Link>
            ))}
          </div>
        </div>
        <div className='bg-cyan-800 flex items-center gap-2 border-t border-t-black/50 h-20 px-2'>
          <LoginBtn />
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}
