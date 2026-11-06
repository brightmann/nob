import { and, count, desc, eq } from 'drizzle-orm'

import { db } from '@/db'
import { posts } from '@/db/schema'

export const POSTS_PER_PAGE = 5

const publishedPublic = and(eq(posts.published, true), eq(posts.visibility, 'public'))

export const getPostsCount = async () => {
  const [row] = await db.select({ total: count() }).from(posts).where(publishedPublic)

  return { total: row?.total ?? 0 }
}

export const getPosts = async ({ page, pageSize }: { page: number; pageSize: number }) => {
  const result = await db.query.posts.findMany({
    where: publishedPublic,
    columns: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      published: true
    },
    with: {
      user: {
        columns: {
          name: true,
          image: true,
          id: true
        }
      },
      likes: {
        columns: {
          id: true
        }
      }
    },
    orderBy: desc(posts.createdAt),
    limit: pageSize,
    offset: (page - 1) * pageSize
  })

  return {
    posts: result
  }
}
