import { useRef, useState, useCallback, useEffect } from 'react'
import { CanvasTransform } from '../types'

const MIN_SCALE = 0.2
const MAX_SCALE = 3
const MOMENTUM_FRICTION = 0.88
const DEFAULT_TRANSFORM: CanvasTransform = { x: 30, y: 20, scale: 0.62 }

export function useCanvasControls(containerRef: React.RefObject<HTMLDivElement>) {
  const [transform, setTransform] = useState<CanvasTransform>(DEFAULT_TRANSFORM)
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  const animFrame = useRef<number>(0)
  const transformRef = useRef(DEFAULT_TRANSFORM)

  const updateTransform = useCallback((t: CanvasTransform) => {
    transformRef.current = t
    setTransform(t)
  }, [])

  const stopMomentum = useCallback(() => {
    cancelAnimationFrame(animFrame.current)
    velocity.current = { x: 0, y: 0 }
  }, [])

  const applyMomentum = useCallback(() => {
    const tick = () => {
      velocity.current.x *= MOMENTUM_FRICTION
      velocity.current.y *= MOMENTUM_FRICTION
      if (Math.abs(velocity.current.x) < 0.3 && Math.abs(velocity.current.y) < 0.3) return
      updateTransform({
        ...transformRef.current,
        x: transformRef.current.x + velocity.current.x,
        y: transformRef.current.y + velocity.current.y,
      })
      animFrame.current = requestAnimationFrame(tick)
    }
    animFrame.current = requestAnimationFrame(tick)
  }, [updateTransform])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-frame]')) return
    stopMomentum()
    isDragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    velocity.current = { x: 0, y: 0 }
  }, [stopMomentum])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    velocity.current = { x: dx, y: dy }
    lastPos.current = { x: e.clientX, y: e.clientY }
    updateTransform({
      ...transformRef.current,
      x: transformRef.current.x + dx,
      y: transformRef.current.y + dy,
    })
  }, [updateTransform])

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    applyMomentum()
  }, [applyMomentum])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const cursorX = e.clientX - rect.left
    const cursorY = e.clientY - rect.top
    const delta = e.deltaY < 0 ? 1.08 : 0.93
    const t = transformRef.current
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale * delta))
    const scaleDiff = newScale / t.scale
    const newX = cursorX - scaleDiff * (cursorX - t.x)
    const newY = cursorY - scaleDiff * (cursorY - t.y)
    updateTransform({ x: newX, y: newY, scale: newScale })
  }, [containerRef, updateTransform])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [containerRef, handleWheel])

  const zoomIn = useCallback(() => {
    const t = transformRef.current
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    const newScale = Math.min(MAX_SCALE, t.scale * 1.2)
    const scaleDiff = newScale / t.scale
    updateTransform({
      x: cx - scaleDiff * (cx - t.x),
      y: cy - scaleDiff * (cy - t.y),
      scale: newScale,
    })
  }, [containerRef, updateTransform])

  const zoomOut = useCallback(() => {
    const t = transformRef.current
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    const newScale = Math.max(MIN_SCALE, t.scale / 1.2)
    const scaleDiff = newScale / t.scale
    updateTransform({
      x: cx - scaleDiff * (cx - t.x),
      y: cy - scaleDiff * (cy - t.y),
      scale: newScale,
    })
  }, [containerRef, updateTransform])

  const resetView = useCallback(() => {
    stopMomentum()
    updateTransform(DEFAULT_TRANSFORM)
  }, [stopMomentum, updateTransform])

  return {
    transform,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomIn,
    zoomOut,
    resetView,
    isDragging,
  }
}
