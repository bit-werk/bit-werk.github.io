import { useEffect, useRef, useState, useCallback } from 'react'

// Smoothstep easing for pleasant transitions.
const ease = (t) => t * t * (3 - 2 * t)

/**
 * Drives a value `t` (0..1) for animating "apply transformation" transitions.
 * Returns { t, play, reset, playing } where `t` is already eased.
 * Animations always start from the *current* value, so play/reset/scrub never
 * jump to an endpoint first.
 */
export function useAnimatedT(duration = 900) {
  const [raw, setRawState] = useState(0)
  const [playing, setPlaying] = useState(false)
  const frame = useRef(0)
  const rawRef = useRef(0)

  const setRaw = useCallback((v) => {
    rawRef.current = v
    setRawState(v)
  }, [])

  const stop = () => cancelAnimationFrame(frame.current)

  const animate = useCallback(
    (target) => {
      stop()
      setPlaying(true)
      const start = performance.now()
      const from = rawRef.current // begin from wherever we actually are
      const step = (now) => {
        const k = Math.min((now - start) / duration, 1)
        setRaw(from + (target - from) * k)
        if (k < 1) {
          frame.current = requestAnimationFrame(step)
        } else {
          setPlaying(false)
        }
      }
      frame.current = requestAnimationFrame(step)
    },
    [duration, setRaw],
  )

  const play = useCallback(() => animate(1), [animate])
  const reset = useCallback(() => animate(0), [animate])
  const toggle = useCallback(() => {
    if (rawRef.current > 0.5) reset()
    else play()
  }, [play, reset])

  useEffect(() => () => stop(), [])

  return { t: ease(raw), raw, play, reset, toggle, playing, setRaw }
}
