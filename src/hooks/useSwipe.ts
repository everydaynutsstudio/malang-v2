// 좌우 swipe/drag 제스처 — Pointer Events 기반 (mouse + touch 통합)
import { useRef } from 'react';

interface UseSwipeOptions {
  /** 드래그 완료 후 총 이동 방향 */
  onSwipe?: (direction: 'left' | 'right') => void;
  /** 매 프레임 이동량 (signed: 양수 = 오른쪽, 음수 = 왼쪽) */
  onSwipeDelta?: (signedDelta: number) => void;
}

export function useSwipe({ onSwipe, onSwipeDelta }: UseSwipeOptions = {}) {
  const startX = useRef<number | null>(null);
  const lastX  = useRef<number | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    lastX.current  = e.clientX;
    // 포인터가 요소 밖으로 나가도 이벤트를 계속 받음
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (lastX.current === null) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    if (dx !== 0) onSwipeDelta?.(dx); // signed 그대로 전달
  }

  function onPointerUp(e: React.PointerEvent) {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 20) onSwipe?.(dx < 0 ? 'left' : 'right');
    startX.current = null;
    lastX.current  = null;
  }

  function onPointerCancel() {
    startX.current = null;
    lastX.current  = null;
  }

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
