// 픽업대 — 우하단, 드래그 드롭 대상
import { useGameStore } from '../store/gameStore';

export default function TakeoutWindow() {
  const { cupState, serveDrink } = useGameStore();

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (cupState === 'READY_TO_SERVE') serveDrink();
  }

  return (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        width: 80,
        height: 60,
        background: 'rgba(255,255,255,0.1)',
        border: '2px dashed rgba(255,255,255,0.3)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
      }}
    >
      PICKUP
    </div>
  );
}
