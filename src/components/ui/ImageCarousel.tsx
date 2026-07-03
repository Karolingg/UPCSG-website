import { useEffect, useState, type MouseEvent } from 'react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'

interface ImageCarouselProps {
  images: string[]
  /** Height for the empty-state placeholder only (images size to their aspect). */
  placeholderHeightClass?: string
  className?: string
}

const arrowClass =
  'absolute top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-ink/70 text-paper border border-white/15 hover:bg-ink transition-colors cursor-pointer z-10'

export default function ImageCarousel({
  images,
  placeholderHeightClass = 'h-64',
  className = '',
}: ImageCarouselProps) {
  const [index, setIndex] = useState(0)
  const count = images.length

  // Clamp if the image list shrinks
  useEffect(() => {
    if (index > count - 1) setIndex(Math.max(0, count - 1))
  }, [count, index])

  if (count === 0) {
    return (
      <div
        className={`${placeholderHeightClass} w-full bg-ink-soft flex items-center justify-center text-paper/20 ${className}`}
      >
        <ImageOff size={40} />
      </div>
    )
  }

  const safe = Math.min(index, count - 1)

  function stop(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
  }
  function go(dir: -1 | 1, e: MouseEvent) {
    stop(e)
    setIndex(i => (i + dir + count) % count)
  }

  return (
    <div className={`relative w-full bg-ink-soft ${className}`}>
      {/* Image sizes to its own aspect ratio — whole image, never cropped */}
      <img src={images[safe]} alt="" className="w-full h-auto block max-h-[80vh] mx-auto" />

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={e => go(-1, e)}
            className={`${arrowClass} left-3`}
            aria-label="Previous image"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={e => go(1, e)}
            className={`${arrowClass} right-3`}
            aria-label="Next image"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute top-3 right-3 bg-ink/70 text-paper/80 text-[11px] font-semibold rounded-full px-2 py-0.5">
            {safe + 1} / {count}
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={e => {
                  stop(e)
                  setIndex(i)
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === safe ? 'w-5 bg-gold' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
