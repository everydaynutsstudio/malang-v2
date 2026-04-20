// Shaking 게이지
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function ShakeGauge() {
  const { cupState, shakeGauge } = useGameStore();

  return (
    <AnimatePresence>
      {cupState === 'SHAKING' && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ width: 80, height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' }}
        >
          <motion.div
            animate={{ width: `${shakeGauge}%` }}
            transition={{ duration: 0.1 }}
            style={{ height: '100%', background: '#F1948A', borderRadius: 4 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
