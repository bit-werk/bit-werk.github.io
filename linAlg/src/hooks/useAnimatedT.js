import { useEffect, useRef, useState, useCallback } from 'react'

// Smoothstep easing for pleasant transitions.
const ease = (t) => t * t * (3 - 2 * t)

/**
 * Drives a value `t` (0..1) for animating "apply transformation" transitions.
 * Returns { t, play, reset, playing } where `t` is already eased.
 */
export function useAnimatedT(duration = 900) {
  const [raw, setRaw] = useState(0)
  const [playing, setPlaying] = useState(false)
  const frame = useRef(0)
  const dir = useRef(1)

  const stop = () => cancelAnimationFrame(frame.current)

  const animate = useCallback(
    (target) => {
      stop()
      setPlaying(true)
      const start = performance.now()
      const from = dir.current === 1 ? 0 : 1
      const step = (now) => {
        const k = Math.min((now - start) / duration, 1)
        const v = from + (target - from) * k
        setRaw(v)
        if (k < 1) {
          frame.current = requestAnimationFrame(step)
        } else {
          setPlaying(false)
        }
      }
      frame.current = requestAnimationFrame(step)
    },
    [duration],
  )

  const play = useCallback(() => {
    dir.current = 1
    animate(1)
  }, [animate])

  const reset = useCallback(() => {
    dir.current = 0
    animate(0)
  }, [animate])

  const toggle = useCallback(() => {
    if (raw > 0.5) reset()
    else play()
  }, [raw, play, reset])

  useEffect(() => () => stop(), [])

  return { t: ease(raw), raw, play, reset, toggle, playing, setRaw }
}
