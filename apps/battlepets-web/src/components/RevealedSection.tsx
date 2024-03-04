import { useEffect, useRef, useState } from 'react'

import globalStyles from '@/common/global.module.scss'

export const RevealedSection: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => {
  const sectionRef = useRef<HTMLDivElement>(null)

  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    if (sectionRef.current && !hasIntersected) {
      const observer = new IntersectionObserver(([entry]) => {
        setHasIntersected(entry.isIntersecting)
      })
      observer.observe(sectionRef.current)

      return () => observer.disconnect()
    }
  }, [hasIntersected])

  return (
    <section
      {...rest}
      ref={sectionRef}
      className={`${className ?? ''} ${hasIntersected ? globalStyles.revealedSectionVisible : ''}`}
    />
  )
}
