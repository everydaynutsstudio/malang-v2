// 타이틀 오버레이 — 게임 위에 겹쳐지는 반투명 시작 화면
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function TitleOverlay() {
  const { showTitle, dismissTitle } = useGameStore();

  return (
    <AnimatePresence>
      {showTitle && (
        <motion.div
          key="title"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(20, 10, 40, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          {/* Placeholder logo */}
          <div style={{
            width: 160,
            height: 80,
            background: '#B8A0D2',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: 40,
          }}>
            말랑
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={dismissTitle}
            style={{
              padding: '14px 48px',
              background: '#A8C686',
              border: 'none',
              borderRadius: 50,
              fontSize: 18,
              fontWeight: 'bold',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            START
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
