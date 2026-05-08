import { useState, useEffect } from 'react'

export function useIsLandscape() {
  const [landscape, setLandscape] = useState(
    () => typeof window !== 'undefined' && window.innerWidth > window.innerHeight
  )

  useEffect(() => {
    const check = () => setLandscape(window.innerWidth > window.innerHeight)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return landscape
}

export function useScreenWidth() {
  const [width, setWidth] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth : 400
  )

  useEffect(() => {
    const check = () => setWidth(window.innerWidth)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return width
}
