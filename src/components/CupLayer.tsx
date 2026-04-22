// §3.2 컵 레이어 — bottom / body / top 자동 정렬
// body:  수위 상승 + 색상 tween (§12: duration 0.4, easeOut)
// bottom: bounce 낙하 (§12: spring stiffness 300, damping 15)
// top:   액체 위에 부유, cream scale up / syrup drizzle (§12)
import { motion, AnimatePresence } from 'framer-motion';
import { INGREDIENTS_MAP } from '../data/ingredients';
import type { CupIngredient } from '../store/gameStore';

interface Props {
  layer: 'bottom' | 'body' | 'top';
  ingredients: CupIngredient[];
  liquidColor?: string;
  liquidLevel?: number;   // 0 ~ 1
}

// ── Bottom 재료별 파티클 설정 ─────────────────────────────────────────────
const BOTTOM_CONFIG: Record<string, { color: string; shape: 'circle' | 'rect' | 'crumb'; size: number }> = {
  pearl: { color: '#1a1a1a', shape: 'circle', size: 8 },
  jelly: { color: 'rgba(180,240,200,0.75)', shape: 'rect',   size: 7 },
  oreo:  { color: '#2a1a0a', shape: 'crumb',  size: 6 },
};

function BottomParticle({
  config, index,
}: {
  config: { color: string; shape: 'circle' | 'rect' | 'crumb'; size: number };
  index: number;
}) {
  const borderRadius =
    config.shape === 'circle' ? '50%' :
    config.shape === 'rect'   ? '2px' :
    `${Math.random() * 4}px ${Math.random() * 4}px ${Math.random() * 4}px ${Math.random() * 4}px`;

  // 바닥에 살짝 랜덤하게 분산
  const offsetX = ((index * 17 + 5) % 60) - 30; // pseudo-random spread

  return (
    <motion.div
      key={index}
      initial={{ y: -60, opacity: 0, x: offsetX }}
      animate={{ y: 0, opacity: 1, x: offsetX }}
      // §12 bounce 낙하: spring stiffness 300, damping 15
      transition={{ type: 'spring', stiffness: 300, damping: 15, delay: index * 0.03 }}
      style={{
        position: 'absolute',
        bottom: 2 + (index % 3) * 3,
        left: `calc(50% + ${offsetX}px)`,
        width: config.size,
        height: config.size,
        borderRadius,
        background: config.color,
        boxShadow: config.shape === 'rect' ? 'inset 0 1px 2px rgba(255,255,255,0.4)' : 'none',
      }}
    />
  );
}

// ── Layer: bottom ─────────────────────────────────────────────────────────
function BottomLayer({ ingredients }: { ingredients: CupIngredient[] }) {
  const layerItems = ingredients.filter(ci => INGREDIENTS_MAP[ci.ingredientId]?.layer === 'bottom');

  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', zIndex: 1 }}>
      {layerItems.flatMap(ci => {
        const cfg = BOTTOM_CONFIG[ci.ingredientId];
        if (!cfg) return [];
        // §3.3: 탭 1회 = 소량(3개), 탭 2회+ = 많음(7개)
        const count = ci.quantity >= 2 ? 7 : 3;
        return Array.from({ length: count }, (_, i) => (
          <BottomParticle key={`${ci.ingredientId}-${i}`} config={cfg} index={i + (ci.quantity === 1 ? 0 : 3)} />
        ));
      })}
    </div>
  );
}

// ── Layer: body (액체) ────────────────────────────────────────────────────
function BodyLayer({ liquidColor, liquidLevel }: { liquidColor: string; liquidLevel: number }) {
  return (
    <motion.div
      // §12: height tween duration 0.4 easeOut + 색상 tween duration 0.4
      animate={{
        height:          `${liquidLevel * 100}%`,
        backgroundColor: liquidColor,
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        opacity: 0.72,
        zIndex: 2,
      }}
    />
  );
}

// ── Layer: top ─────────────────────────────────────────────────────────────
// 액체 수위에 딱 붙어서 부유 (liquidLevel * 100% bottom 위치)
function TopLayer({ ingredients, liquidLevel }: { ingredients: CupIngredient[]; liquidLevel: number }) {
  const layerItems = ingredients.filter(ci => INGREDIENTS_MAP[ci.ingredientId]?.layer === 'top');

  return (
    <AnimatePresence>
      {layerItems.map(ci => {
        if (ci.ingredientId === 'cream') {
          return (
            // §12: cream scale up [0, 1.1, 1], spring
            <motion.div
              key="cream"
              initial={{ scaleX: 0, scaleY: 0, opacity: 0 }}
              animate={{ scaleX: 1, scaleY: 1, opacity: 0.95 }}
              exit={{ scaleX: 0, scaleY: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14 }}
              style={{
                position: 'absolute',
                left: -2, right: -2,
                // 액체 표면 위에 부유
                bottom: `${liquidLevel * 100}%`,
                height: 22,
                background: 'radial-gradient(ellipse at 50% 80%, #fff 60%, #f0ede5 100%)',
                borderRadius: '50% 50% 20% 20%',
                zIndex: 4,
                transformOrigin: 'bottom center',
              }}
            />
          );
        }

        if (ci.ingredientId === 'syrup') {
          return (
            // §12: 시럽 흘러내리는 tween path
            <motion.div
              key="syrup"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 0.85 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                bottom: `${liquidLevel * 100}%`,
                left: '30%',
                width: '40%',
                height: 18,
                background: 'linear-gradient(180deg, #8B4513 0%, #6B3010 100%)',
                borderRadius: '0 0 4px 4px',
                zIndex: 4,
                transformOrigin: 'top center',
              }}
            />
          );
        }

        return null;
      })}
    </AnimatePresence>
  );
}

// ── 메인 export ───────────────────────────────────────────────────────────
export default function CupLayer({ layer, ingredients, liquidColor = '#FFFFFF', liquidLevel = 0 }: Props) {
  if (layer === 'body')   return <BodyLayer liquidColor={liquidColor} liquidLevel={liquidLevel} />;
  if (layer === 'bottom') return <BottomLayer ingredients={ingredients} />;
  if (layer === 'top')    return <TopLayer ingredients={ingredients} liquidLevel={liquidLevel} />;
  return null;
}
