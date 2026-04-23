// 아이소메트릭 카페 싱글 씬 — §5 레이아웃 기준 placeholder
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
import { INGREDIENTS } from '../data/ingredients';
import { useGameStore } from '../store/gameStore';

const bases         = INGREDIENTS.filter(i => i.layer === 'body');
const bottomToppings = INGREDIENTS.filter(i => i.layer === 'bottom');
const topToppings   = INGREDIENTS.filter(i => i.layer === 'top');

// ── Shelf panel (재료 섹션 묶음) ──────────────────────────────────────────
function Shelf({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      width: '100%',
      padding: '8px 16px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 6, letterSpacing: 1 }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {children}
      </div>
    </div>
  );
}

export default function Scene() {
  // serveCount를 Cup의 key로 사용 → 서빙 완료 후 리마운트 = 새 빈 컵 bounce-in
  const serveCount = useGameStore(s => s.serveCount);

  return (
    // 전체 뷰포트를 채우되, 내부는 9:16 비율로 센터링
    <div style={{
      width: '100vw',
      height: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d0916',
    }}>
      {/* 9:16 게임 영역 */}
      <div style={{
        position: 'relative',
        width:  'min(100vw, calc(100dvh * 9 / 16))',
        height: 'min(100dvh, calc(100vw * 16 / 9))',
        background: 'linear-gradient(175deg, #2d1b69 0%, #1a0a35 50%, #0d0916 100%)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Segoe UI", sans-serif',
      }}>

        {/* ── HUD ── */}
        <CoinHUD />

        {/* ── 재료 선반 영역 (상단 55%) ── */}
        <div style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '52px 12px 8px',
        }}>
          <Shelf label="TOPPING — BOTTOM">
            {bottomToppings.map(i => <IngredientStation key={i.id} ingredient={i} />)}
          </Shelf>

          <Shelf label="TOPPING — TOP">
            {topToppings.map(i => <IngredientStation key={i.id} ingredient={i} />)}
          </Shelf>

          <Shelf label="BASE">
            {bases.map(i => <IngredientStation key={i.id} ingredient={i} />)}
          </Shelf>
        </div>

        {/* ── 작업대 (캐릭터 + 컵) ── */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 20,
          padding: '0 16px 16px',
          // 카운터 배경 라인
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'linear-gradient(0deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
        }}>
          <Character />

          {/* 컵 + 게이지 + 액션버튼 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <ShakeGauge />
            <Cup key={serveCount} />
            <CupAction />
          </div>
        </div>

        {/* ── 하단 바 (⚙️ | 픽업대) ── */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '0 16px 12px',
          pointerEvents: 'none',
        }}>
          {/* Settings placeholder */}
          <div style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, cursor: 'pointer', pointerEvents: 'auto',
          }}>
            ⚙️
          </div>

          {/* 픽업대 + Soft Order */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, pointerEvents: 'auto' }}>
            <SoftOrderBubble />
            <TakeoutWindow />
          </div>
        </div>

        <RewardPopup />
        <TitleOverlay />
      </div>
    </div>
  );
}
