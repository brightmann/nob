import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import Posts from '@/components/posts'
import PostsPlaceholder from '@/components/posts-placeholder'
import { getPostsCount, POSTS_PER_PAGE } from '@/queries/get-posts'
import { range } from '@/utils/range'

const HomePage = async (props: PageProps<'/'>) => {
  const { searchParams } = props
  const params = await searchParams
  const raw = params.page
  const param = Array.isArray(raw) ? raw[0] : raw
  const page = param === undefined ? 1 : Number.parseInt(param, 10)

  const { total } = await getPostsCount()
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE))

  // Canonicalize: /?page=1 -> /, invalid -> /, beyond the last page -> last page.
  if (Number.isNaN(page) || page < 1 || (param !== undefined && page === 1)) {
    redirect('/')
  }
  if (page > totalPages) {
    redirect(totalPages === 1 ? '/' : `/?page=${totalPages}`)
  }

  return (
    <Suspense
      fallback={range(POSTS_PER_PAGE).map((i) => (
        <PostsPlaceholder key={i} />
      ))}
    >
      <Posts page={page} totalPages={totalPages} />
    </Suspense>
  )
}

export default HomePage
