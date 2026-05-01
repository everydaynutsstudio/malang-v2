// 아이소메트릭 카페 싱글 씬 — absolute positioning 기반 레이아웃
// 모든 UI 요소는 9:16 컨테이너 기준 left/top % + translate(-50%,-50%) 중심점 배치
// 위치 조정은 src/config/layout.ts 에서만
import { motion, AnimatePresence } from 'framer-motion';
import CoinHUD from './CoinHUD';
import Character from './Character';
import Cup from './Cup';
import CupAction from './CupAction';
import IngredientStation from './IngredientStation';
import TakeoutWindow from './TakeoutWindow';
import SoftOrderBubble from './SoftOrderBubble';
import ShakeGauge from './ShakeGauge';
import RewardPopup from './RewardPopup';
import TitleOverlay from './TitleOverlay';
import { INGREDIENTS_MAP } from '../data/ingredients';
import { useGameStore } from '../store/gameStore';
import { LAYOUT } from '../config/layout';
import bgCafe from '../assets/bg_cafe.png';

// absolute 배치 헬퍼 — layout.ts의 { x, y, scale } 을 style로 변환
function pos(cfg: { x: number; y: number; scale: number }) {
  return {
    position: 'absolute' as const,
    left:      `${cfg.x}%`,
    top:       `${cfg.y}%`,
    transform: `translate(-50%, -50%) scale(${cfg.scale})`,
    transformOrigin: 'center center',
  };
}

// layout.ts ingredients에 정의된 id 목록 (순서 = 렌더 순서)
const INGREDIENT_IDS = Object.keys(LAYOUT.ingredients) as (keyof typeof LAYOUT.ingredients)[];

export default function Scene() {
  const serveCount = useGameStore(s => s.serveCount);
  const cupState   = useGameStore(s => s.cupState);
  const clearCup   = useGameStore(s => s.clearCup);

  return (
    // 뷰포트 센터링 — 바깥 래퍼만 flex 유지 (씬 배치용, UI 레이아웃 아님)
    <div style={{
      width: '100vw',
      height: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d0916',
    }}>
      {/* 9:16 게임 컨테이너 — 모든 UI의 position: absolute 기준점 */}
      <div style={{
        position: 'relative',
        width:    'min(100vw, calc(100dvh * 9 / 16))',
        height:   'min(100dvh, calc(100vw * 16 / 9))',
        overflow: 'hidden',
        fontFamily: '"Segoe UI", sans-serif',
      }}>

        {/* ── 배경 이미지 ── */}
        <img
          src={bgCafe}
          alt="" aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            zIndex: 0,
            userSelect: 'none', pointerEvents: 'none',
          }}
        />

        {/* ── HUD — 자체 position:absolute 보유, 직접 마운트 ── */}
        <CoinHUD />

        {/* ── 재료통 — 개별 좌표 배치 ── */}
        {INGREDIENT_IDS.map(id => {
          const ingredient = INGREDIENTS_MAP[id];
          if (!ingredient) return null;
          return (
            <div key={id} style={{ ...pos(LAYOUT.ingredients[id]), zIndex: 5 }}>
              <IngredientStation ingredient={ingredient} />
            </div>
          );
        })}

        {/* ── 캐릭터 ── */}
        <div style={{ ...pos(LAYOUT.character), zIndex: 6 }}>
          <Character />
        </div>

        {/* ── ShakeGauge ── */}
        <div style={{ ...pos(LAYOUT.shakeGauge), zIndex: 7 }}>
          <ShakeGauge />
        </div>

        {/* ── 컵 ── */}
        <div style={{ ...pos(LAYOUT.cup), zIndex: 8 }}>
          <Cup key={serveCount} />
        </div>

        {/* ── 컵 리셋 버튼 (FILLING 상태) ── */}
        <div style={{ ...pos(LAYOUT.clearCupBtn), zIndex: 9 }}>
          <AnimatePresence>
            {cupState === 'FILLING' && (
              <motion.button
                key="clear-cup"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                whileTap={{ scale: 0.88 }}
                onClick={clearCup}
                style={{
                  width: 36, height: 36,
                  borderRadius: '50%',
                  background: 'rgba(255,80,80,0.15)',
                  border: '1.5px solid rgba(255,80,80,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, cursor: 'pointer',
                  color: 'rgba(255,120,120,0.9)',
                }}
              >
                🗑
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── CupAction (DONE / SHAKE / SWIPE / DRAG) ── */}
        <div style={{ ...pos(LAYOUT.cupAction), zIndex: 9 }}>
          <CupAction />
        </div>

        {/* ── 설정 버튼 ── */}
        <div style={{ ...pos(LAYOUT.settingsBtn), zIndex: 6 }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, cursor: 'pointer',
          }}>
            ⚙️
          </div>
        </div>

        {/* ── Soft Order 말풍선 ── */}
        <div style={{ ...pos(LAYOUT.softOrder), zIndex: 7 }}>
          <SoftOrderBubble />
        </div>

        {/* ── 픽업대 ── */}
        <div style={{ ...pos(LAYOUT.takeoutWindow), zIndex: 6 }}>
          <TakeoutWindow />
        </div>

        {/* ── 전역 오버레이 (z 최상위) ── */}
        <RewardPopup />
        <TitleOverlay />

      </div>
    </div>
  );
}
