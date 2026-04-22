// §2.2 컵 — READY_TO_SERVE: drag, SERVING: fade+scale down, IDLE: bounce-in 입장
// Outer motion.div: drag 위치 / 서빙 fade / 입장 애니메이션
// Inner motion.div: SHAKING 좌우 회전 (drag 위치와 분리)
import { useEffect } from 'react';
import { motion, useAnimation, type PanInfo } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { pickupZone } from '../store/pickupZone';
import CupLayer from './CupLayer';

const CUP_W = 90;
const CUP_H = 150;
const HIT_PADDING = 52; // 픽업대 drop 판정 여유 반경 (px)

export default function Cup() {
  const cupState       = useGameStore(s => s.cupState);
  const cupIngredients = useGameStore(s => s.cupIngredients);
  const liquidColor    = useGameStore(s => s.cupLiquidColor);
  const liquidLevel    = useGameStore(s => s.cupLiquidLevel);
  const shakeGauge     = useGameStore(s => s.shakeGauge);
  const serveDrink     = useGameStore(s => s.serveDrink);

  const controls    = useAnimation();
  const isDraggable = cupState === 'READY_TO_SERVE';
  const isShaking   = cupState === 'SHAKING';
  const isServing   = cupState === 'SERVING';

  // §12: 게이지 비례 진동 파라미터
  const shakeDuration = 0.20 - (shakeGauge / 100) * 0.11;
  const shakeAmp      = 8   + (shakeGauge / 100) * 6;

  // ── 새 컵 입장 (mount마다 = serveCount key 변경 시 리마운트)
  useEffect(() => {
    controls.start({
      x: 0, y: 0, scale: 1, opacity: 1,
      transition: { type: 'spring', stiffness: 380, damping: 26 },
    });
  }, []); // controls는 stable ref — 의도적 빈 deps

  // ── §12 서빙: scale down + fade (duration: 0.3)
  useEffect(() => {
    if (!isServing) return;
    controls.start({
      scale: 0.1,
      opacity: 0,
      transition: { duration: 0.28, ease: 'easeIn' },
    });
  }, [isServing]); // controls는 stable ref

  // ── 드래그 종료: 픽업대 hit 판정
  function handleDragEnd(_: PointerEvent, info: PanInfo) {
    const bounds = pickupZone.getBounds();
    const { point } = info;
    const hit =
      bounds != null &&
      point.x >= bounds.left  - HIT_PADDING &&
      point.x <= bounds.right + HIT_PADDING &&
      point.y >= bounds.top   - HIT_PADDING &&
      point.y <= bounds.bottom + HIT_PADDING;

    if (hit) {
      // 서빙 성공 → isServing useEffect가 fade 처리
      serveDrink();
    } else {
      // 빗나감 → 원위치 스냅백
      controls.start({
        x: 0, y: 0,
        transition: { type: 'spring', stiffness: 420, damping: 30 },
      });
    }
  }

  return (
    // ── Outer: drag 위치 · 서빙 fade · 입장 애니메이션
    <motion.div
      drag={isDraggable}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ left: -600, right: 600, top: -600, bottom: 600 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ scale: 0.6, opacity: 0, y: 14 }}
      style={{
        position: 'relative',
        width:  CUP_W,
        height: CUP_H,
        cursor: isDraggable ? 'grab' : 'default',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        zIndex: isDraggable ? 20 : 1,
      }}
    >
      {/* ── Inner: SHAKING 좌우 회전 */}
      <motion.div
        animate={isShaking
          ? { rotate: [-shakeAmp, shakeAmp] }
          : { rotate: 0 }
        }
        transition={isShaking
          ? { repeat: Infinity, repeatType: 'mirror', duration: shakeDuration, ease: 'easeInOut' }
          : { type: 'spring', stiffness: 300, damping: 20 }
        }
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >

        {/* 컵 외곽 — 버블티 실루엣 placeholder */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '6px 6px 18px 18px',
          border: '2.5px solid rgba(255,255,255,0.35)',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(2px)',
          clipPath: 'polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)',
          overflow: 'hidden',
          zIndex: 0,
        }} />

        {/* 레이어 컨테이너 — 내용물만 클리핑 */}
        <div style={{
          position: 'absolute',
          top: 2, left: 3, right: 3, bottom: 2,
          borderRadius: '4px 4px 16px 16px',
          overflow: 'hidden',
          clipPath: 'polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)',
          zIndex: 1,
        }}>
          {/* §3.2 레이어 순서: bottom → body → top */}
          <CupLayer layer="bottom" ingredients={cupIngredients} />
          <CupLayer layer="body"   ingredients={cupIngredients} liquidColor={liquidColor}  liquidLevel={liquidLevel} />
          <CupLayer layer="top"    ingredients={cupIngredients} liquidLevel={liquidLevel} />
        </div>

        {/* 뚜껑 — READY_TO_SHAKE 이후 */}
        {(cupState === 'READY_TO_SHAKE' || cupState === 'SHAKING' || cupState === 'READY_TO_SERVE') && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              top: -10, left: -4, right: -4,
              height: 14,
              borderRadius: '8px 8px 2px 2px',
              background: 'rgba(255,255,255,0.25)',
              border: '2px solid rgba(255,255,255,0.4)',
              zIndex: 2,
            }}
          />
        )}

        {/* 빨대 — READY_TO_SERVE */}
        {cupState === 'READY_TO_SERVE' && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            style={{
              position: 'absolute',
              top: -35, right: 18,
              width: 6, height: 50,
              borderRadius: 3,
              background: 'linear-gradient(180deg, #FF9DD0, #FF6BAE)',
              zIndex: 3,
            }}
          />
        )}

      </motion.div>
    </motion.div>
  );
}
