// §2.2 SHAKING 게이지 — swipe 누적 → 100% 달성 시 READY_TO_SERVE
// §12: 게이지 표시, 위치 별도 결정 → 컵 위 배치
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

const GAUGE_W = 140;
const GAUGE_H = 14;

// 게이지 % → pink(0%) → orange(50%) → gold(100%) 색상 보간
function gaugeColor(pct: number): string {
  // #FF9DD0 (255,157,208) → #FFD700 (255,215,0)
  const g = Math.round(157 + (215 - 157) * (pct / 100));
  const b = Math.round(208 * (1 - pct / 100));
  return `rgb(255,${g},${b})`;
}

// 마일스톤 이모지 피드백
function milestone(pct: number): string | null {
  if (pct >= 100) return '🎉';
  if (pct >= 75)  return '🔥';
  if (pct >= 50)  return '💪';
  return null;
}

export default function ShakeGauge() {
  const cupState   = useGameStore(s => s.cupState);
  const shakeGauge = useGameStore(s => s.shakeGauge);

  const color = gaugeColor(shakeGauge);
  const mark  = milestone(shakeGauge);

  return (
    <AnimatePresence>
      {cupState === 'SHAKING' && (
        <motion.div
          key="gauge"
          initial={{ opacity: 0, scale: 0.8, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
        >
          {/* 마일스톤 이모지 */}
          <div style={{ height: 20, display: 'flex', alignItems: 'center' }}>
            <AnimatePresence mode="wait">
              {mark && (
                <motion.span
                  key={mark}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ fontSize: 16 }}
                >
                  {mark}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* 게이지 트랙 */}
          <div style={{
            width: GAUGE_W,
            height: GAUGE_H,
            borderRadius: GAUGE_H / 2,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.15)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* 게이지 채움 — 색상 + 너비 동시 tween */}
            <motion.div
              animate={{
                width: `${shakeGauge}%`,
                backgroundColor: color,
              }}
              transition={{ duration: 0.08, ease: 'linear' }}
              style={{
                position: 'absolute',
                left: 0, top: 0, bottom: 0,
                borderRadius: GAUGE_H / 2,
                backgroundColor: gaugeColor(0),
                // 반짝이는 하이라이트
                boxShadow: `0 0 8px ${color}88`,
              }}
            />

            {/* 반짝이 선 (게이지 표면) */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 60%)',
              borderRadius: GAUGE_H / 2,
              pointerEvents: 'none',
            }} />
          </div>

          {/* % 수치 */}
          <motion.div
            animate={{ color }}
            transition={{ duration: 0.08 }}
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
              minWidth: 36,
              textAlign: 'center',
            }}
          >
            {Math.round(shakeGauge)}%
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
