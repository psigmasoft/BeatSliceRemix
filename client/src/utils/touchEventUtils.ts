/**
 * Utility functions for handling touch, pointer, and mouse events
 * Provides cross-browser support and coordinate extraction
 */

export interface PointerCoordinates {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
}

/**
 * Extract coordinates from any event type (mouse, touch, pointer)
 * Prioritizes the first touch point for touch events
 */
export function getEventCoordinates(
  event: MouseEvent | TouchEvent | PointerEvent
): PointerCoordinates {
  if (event instanceof TouchEvent) {
    const touch = event.touches[0] || event.changedTouches[0];
    if (touch) {
      return {
        clientX: touch.clientX,
        clientY: touch.clientY,
        pageX: touch.pageX,
        pageY: touch.pageY,
      };
    }
  }

  if (event instanceof PointerEvent) {
    return {
      clientX: event.clientX,
      clientY: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
    };
  }

  // MouseEvent
  const mouseEvent = event as MouseEvent;
  return {
    clientX: mouseEvent.clientX,
    clientY: mouseEvent.clientY,
    pageX: mouseEvent.pageX,
    pageY: mouseEvent.pageY,
  };
}

/**
 * Prevent default touch behaviors (scroll, zoom) during drag operations
 * Call in touchstart handler
 */
export function preventTouchScroll(event: TouchEvent): void {
  if (event.touches.length === 1) {
    event.preventDefault();
  }
}

/**
 * Detect if event is a touch event
 */
export function isTouchEvent(
  event: MouseEvent | TouchEvent | PointerEvent
): event is TouchEvent {
  return event instanceof TouchEvent;
}

/**
 * Detect if event is a pointer event
 */
export function isPointerEvent(
  event: MouseEvent | TouchEvent | PointerEvent
): event is PointerEvent {
  return event instanceof PointerEvent;
}

/**
 * Detect if device supports touch
 */
export function supportsTouchEvents(): boolean {
  return (
    typeof window !== "undefined" &&
    ("ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0)
  );
}

/**
 * Add cross-browser event listeners for drag/pointer interactions
 * Handles mouse, touch, and pointer events
 */
export interface DragHandlers {
  onStart?: (e: MouseEvent | TouchEvent | PointerEvent) => void;
  onMove?: (e: MouseEvent | TouchEvent | PointerEvent) => void;
  onEnd?: (e: MouseEvent | TouchEvent | PointerEvent) => void;
}

export function setupDragListeners(
  element: HTMLElement,
  handlers: DragHandlers
): () => void {
  const startHandler = (e: Event) => handlers.onStart?.(e as any);
  const moveHandler = (e: Event) => handlers.onMove?.(e as any);
  const endHandler = (e: Event) => handlers.onEnd?.(e as any);

  // Mouse events
  element.addEventListener("mousedown", startHandler);
  document.addEventListener("mousemove", moveHandler);
  document.addEventListener("mouseup", endHandler);

  // Touch events
  element.addEventListener("touchstart", startHandler, { passive: false });
  document.addEventListener("touchmove", moveHandler, { passive: false });
  document.addEventListener("touchend", endHandler);
  document.addEventListener("touchcancel", endHandler);

  // Pointer events (modern, covers all input types)
  element.addEventListener("pointerdown", startHandler);
  document.addEventListener("pointermove", moveHandler);
  document.addEventListener("pointerup", endHandler);
  document.addEventListener("pointercancel", endHandler);

  // Cleanup function
  return () => {
    element.removeEventListener("mousedown", startHandler);
    document.removeEventListener("mousemove", moveHandler);
    document.removeEventListener("mouseup", endHandler);

    element.removeEventListener("touchstart", startHandler);
    document.removeEventListener("touchmove", moveHandler);
    document.removeEventListener("touchend", endHandler);
    document.removeEventListener("touchcancel", endHandler);

    element.removeEventListener("pointerdown", startHandler);
    document.removeEventListener("pointermove", moveHandler);
    document.removeEventListener("pointerup", endHandler);
    document.removeEventListener("pointercancel", endHandler);
  };
}
