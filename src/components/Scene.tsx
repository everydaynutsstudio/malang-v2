// 아이소메트릭 카페 전체 레이아웃 — 모든 컴포넌트의 컨테이너
import CoinHUD from './CoinHUD';
import Character from './Character';
import Cup from './Cup';
import CupAction from './CupAction';
import IngredientStation from './IngredientStation';
import TakeoutWindow from './TakeoutWindow';
import SoftOrderBubble from './SoftOrderBubble';
import ShakeGauge from './ShakeGauge';
import RewardPopup from './RewardPopup';
import { INGREDIENTS } from '../data/ingredients';

export default function Scene() {
  const bases = INGREDIENTS.filter(i => i.category === 'base');
  const bottomToppings = INGREDIENTS.filter(i => i.layer === 'bottom');
  const topToppings = INGREDIENTS.filter(i => i.layer === 'top');

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(180deg, #2d1b69 0%, #11101d 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <CoinHUD />

      {/* Bottom Toppings row */}
      <div style={{ display: 'flex', gap: 12, marginTop: 60 }}>
        {bottomToppings.map(i => <IngredientStation key={i.id} ingredient={i} />)}
      </div>

      {/* Top Toppings row */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        {topToppings.map(i => <IngredientStation key={i.id} ingredient={i} />)}
      </div>

      {/* Base row */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        {bases.map(i => <IngredientStation key={i.id} ingredient={i} />)}
      </div>

      {/* Work area */}
      <div style={{ position: 'relative', display: 'flex', gap: 24, marginTop: 20, alignItems: 'flex-end' }}>
        <Character />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <ShakeGauge />
          <Cup />
          <CupAction />
        </div>
      </div>

      {/* Bottom area */}
      <div style={{ position: 'absolute', bottom: 20, right: 20 }}>
        <TakeoutWindow />
        <SoftOrderBubble />
      </div>

      <RewardPopup />
    </div>
  );
}
