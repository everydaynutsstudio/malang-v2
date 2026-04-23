// §6 Soft Order 말풍선 — bounce-in, 힌트 텍스트, ✓ 체크마크 팝
// 위치: 픽업대(TakeoutWindow) 바로 위. Scene의 우하단 flex 컨테이너 안에서 렌더링됨.
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function SoftOrderBubble() {
  const softOrder          = useGameStore(s => s.softOrder);
  const isSoftOrderFulfilled = useGameStore(s => s.isSoftOrderFulfilled);

  return (
    <AnimatePresence>
      {softOrder && (
        <motion.div
          key={softOrder.id}
          // §6.2: bounce-in 등장
          initial={{ scale: 0, opacity: 0, y: 8 }}
          animate={{ scale: [0, 1.08, 0.96, 1], opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 6, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 420, damping: 24 }}
          style={{
            position: 'relative',
            padding: '8px 12px 8px 10px',
            background: isSoftOrderFulfilled
              ? 'linear-gradient(135deg, #e8ffe0, #f0fff0)'
              : 'linear-gradient(135deg, #fffdf0, #fff9e6)',
            borderRadius: 12,
            maxWidth: 148,
            fontSize: 11,
            color: '#2a2a2a',
            lineHeight: 1.45,
            fontWeight: 600,
            boxShadow: isSoftOrderFulfilled
              ? '0 2px 12px rgba(80,200,80,0.25), 0 1px 4px rgba(0,0,0,0.12)'
              : '0 2px 12px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.08)',
            border: isSoftOrderFulfilled
              ? '1.5px solid rgba(80,200,80,0.5)'
              : '1.5px solid rgba(255,215,0,0.4)',
            transition: 'background 0.4s, border 0.4s, box-shadow 0.4s',
            userSelect: 'none',
          }}
        >
          {/* 힌트 텍스트 */}
          <span>{softOrder.hintText}</span>

          {/* §6.4: 조건 충족 시 ✓ 체크마크 팝 애니메이션 */}
          <AnimatePresence>
            {isSoftOrderFulfilled && (
              <motion.span
                key="check"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: [0, 1.4, 1], rotate: [-20, 8, 0] }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#4CAF50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  color: '#fff',
                  fontWeight: 900,
                  boxShadow: '0 2px 8px rgba(76,175,80,0.5)',
                  lineHeight: 1,
                }}
              >
                ✓
              </motion.span>
            )}
          </AnimatePresence>

          {/* 말풍선 꼬리 — 아래쪽 (픽업대 방향) */}
          <div style={{
            position: 'absolute',
            bottom: -7,
            right: 20,
            width: 0,
            height: 0,
            borderLeft:  '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop:   isSoftOrderFulfilled
              ? '7px solid #e8ffe0'
              : '7px solid #fffdf0',
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
