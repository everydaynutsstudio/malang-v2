// §14 Title Screen — 길건너 친구들 방식
// 게임 씬이 배경에 이미 로드된 상태, 반투명 오버레이만 fade out
// START 탭 → AudioContext 초기화 → 0.6초 fade out → 게임 시작
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { soundManager } from '../sounds/soundManager';

export default function TitleOverlay() {
  const showTitle    = useGameStore(s => s.showTitle);
  const dismissTitle = useGameStore(s => s.dismissTitle);
  const [exiting, setExiting] = useState(false);

  function handleStart() {
    if (exiting) return;
    setExiting(true);
    soundManager.init(); // AudioContext 언락 (모바일 정책)
  }

  // exit 애니메이션이 끝난 시점에 store를 업데이트
  function handleAnimationComplete() {
    if (exiting) dismissTitle();
  }

  return (
    <AnimatePresence>
      {showTitle && (
        <motion.div
          key="title-overlay"
          initial={{ opacity: 1 }}
          animate={exiting ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          onAnimationComplete={handleAnimationComplete}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            // 길건너 방식: 뒤 씬이 투과되어 보이는 반투명 배경
            background: 'linear-gradient(175deg, rgba(20,8,50,0.88) 0%, rgba(13,9,22,0.92) 100%)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
          }}
        >
          {/* 상단 장식 파티클 — 버블티 느낌 */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {BUBBLES.map((b, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -18, 0], opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: b.dur, delay: b.delay, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: b.size,
                  height: b.size,
                  borderRadius: '50%',
                  background: b.color,
                  opacity: 0.3,
                }}
              />
            ))}
          </div>

          {/* 로고 영역 */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 22 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 52 }}
          >
            {/* 로고 placeholder — PNG 교체 예정 */}
            <div style={{
              width: 170,
              height: 86,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #C49FE0 0%, #9B7CC0 50%, #7B5CA0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(155,124,192,0.45), 0 2px 8px rgba(0,0,0,0.4)',
              border: '1.5px solid rgba(255,255,255,0.2)',
            }}>
              <span style={{
                fontSize: 36,
                fontWeight: 900,
                color: '#fff',
                letterSpacing: 4,
                textShadow: '0 2px 12px rgba(0,0,0,0.3)',
              }}>
                말랑
              </span>
            </div>

            {/* 서브타이틀 */}
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: 3,
                fontWeight: 500,
              }}
            >
              BUBBLE TEA CAFÉ
            </motion.span>
          </motion.div>

          {/* START 버튼 */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 280, damping: 24 }}
            whileTap={!exiting ? { scale: 0.93 } : {}}
            onClick={handleStart}
            style={{
              padding: '16px 60px',
              background: exiting
                ? 'rgba(168,198,134,0.5)'
                : 'linear-gradient(135deg, #C8E695 0%, #A8C686 40%, #88A666 100%)',
              border: 'none',
              borderRadius: 50,
              fontSize: 17,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: 3,
              cursor: exiting ? 'default' : 'pointer',
              boxShadow: exiting
                ? 'none'
                : '0 6px 24px rgba(168,198,134,0.4), 0 2px 6px rgba(0,0,0,0.3)',
              textShadow: '0 1px 4px rgba(0,0,0,0.25)',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
          >
            START
          </motion.button>

          {/* 하단 힌트 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            transition={{ delay: 0.5 }}
            style={{
              marginTop: 20,
              fontSize: 10,
              color: '#fff',
              letterSpacing: 1,
            }}
          >
            tap to begin
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 배경 떠다니는 버블 파라미터
const BUBBLES = [
  { x: 12, y: 20, size: 10, color: '#B8A0D2', dur: 3.2, delay: 0    },
  { x: 30, y: 65, size:  7, color: '#A8C686', dur: 2.8, delay: 0.6  },
  { x: 55, y: 15, size: 13, color: '#D4A574', dur: 3.8, delay: 1.1  },
  { x: 72, y: 75, size:  8, color: '#B8A0D2', dur: 2.5, delay: 0.3  },
  { x: 85, y: 35, size: 11, color: '#A8C686', dur: 3.5, delay: 1.7  },
  { x: 20, y: 82, size:  6, color: '#FFB6C1', dur: 2.9, delay: 0.9  },
  { x: 65, y: 50, size:  9, color: '#D4A574', dur: 4.0, delay: 0.4  },
  { x: 42, y: 88, size: 12, color: '#B8A0D2', dur: 3.1, delay: 1.4  },
];
