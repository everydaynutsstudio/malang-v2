// 드래그 제스처 — 컵 픽업대 드롭용 (placeholder)
import { useRef } from 'react';

interface UseDragOptions {
  onDrop?: (x: number, y: number) => void;
}

export function useDrag({ onDrop }: UseDragOptions = {}) {
  const startPos = useRef<{ x: number; y: number } | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    startPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!startPos.current) return;
    onDrop?.(e.clientX, e.clientY);
    startPos.current = null;
  }

  return { onPointerDown, onPointerUp };
}
