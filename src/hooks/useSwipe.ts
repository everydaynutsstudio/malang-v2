// 좌우 swipe/drag 제스처
import { useRef } from 'react';

interface UseSwipeOptions {
  onSwipe?: (direction: 'left' | 'right') => void;
  onSwipeDelta?: (delta: number) => void;
}

export function useSwipe({ onSwipe, onSwipeDelta }: UseSwipeOptions = {}) {
  const startX = useRef<number | null>(null);
  const lastX = useRef<number | null>(null);

  function getClientX(e: React.TouchEvent | React.MouseEvent | React.PointerEvent): number {
    if ('touches' in e && e.touches.length > 0) return e.touches[0].clientX;
    if ('clientX' in e) return e.clientX;
    return 0;
  }

  function onPointerDown(e: React.PointerEvent) {
    startX.current = getClientX(e);
    lastX.current = getClientX(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (lastX.current === null) return;
    const dx = getClientX(e) - lastX.current;
    lastX.current = getClientX(e);
    if (Math.abs(dx) > 0) onSwipeDelta?.(Math.abs(dx));
  }

  function onPointerUp(e: React.PointerEvent) {
    if (startX.current === null) return;
    const dx = getClientX(e) - startX.current;
    if (Math.abs(dx) > 20) onSwipe?.(dx < 0 ? 'left' : 'right');
    startX.current = null;
    lastX.current = null;
  }

  return { onPointerDown, onPointerMove, onPointerUp };
}
