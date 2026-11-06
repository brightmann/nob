import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/utils/cn'

type PagerProps = {
  page: number
  totalPages: number
}

const hrefFor = (page: number) => (page === 1 ? '/' : `/?page=${page}`)

// Numbered pages with ellipsis for gaps: 1 … p-1 p p+1 … N
const pageItems = (page: number, totalPages: number): Array<number | '…'> => {
  const pages = new Set([1, totalPages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= totalPages))
  const sorted = [...pages].sort((a, b) => a - b)
  const items: Array<number | '…'> = []

  for (const [i, n] of sorted.entries()) {
    const prev = sorted[i - 1]
    if (i > 0 && prev !== undefined && n - prev > 1) {
      items.push('…')
    }
    items.push(n)
  }

  return items
}

const Pager = (props: PagerProps) => {
  const { page, totalPages } = props

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav aria-label='Pagination' className='mt-6 flex items-center justify-center gap-1'>
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <ChevronLeftIcon className='size-4' />
          Previous
        </Link>
      ) : (
        <span className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'opacity-50')}>
          <ChevronLeftIcon className='size-4' />
          Previous
        </span>
      )}
      {pageItems(page, totalPages).map((item, i) =>
        item === '…' ? (
          <span key={`ellipsis-${i}`} className='px-2 text-sm text-muted-foreground'>
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={item === page ? 'page' : undefined}
            className={buttonVariants({
              variant: item === page ? 'default' : 'outline',
              size: 'sm'
            })}
          >
            {item}
          </Link>
        )
      )}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          Next
          <ChevronRightIcon className='size-4' />
        </Link>
      ) : (
        <span className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'opacity-50')}>
          Next
          <ChevronRightIcon className='size-4' />
        </span>
      )}
    </nav>
  )
}

export default Pager
