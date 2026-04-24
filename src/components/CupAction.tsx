// §2.2 컵 위 상태별 인터랙션 버튼/인디케이터 — 동일 위치에서 교체
// IDLE/FILLING → DONE ✓ → (뚜껑 0.55s) → SHAKE → SHAKING [←→] → READY_TO_SERVE DRAG
import type { CSSProperties } from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useSwipe } from '../hooks/useSwipe';
import { INGREDIENTS_MAP } from '../data/ingredients';

// ── 뚜껑 씌우기 후 SHAKE 버튼까지 딜레이 (§2.2: 0.5초 뚜껑 애니메이션)
const LID_ANIM_MS = 550;

export default function CupAction() {
  const cupState      = useGameStore(s => s.cupState);
  const cupIngredients = useGameStore(s => s.cupIngredients);
  const finishFilling = useGameStore(s => s.finishFilling);
  const startShaking  = useGameStore(s => s.startShaking);
  const updateShakeGauge = useGameStore(s => s.updateShakeGauge);
  const serveDrink    = useGameStore(s => s.serveDrink);

  // §2.2 FILLING: Base 1종 이상일 때만 DONE 버튼 표시
  const hasBase = cupIngredients.some(
    ci => INGREDIENTS_MAP[ci.ingredientId]?.category === 'base'
  );

  // §2.2 READY_TO_SHAKE: 뚜껑 애니메이션 완료 후 SHAKE 버튼 등장
  const [lidReady, setLidReady] = useState(false);
  useEffect(() => {
    if (cupState !== 'READY_TO_SHAKE') {
      setLidReady(false);
      return;
    }
    const t = setTimeout(() => setLidReady(true), LID_ANIM_MS);
    return () => clearTimeout(t);
  }, [cupState]);

  // SHAKING: swipe delta → gauge
  const swipeHandlers = useSwipe({
    onSwipeDelta: (signedDelta) => {
      if (cupState === 'SHAKING') {
        updateShakeGauge(signedDelta * 0.5); // 속도 절반, store 내부에서 Math.abs 처리
      }
    },
  });

  // READY_TO_SERVE: 임시 탭으로 서빙 (드래그 구현 전 fallback)
  const servHandlers = useSwipe({
    onSwipe: () => {
      if (cupState === 'READY_TO_SERVE') serveDrink();
    },
  });

  return (
    <AnimatePresence mode="wait">

      {/* ── DONE ✓ — FILLING + Base 조건 충족 시 */}
      {cupState === 'FILLING' && hasBase && (
        <motion.button
          key="done"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 20 }}
          whileTap={{ scale: 0.92 }}
          onClick={finishFilling}
          style={pillStyle('#7BC67E', '#4CAF50')}
        >
          DONE ✓
        </motion.button>
      )}

      {/* ── 뚜껑 씌우는 중 — READY_TO_SHAKE, lidReady 전 */}
      {cupState === 'READY_TO_SHAKE' && !lidReady && (
        <motion.div
          key="lidding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: 1,
            height: 36,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          뚜껑 닫는 중…
        </motion.div>
      )}

      {/* ── SHAKE — 뚜껑 완료 후 */}
      {cupState === 'READY_TO_SHAKE' && lidReady && (
        <motion.button
          key="shake"
          initial={{ scale: 0, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 18 }}
          whileTap={{ scale: 0.92 }}
          onClick={startShaking}
          style={pillStyle('#FF8A80', '#F44336')}
        >
          🧊 SHAKE
        </motion.button>
      )}

      {/* ── SWIPE ←→ — SHAKING 상태 */}
      {cupState === 'SHAKING' && (
        <motion.div
          key="swipe"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          {...swipeHandlers}
          style={{
            width: 220,
            height: 52,
            borderRadius: 26,
            background: 'rgba(255,255,255,0.08)',
            border: '1.5px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px',
            cursor: 'ew-resize',
            userSelect: 'none',
            touchAction: 'none', // 브라우저 기본 스크롤 방지
            WebkitUserSelect: 'none',
          } as CSSProperties}
        >
          {/* 왼쪽 화살표 */}
          <motion.span
            animate={{ x: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.65, ease: 'easeInOut' }}
            style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }}
          >
            ‹‹
          </motion.span>

          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5 }}>
            SWIPE
          </span>

          {/* 오른쪽 화살표 */}
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 0.65, ease: 'easeInOut' }}
            style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }}
          >
            ››
          </motion.span>
        </motion.div>
      )}

      {/* ── DRAG → — READY_TO_SERVE (픽업대로 드래그, 임시 탭 fallback) */}
      {cupState === 'READY_TO_SERVE' && (
        <motion.div
          key="drag"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          {...servHandlers}
          onClick={() => serveDrink()}
          style={{
            width: 220,
            height: 52,
            borderRadius: 26,
            background: 'rgba(249,231,159,0.12)',
            border: '1.5px solid rgba(249,231,159,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            cursor: 'grab',
            userSelect: 'none',
            touchAction: 'none',
          } as CSSProperties}
        >
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
            style={{ fontSize: 18 }}
          >
            🥤
          </motion.span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(249,231,159,0.9)', letterSpacing: 1.5 }}>
            DRAG TO PICKUP
          </span>
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
            style={{ fontSize: 14, color: 'rgba(249,231,159,0.7)' }}
          >
            →
          </motion.span>
        </motion.div>
      )}

    </AnimatePresence>
  );
}

// ── 공통 pill 버튼 스타일 ─────────────────────────────────────────────────
function pillStyle(from: string, to: string): CSSProperties {
  return {
    padding: '10px 28px',
    background: `linear-gradient(135deg, ${from}, ${to})`,
    border: 'none',
    borderRadius: 26,
    fontWeight: 700,
    fontSize: 13,
    color: '#fff',
    cursor: 'pointer',
    letterSpacing: 0.5,
    boxShadow: `0 4px 16px ${from}55`,
    minWidth: 100,
    height: 42,
  };
}
