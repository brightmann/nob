import PostCard from '@/components/post-card'
import { getCurrentUser } from '@/lib/auth'
import { getPosts, POSTS_PER_PAGE } from '@/queries/get-posts'

import Pager from './pager'

type PostsProps = {
  page: number
  totalPages: number
}

const Posts = async (props: PostsProps) => {
  const { page, totalPages } = props
  const user = await getCurrentUser()
  const { posts } = await getPosts({ page, pageSize: POSTS_PER_PAGE })

  if (posts.length === 0) {
    return <div className='text-center'>No posts yet.</div>
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} user={user} />
      ))}
      <Pager page={page} totalPages={totalPages} />
    </div>
  )
}

export default Posts
