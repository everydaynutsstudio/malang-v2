// §3.2 컵 레이어 — bottom / body / top 자동 정렬
// body:  수위 상승 + 색상 tween (§12: duration 0.4, easeOut)
// bottom: bounce 낙하 (§12: spring stiffness 300, damping 15)
// top:   액체 위에 부유, cream scale up / syrup drizzle (§12)
import { motion, AnimatePresence } from 'framer-motion';
import { INGREDIENTS_MAP } from '../data/ingredients';
import { LAYOUT } from '../config/layout';
import type { CupIngredient } from '../store/gameStore';

interface Props {
  layer: 'bottom' | 'body' | 'top';
  ingredients: CupIngredient[];
  liquidColor?: string;
  liquidLevel?: number;   // 0 ~ 1
}

// ── Bottom 재료별 파티클 설정 — 색상은 ingredients.ts에서 가져옴 ───────────
const BOTTOM_CONFIG: Record<string, { shape: 'circle' | 'rect' | 'crumb'; size: number }> = {
  pearl: { shape: 'circle', size: 8 },
  jelly: { shape: 'rect',   size: 7 },
  oreo:  { shape: 'crumb',  size: 6 },
};

function BottomParticle({
  color, shape, size, index,
}: {
  color: string;
  shape: 'circle' | 'rect' | 'crumb';
  size: number;
  index: number;
}) {
  const borderRadius =
    shape === 'circle' ? '50%' :
    shape === 'rect'   ? '2px' :
    `${Math.random() * 4}px ${Math.random() * 4}px ${Math.random() * 4}px ${Math.random() * 4}px`;

  const offsetX = ((index * 17 + 5) % 60) - 30;

  return (
    <motion.div
      key={index}
      initial={{ y: -60, opacity: 0, x: offsetX }}
      animate={{ y: 0, opacity: 1, x: offsetX }}
      transition={{ type: 'spring', stiffness: 300, damping: 15, delay: index * 0.03 }}
      style={{
        position: 'absolute',
        bottom: 2 + (index % 3) * 3,
        left: `calc(50% + ${offsetX}px)`,
        width: size,
        height: size,
        borderRadius,
        background: color,
        boxShadow: shape === 'rect' ? 'inset 0 1px 2px rgba(255,255,255,0.4)' : 'none',
      }}
    />
  );
}

// ── Layer: bottom ─────────────────────────────────────────────────────────
function BottomLayer({ ingredients }: { ingredients: CupIngredient[] }) {
  const layerItems = ingredients.filter(ci => INGREDIENTS_MAP[ci.ingredientId]?.layer === 'bottom');

  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', zIndex: 4, background: 'transparent' }}>
      {layerItems.flatMap(ci => {
        const cfg   = BOTTOM_CONFIG[ci.ingredientId];
        const color = INGREDIENTS_MAP[ci.ingredientId]?.color ?? '#888';
        if (!cfg) return [];
        const count = ci.quantity >= 2 ? 7 : 3;
        return Array.from({ length: count }, (_, i) => (
          <BottomParticle
            key={`${ci.ingredientId}-${i}`}
            color={color}
            shape={cfg.shape}
            size={cfg.size}
            index={i + (ci.quantity === 1 ? 0 : 3)}
          />
        ));
      })}
    </div>
  );
}

// hex 또는 rgb() 문자열을 어둡게
function darkenColor(color: string, amount: number): string {
  // rgb(...) 형태 처리
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = Math.max(0, Math.round(+rgbMatch[1] * (1 - amount)));
    const g = Math.max(0, Math.round(+rgbMatch[2] * (1 - amount)));
    const b = Math.max(0, Math.round(+rgbMatch[3] * (1 - amount)));
    return `rgb(${r},${g},${b})`;
  }
  // hex 형태 처리
  const hex = color.replace('#', '');
  if (hex.length < 6) return color;
  const n = parseInt(hex.slice(0, 6), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >>  8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round(( n        & 0xff) * (1 - amount)));
  return `rgb(${r},${g},${b})`;
}

// ── Layer: body (액체) ────────────────────────────────────────────────────
function BodyLayer({ liquidColor, liquidLevel }: { liquidColor: string; liquidLevel: number }) {
  const liq     = LAYOUT.liquid;
  const ellipse = LAYOUT.liquidEllipse;
  const surfaceColor = darkenColor(liquidColor, 0.2);

  // 액체 rect: clipping 영역 기준 %로 위치·크기 계산
  // left = (100 - widthPct) / 2 % + offsetX px
  const liqLeft   = `calc(${(100 - liq.widthPct) / 2}% + ${liq.offsetX}px)`;
  const liqBottom = `calc(${(100 - liq.heightPct) / 2}% + ${liq.offsetY}px)`;

  return (
    <>
      {/* 액체 본체 — widthPct/heightPct/offset 기준, opacity 1.0 */}
      <motion.div
        animate={{
          height:          `calc(${liq.heightPct}% * ${liquidLevel})`,
          backgroundColor: liquidColor,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          bottom:   liqBottom,
          left:     liqLeft,
          width:    `${liq.widthPct}%`,
          backgroundColor: '#FFFFFF',
          opacity: 1,
          zIndex: 2,
        }}
      />

      {/* 액체 윗면 타원
          initial bottom: 0% → 마운트 시 컵 최하단에서 시작
          animate bottom: liquid 상단 경계 위치로 이동
          translateY(50%) = 타원 중심을 경계선에 맞춤 */}
      <motion.div
        initial={{ bottom: liqBottom }}
        animate={{
          bottom:          `calc(${liqBottom} + ${liq.heightPct}% * ${liquidLevel})`,
          backgroundColor: surfaceColor,
          opacity:         liquidLevel > 0 ? 0.8 : 0,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          left:      '50%',
          transform: 'translateX(-50%) translateY(50%)',
          width:        `${ellipse.widthPct}%`,
          height:       ellipse.height,
          borderRadius: '50%',
          backgroundColor: surfaceColor,
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

// ── Layer: top ─────────────────────────────────────────────────────────────
function TopLayer({ ingredients, liquidLevel }: { ingredients: CupIngredient[]; liquidLevel: number }) {
  const layerItems = ingredients.filter(ci => INGREDIENTS_MAP[ci.ingredientId]?.layer === 'top');

  return (
    <AnimatePresence>
      {layerItems.map(ci => {
        if (ci.ingredientId === 'cream') {
          return (
            <motion.div
              key="cream"
              initial={{ scaleX: 0, scaleY: 0, opacity: 0 }}
              animate={{ scaleX: 1, scaleY: 1, opacity: 0.95 }}
              exit={{ scaleX: 0, scaleY: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14 }}
              style={{
                position: 'absolute',
                left: -2, right: -2,
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
          // syrup 색상도 ingredients.ts에서 참조
          const syrupColor = INGREDIENTS_MAP['syrup']?.color ?? '#8B4513';
          return (
            <motion.div
              key="syrup"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 0.85 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                bottom: `${liquidLevel * 100}%`,
                left: '30%', width: '40%', height: 18,
                background: `linear-gradient(180deg, ${syrupColor} 0%, ${darkenColor(syrupColor, 0.2)} 100%)`,
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
