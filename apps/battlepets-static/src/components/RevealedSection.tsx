import { useEffect, useRef, useState } from 'react'

import globalStyles from '@/common/global.module.scss'

export const RevealedSection: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => {
  const sectionRef = useRef<HTMLDivElement>(null)

  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    if (sectionRef.current) {
      const observer = new IntersectionObserver(([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      })
      observer.observe(sectionRef.current)

      return () => observer.disconnect()
    }
  }, [])

  return (
    <section
      {...rest}
      ref={sectionRef}
      className={`${className} ${isIntersecting ? globalStyles.revealedSectionVisible : ''}`}
    />
  )
}
