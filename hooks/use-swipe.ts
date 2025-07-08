"use client"

import type React from "react"

import { useRef, useCallback } from "react"

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface TouchPosition {
  x: number
  y: number
}

export function useSwipe(handlers: SwipeHandlers, threshold = 50) {
  const touchStart = useRef<TouchPosition | null>(null)
  const touchEnd = useRef<TouchPosition | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEnd.current = null
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return

    const distanceX = touchStart.current.x - touchEnd.current.x
    const distanceY = touchStart.current.y - touchEnd.current.y
    const isLeftSwipe = distanceX > threshold
    const isRightSwipe = distanceX < -threshold
    const isUpSwipe = distanceY > threshold
    const isDownSwipe = distanceY < -threshold

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Horizontal swipe
      if (isLeftSwipe && handlers.onSwipeLeft) {
        handlers.onSwipeLeft()
      }
      if (isRightSwipe && handlers.onSwipeRight) {
        handlers.onSwipeRight()
      }
    } else {
      // Vertical swipe
      if (isUpSwipe && handlers.onSwipeUp) {
        handlers.onSwipeUp()
      }
      if (isDownSwipe && handlers.onSwipeDown) {
        handlers.onSwipeDown()
      }
    }
  }, [handlers, threshold])

  // Mouse events for desktop
  const mouseStart = useRef<TouchPosition | null>(null)
  const mouseEnd = useRef<TouchPosition | null>(null)
  const isDragging = useRef(false)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    mouseEnd.current = null
    mouseStart.current = {
      x: e.clientX,
      y: e.clientY,
    }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    mouseEnd.current = {
      x: e.clientX,
      y: e.clientY,
    }
  }, [])

  const onMouseUp = useCallback(() => {
    if (!isDragging.current || !mouseStart.current || !mouseEnd.current) {
      isDragging.current = false
      return
    }

    const distanceX = mouseStart.current.x - mouseEnd.current.x
    const distanceY = mouseStart.current.y - mouseEnd.current.y
    const isLeftSwipe = distanceX > threshold
    const isRightSwipe = distanceX < -threshold
    const isUpSwipe = distanceY > threshold
    const isDownSwipe = distanceY < -threshold

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Horizontal swipe
      if (isLeftSwipe && handlers.onSwipeLeft) {
        handlers.onSwipeLeft()
      }
      if (isRightSwipe && handlers.onSwipeRight) {
        handlers.onSwipeRight()
      }
    } else {
      // Vertical swipe
      if (isUpSwipe && handlers.onSwipeUp) {
        handlers.onSwipeUp()
      }
      if (isDownSwipe && handlers.onSwipeDown) {
        handlers.onSwipeDown()
      }
    }

    isDragging.current = false
  }, [handlers, threshold])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  }
}
