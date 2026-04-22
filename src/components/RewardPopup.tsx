// §6.5 코인 보상 연출 — +10 (흰색) → HUD 방향 fly, +5✨ (금색) 0.25s stagger
// 픽업대 위 좌표에서 위+좌로 날아가며 fade out
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

interface Popup {
  id: number;
  text: string;
  color: string;
  glow: string;
  delay: number; // §6.5: 보너스는 0.25s 뒤
}

export default function RewardPopup() {
  const coinLog = useGameStore(s => s.coinLog);
  const [popups, setPopups] = useState<Popup[]>([]);
  const prevLen = useRef(coinLog.length);

  useEffect(() => {
    if (coinLog.length <= prevLen.current) {
      prevLen.current = coinLog.length;
      return;
    }

    const newEntries = coinLog.slice(prevLen.current);
    prevLen.current  = coinLog.length;

    const newPopups: Popup[] = newEntries.map((entry, i) => ({
      id:    Date.now() + i,
      text:  entry.reason === 'soft_order_bonus' ? `+${entry.amount} ✨` : `+${entry.amount}`,
      color: entry.reason === 'soft_order_bonus' ? '#FFD700' : '#ffffff',
      glow:  entry.reason === 'soft_order_bonus' ? 'rgba(255,215,0,0.6)' : 'rgba(255,255,255,0.3)',
      // §6.5: 기본 보상 먼저, Soft Order 보너스는 0.25s 후
      delay: entry.reason === 'soft_order_bonus' ? 0.25 : 0,
    }));

    setPopups(p => [...p, ...newPopups]);

    // 1.2초 후 자동 정리
    const t = setTimeout(() => setPopups([]), 1200);
    return () => clearTimeout(t);
  }, [coinLog]);

  return (
    <AnimatePresence>
      {popups.map(popup => (
        <motion.div
          key={popup.id}
          // 픽업대 위치(우하단)에서 HUD(좌상단) 방향으로 날아감
          initial={{ opacity: 0, scale: 0.5, x: 0,   y: 0   }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.15, 1, 0.9], x: -36, y: -80 }}
          transition={{
            duration: 0.9,
            delay:    popup.delay,
            times:    [0, 0.12, 0.65, 1],
            ease:     'easeOut',
          }}
          style={{
            position:      'absolute',
            bottom:         96,   // 픽업대 바로 위
            right:          28,
            fontWeight:     800,
            fontSize:       22,
            color:          popup.color,
            textShadow:     `0 2px 12px ${popup.glow}`,
            pointerEvents:  'none',
            zIndex:         60,
            whiteSpace:     'nowrap',
          }}
        >
          {popup.text}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
