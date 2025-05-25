import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ButtonProps, Button } from "@/components/ui2/button"

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  pageCount: number
  currentPage: number
  onPageChange: (page: number) => void
  siblingCount?: number
  className?: string
}

export const Pagination = ({
  pageCount,
  currentPage,
  onPageChange,
  siblingCount = 1,
  className,
  ...props
}: PaginationProps) => {
  const paginationRange = React.useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 3
    if (totalPageNumbers >= pageCount) {
      return range(1, pageCount)
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      pageCount
    )

    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < pageCount - 2

    const firstPageIndex = 1
    const lastPageIndex = pageCount

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      const leftRange = range(1, leftItemCount)
      return [...leftRange, "DOTS", pageCount]
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount
      const rightRange = range(pageCount - rightItemCount + 1, pageCount)
      return [firstPageIndex, "DOTS", ...rightRange]
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex)
      return [firstPageIndex, "DOTS", ...middleRange, "DOTS", lastPageIndex]
    }
  }, [pageCount, currentPage, siblingCount])

  return (
    <div
      className={cn("flex w-full items-center justify-between", className)}
      {...props}
    >
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Go to previous page</span>
        </Button>
        {paginationRange?.map((page, index) => {
          if (page === "DOTS") {
            return (
              <div key={index} className="px-4">
                <MoreHorizontal className="h-4 w-4" />
              </div>
            )
          }
          return (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "h-8 w-8 p-0",
                currentPage === page &&
                  "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </Button>
          )
        })}
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Go to next page</span>
        </Button>
      </div>
    </div>
  )
}

function range(start: number, end: number): number[] {
  const length = end - start + 1
  return Array.from({ length }, (_, i) => start + i)
}
