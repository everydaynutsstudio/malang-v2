// 캐릭터 — 포즈별 색상 placeholder (나중에 PNG로 교체)
import { useGameStore } from '../store/gameStore';

const POSE_COLORS: Record<string, string> = {
  idle: '#F5CBA7',
  pitcher: '#AED6F1',
  scoop: '#A9DFBF',
  drizzle: '#F9E79F',
  shake: '#F1948A',
};

const POSE_LABELS: Record<string, string> = {
  idle: '🧍',
  pitcher: '🫗',
  scoop: '🥄',
  drizzle: '🧁',
  shake: '🥤',
};

export default function Character() {
  const { characterPose } = useGameStore();

  return (
    <div style={{
      width: 64,
      height: 96,
      borderRadius: 16,
      background: POSE_COLORS[characterPose] ?? '#ccc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 28,
      transition: 'background 0.1s',
    }}>
      {POSE_LABELS[characterPose]}
    </div>
  );
}
