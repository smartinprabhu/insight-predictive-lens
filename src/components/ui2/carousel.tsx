import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui2/button"

interface CarouselProps extends React.HTMLAttributes<HTMLElement> {
  opts?: Parameters<typeof useEmblaCarousel>[0]
  plugins?: Parameters<typeof useEmblaCarousel>[1]
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, opts, plugins, children, ...props }, ref) => {
    const [emblaRef, emblaApi] = useEmblaCarousel(opts, plugins)

    const [prevBtnEnabled, setPrevBtnEnabled] = React.useState(false)
    const [nextBtnEnabled, setNextBtnEnabled] = React.useState(false)

    const onSelect = React.useCallback((emblaApi: UseEmblaCarouselType) => {
      if (!emblaApi) return
      setPrevBtnEnabled(emblaApi.canScrollPrev())
      setNextBtnEnabled(emblaApi.canScrollNext())
    }, [])

    React.useEffect(() => {
      if (!emblaApi) return
      onSelect(emblaApi)
      emblaApi.on("select", onSelect)
    }, [emblaApi, onSelect])

    return (
      <div className={cn("relative", className)} {...props} ref={ref}>
        <div className="overflow-hidden">
          <div className="flex" ref={emblaRef}>
            {children}
          </div>
        </div>
        <CarouselButtons emblaApi={emblaApi} prevBtnEnabled={prevBtnEnabled} nextBtnEnabled={nextBtnEnabled} />
      </div>
    )
  }
)
Carousel.displayName = "Carousel"

interface CarouselItemProps extends React.HTMLAttributes<HTMLElement> {}

const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className={cn("relative min-w-0 flex-[0_0_100%]", className)} {...props} ref={ref}>
        {children}
      </div>
    )
  }
)
CarouselItem.displayName = "CarouselItem"

interface CarouselButtonsProps {
  emblaApi?: UseEmblaCarouselType
  prevBtnEnabled: boolean
  nextBtnEnabled: boolean
}

const CarouselButtons = ({ emblaApi, prevBtnEnabled, nextBtnEnabled }: CarouselButtonsProps) => {
  return (
    <div className="absolute top-1/2 z-10 flex w-full items-center justify-between px-4">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full bg-background/50 hover:bg-background"
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!prevBtnEnabled}
        aria-label="Previous slide"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full bg-background/50 hover:bg-background"
        onClick={() => emblaApi?.scrollNext()}
        disabled={!nextBtnEnabled}
        aria-label="Next slide"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export { Carousel, CarouselItem }
