// §8 코인 HUD — 코인 증가 시 scale punch 애니메이션
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function CoinHUD() {
  const coins      = useGameStore(s => s.coins);
  const prevCoins  = useRef(coins);
  const [punchKey, setPunchKey] = useState(0); // key 변경 → motion.span 리마운트 → 입장 애니메이션

  useEffect(() => {
    if (coins > prevCoins.current) {
      setPunchKey(k => k + 1);
    }
    prevCoins.current = coins;
  }, [coins]);

  return (
    <div style={{
      position:     'absolute',
      top:           16,
      left:          16,
      display:       'flex',
      alignItems:    'center',
      gap:           6,
      background:    'rgba(0,0,0,0.45)',
      borderRadius:  20,
      padding:       '6px 14px',
      zIndex:        10,
    }}>
      <span style={{ fontSize: 16 }}>💰</span>

      {/* key 변경 시 리마운트 → initial(scale:1.5) → animate(scale:1) 펀치 */}
      <AnimatePresence mode="wait">
        <motion.span
          key={punchKey}
          initial={{ scale: 1.5, color: '#FFE066' }}
          animate={{ scale: 1,   color: '#FFD700' }}
          transition={{ type: 'spring', stiffness: 520, damping: 18 }}
          style={{ fontWeight: 800, fontSize: 17 }}
        >
          {coins}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
