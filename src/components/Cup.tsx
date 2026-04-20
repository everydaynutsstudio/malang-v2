// 컵 — cupState + layer 렌더링. 아직 PNG 없으므로 color rect placeholder
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import CupLayer from './CupLayer';

export default function Cup() {
  const { cupLiquidColor, cupLiquidLevel, cupIngredients, cupState } = useGameStore();

  const isShaking = cupState === 'SHAKING';

  return (
    <motion.div
      animate={isShaking ? { rotate: [-8, 8, -8, 8, 0] } : { rotate: 0 }}
      transition={isShaking ? { repeat: Infinity, duration: 0.4 } : {}}
      style={{
        position: 'relative',
        width: 80,
        height: 120,
        border: '3px solid rgba(255,255,255,0.4)',
        borderRadius: '4px 4px 12px 12px',
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <CupLayer
        layer="bottom"
        ingredients={cupIngredients}
      />
      <CupLayer
        layer="body"
        ingredients={cupIngredients}
        liquidColor={cupLiquidColor}
        liquidLevel={cupLiquidLevel}
      />
      <CupLayer
        layer="top"
        ingredients={cupIngredients}
      />
    </motion.div>
  );
}
