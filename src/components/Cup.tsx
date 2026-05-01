// §2.2 컵 — READY_TO_SERVE: drag, SERVING: fade+scale down, IDLE: bounce-in 입장
// Outer motion.div: drag 위치 / 서빙 fade / 입장 애니메이션
// Inner motion.div: SHAKING 좌우 회전 (drag 위치와 분리)
import { useEffect } from 'react';
import { motion, useAnimation, type PanInfo } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { pickupZone } from '../store/pickupZone';
import { LAYOUT } from '../config/layout';
import CupLayer from './CupLayer';
import cupEmptyImg from '../assets/cup_empty.png';
import cupLidImg   from '../assets/cup_lid.png';

const CUP_W = LAYOUT.cup_base_w;  // scale 1.0 기준 너비
const CUP_RATIO = 216 / 279;      // cup_empty.png 원본 비율 (216×279)
const HIT_PADDING = 52;

// 내용물 클리핑 영역 — 컵 이미지 내부에 맞춤 (이미지 교체 시 이 값만 조정)
const FILL_INSET = { top: 8, left: 8, right: 8, bottom: 6 };

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
  const hasLid      = cupState === 'READY_TO_SHAKE' || cupState === 'SHAKING' || cupState === 'READY_TO_SERVE';

  const shakeDuration = 0.20 - (shakeGauge / 100) * 0.11;
  const shakeAmp      = 8   + (shakeGauge / 100) * 6;

  useEffect(() => {
    controls.start({
      x: 0, y: 0, scale: 1, opacity: 1,
      transition: { type: 'spring', stiffness: 380, damping: 26 },
    });
  }, []); // stable ref — 의도적 빈 deps

  useEffect(() => {
    if (!isServing) return;
    controls.start({
      scale: 0.1, opacity: 0,
      transition: { duration: 0.28, ease: 'easeIn' },
    });
  }, [isServing]); // stable ref

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
      serveDrink();
    } else {
      controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 420, damping: 30 } });
    }
  }

  return (
    <motion.div
      drag={isDraggable}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ left: -600, right: 600, top: -600, bottom: 600 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ scale: 0.6, opacity: 0, y: 14 }}
      style={{
        // width 고정 + aspect-ratio로 높이 자동 결정 → absolute 자식 기준 확보
        width:       CUP_W,
        aspectRatio: `${CUP_RATIO}`,
        height:      'auto',
        cursor: isDraggable ? 'grab' : 'default',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        zIndex: isDraggable ? 20 : 1,
      }}
    >
      {/* Inner: SHAKING 좌우 회전 */}
      <motion.div
        animate={isShaking ? { rotate: [-shakeAmp, shakeAmp] } : { rotate: 0 }}
        transition={isShaking
          ? { repeat: Infinity, repeatType: 'mirror', duration: shakeDuration, ease: 'easeInOut' }
          : { type: 'spring', stiffness: 300, damping: 20 }
        }
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        {/* 내용물 클리핑 (bottom + body) */}
        <div style={{
          position: 'absolute',
          top: FILL_INSET.top, left: FILL_INSET.left,
          right: FILL_INSET.right, bottom: FILL_INSET.bottom,
          overflow: 'hidden',
          borderRadius: '2px 2px 14px 14px',
          zIndex: 1,
        }}>
          <CupLayer layer="bottom" ingredients={cupIngredients} />
          <CupLayer layer="body"   ingredients={cupIngredients} liquidColor={liquidColor} liquidLevel={liquidLevel} />
        </div>

        {/* top layer — 클리핑 밖: cream/syrup이 컵 위로 삐져나와야 함 */}
        <div style={{
          position: 'absolute',
          top: FILL_INSET.top, left: FILL_INSET.left,
          right: FILL_INSET.right, bottom: FILL_INSET.bottom,
          zIndex: 3, pointerEvents: 'none',
        }}>
          <CupLayer layer="top" ingredients={cupIngredients} liquidLevel={liquidLevel} />
        </div>

        {/* 컵 이미지 — 내용물 위에 올려 컵 테두리가 내용물을 가림 */}
        <img
          src={cupEmptyImg}
          alt="" aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'fill', zIndex: 2,
            pointerEvents: 'none', userSelect: 'none',
          }}
        />

        {/* 뚜껑 */}
        {hasLid && (
          <motion.img
            src={cupLidImg}
            alt="" aria-hidden="true"
            key="lid"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              top: -12, left: -6, right: -6,
              width: 'calc(100% + 12px)',
              objectFit: 'fill', zIndex: 4,
              pointerEvents: 'none', userSelect: 'none',
            }}
          />
        )}

        {/* 빨대 */}
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
              zIndex: 5,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
