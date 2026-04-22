// §7 픽업대 — DOM bounds 등록 + READY_TO_SERVE 시 glow 피드백
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { pickupZone } from '../store/pickupZone';

export default function TakeoutWindow() {
  const cupState = useGameStore(s => s.cupState);
  const ref      = useRef<HTMLDivElement>(null);

  // pickupZone 싱글턴에 DOM 등록 → Cup의 onDragEnd에서 getBounds() 호출
  useEffect(() => {
    if (ref.current) pickupZone.register(ref.current);
    return () => pickupZone.register(null);
  }, []);

  const isTarget = cupState === 'READY_TO_SERVE';

  return (
    <motion.div
      ref={ref}
      // §5 READY_TO_SERVE: 픽업대 방향 화살표 + 시각적 glow
      animate={isTarget
        ? { boxShadow: ['0 0 0px rgba(249,231,159,0)', '0 0 18px rgba(249,231,159,0.7)', '0 0 0px rgba(249,231,159,0)'] }
        : { boxShadow: '0 0 0px rgba(249,231,159,0)' }
      }
      transition={isTarget
        ? { repeat: Infinity, duration: 1.1, ease: 'easeInOut' }
        : {}
      }
      style={{
        width: 92,
        height: 64,
        background: isTarget
          ? 'rgba(249,231,159,0.12)'
          : 'rgba(255,255,255,0.07)',
        border: isTarget
          ? '2px solid rgba(249,231,159,0.6)'
          : '2px dashed rgba(255,255,255,0.2)',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        transition: 'background 0.3s, border 0.3s',
      }}
    >
      {/* READY_TO_SERVE: 컵 + 화살표 */}
      {isTarget ? (
        <>
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 0.7 }}
            style={{ fontSize: 18 }}
          >
            🥤→
          </motion.span>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(249,231,159,0.9)', letterSpacing: 1 }}>
            DROP HERE
          </span>
        </>
      ) : (
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 }}>
          PICKUP
        </span>
      )}
    </motion.div>
  );
}
