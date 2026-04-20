// Soft Order 말풍선 + ✓ 체크마크
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function SoftOrderBubble() {
  const { softOrder, isSoftOrderFulfilled } = useGameStore();

  return (
    <AnimatePresence>
      {softOrder && (
        <motion.div
          key={softOrder.id}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.1, 1] }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring' }}
          style={{
            position: 'relative',
            marginTop: 8,
            padding: '8px 12px',
            background: '#fff',
            borderRadius: 12,
            maxWidth: 140,
            fontSize: 11,
            color: '#333',
            lineHeight: 1.4,
          }}
        >
          {softOrder.hintText}
          {isSoftOrderFulfilled && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.3 }}
              style={{ position: 'absolute', top: -8, right: -8, fontSize: 16 }}
            >
              ✓
            </motion.span>
          )}
          {/* Speech bubble tail */}
          <div style={{
            position: 'absolute',
            top: -8,
            left: 16,
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '8px solid #fff',
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
