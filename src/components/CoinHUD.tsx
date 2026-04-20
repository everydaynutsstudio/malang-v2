// 상단 코인 HUD
import { useGameStore } from '../store/gameStore';

export default function CoinHUD() {
  const { coins } = useGameStore();

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      left: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: 'rgba(0,0,0,0.4)',
      borderRadius: 20,
      padding: '6px 14px',
      color: '#FFD700',
      fontWeight: 'bold',
      fontSize: 16,
      zIndex: 10,
    }}>
      💰 {coins}
    </div>
  );
}
