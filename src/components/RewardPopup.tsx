// 코인 보상 연출 (+10, +5 ✨) — placeholder, 추후 애니메이션 강화
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export default function RewardPopup() {
  const { cupState, coinLog } = useGameStore();
  const [popups, setPopups] = useState<{ id: number; text: string; color: string }[]>([]);
  const prevLogLen = useRef(coinLog.length);

  useEffect(() => {
    if (coinLog.length > prevLogLen.current) {
      const newEntries = coinLog.slice(prevLogLen.current);
      const newPopups = newEntries.map((entry, i) => ({
        id: Date.now() + i,
        text: entry.reason === 'soft_order_bonus' ? `+${entry.amount} ✨` : `+${entry.amount}`,
        color: entry.reason === 'soft_order_bonus' ? '#FFD700' : '#fff',
      }));
      setPopups(p => [...p, ...newPopups]);
      setTimeout(() => setPopups([]), 1000);
    }
    prevLogLen.current = coinLog.length;
  }, [coinLog]);

  return (
    <AnimatePresence>
      {popups.map(popup => (
        <motion.div
          key={popup.id}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            bottom: 100,
            right: 30,
            fontWeight: 'bold',
            fontSize: 18,
            color: popup.color,
            pointerEvents: 'none',
            zIndex: 50,
          }}
        >
          {popup.text}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
