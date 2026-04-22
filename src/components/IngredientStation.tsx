// 재료통 + TAP 인디케이터 — §3.4 탭 연출 (highlight + bounce)
import { motion, useAnimation } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import type { Ingredient } from '../data/ingredients';

interface Props {
  ingredient: Ingredient;
}

// Placeholder 색상 (PNG 교체 전)
const STATION_BG: Record<string, string> = {
  milktea: '#C8895A',
  taro:    '#9B7CC0',
  matcha:  '#7BA85A',
  pearl:   '#222222',
  jelly:   '#E891A0',
  oreo:    '#4A3020',
  cream:   '#E8E0C8',
  syrup:   '#7A3810',
};

// 이 재료가 현재 컵에 몇 개 들어 있는지
function useIngredientQty(ingredientId: string) {
  return useGameStore(s =>
    s.cupIngredients.find(ci => ci.ingredientId === ingredientId)?.quantity ?? 0
  );
}

// 재료가 최대치에 도달했는지
function isMaxed(ingredient: Ingredient, qty: number): boolean {
  if (ingredient.layer === 'top')  return qty >= 1;   // top은 1회만
  if (ingredient.layer === 'body') return qty >= 3;   // base는 3 unit = full
  return false;                                        // bottom은 제한 없음
}

export default function IngredientStation({ ingredient }: Props) {
  const cupState   = useGameStore(s => s.cupState);
  const softOrder  = useGameStore(s => s.softOrder);
  const addIngredient = useGameStore(s => s.addIngredient);
  const controls   = useAnimation();
  const qty        = useIngredientQty(ingredient.id);

  const isActive  = cupState === 'IDLE' || cupState === 'FILLING';
  const maxed     = isMaxed(ingredient, qty);
  const isHinted  = softOrder?.hintIngredientIds.includes(ingredient.id) ?? false;

  // §3.4: 탭 → highlight + bounce (필수 2가지)
  async function handleTap() {
    if (!isActive || maxed) return;

    // bounce 애니메이션 (§3.4: scale [1, 0.95, 1], 0.3초)
    controls.start({
      scale: [1, 0.92, 1.04, 1],
      transition: { duration: 0.25, ease: 'easeInOut' },
    });

    addIngredient(ingredient);
  }

  const bg = STATION_BG[ingredient.id] ?? '#666';
  const dimmed = !isActive || maxed;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
      opacity: dimmed ? 0.4 : 1,
      transition: 'opacity 0.2s',
    }}>

      {/* TAP bubble — §5.1: IDLE/FILLING 상태, bobbing 애니메이션 */}
      <div style={{ height: 18 }}>
        {isActive && !maxed && (
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 0.85, ease: 'easeInOut' }}
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              background: 'rgba(255,255,255,0.18)',
              borderRadius: 6,
              padding: '2px 7px',
              letterSpacing: 0.5,
            }}
          >
            TAP
          </motion.div>
        )}
        {maxed && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', padding: '2px 7px' }}>
            MAX
          </div>
        )}
      </div>

      {/* 재료통 본체 */}
      <div style={{ position: 'relative' }}>
        {/* §12 Soft Order 힌트 glow — opacity pulse, Infinity */}
        {isHinted && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: -5,
              borderRadius: 16,
              background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        {/* §3.4: highlight — isHinted 시 테두리 glow */}
        <motion.div
          animate={controls}
          onClick={handleTap}
          style={{
            position: 'relative',
            zIndex: 1,
            width: 60,
            height: 60,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${bg}ee, ${bg}99)`,
            border: isHinted
              ? '2px solid #FFD700'
              : '2px solid rgba(255,255,255,0.12)',
            cursor: isActive && !maxed ? 'pointer' : 'default',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            boxShadow: isHinted
              ? '0 0 12px rgba(255,215,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
              : 'inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.4)',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span style={{
            fontSize: ingredient.nameKo.length > 3 ? 9 : 11,
            fontWeight: 700,
            color: ingredient.id === 'cream' ? '#555' : '#fff',
            textShadow: ingredient.id === 'cream' ? 'none' : '0 1px 3px rgba(0,0,0,0.6)',
            textAlign: 'center',
            lineHeight: 1.2,
            padding: '0 2px',
          }}>
            {ingredient.nameKo}
          </span>
        </motion.div>

        {/* 수량 배지 — 1개 이상 추가된 경우 */}
        {qty > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#FF6B9D',
              border: '2px solid #1a0a35',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              fontWeight: 700,
              color: '#fff',
              zIndex: 2,
            }}
          >
            {qty}
          </motion.div>
        )}
      </div>
    </div>
  );
}
