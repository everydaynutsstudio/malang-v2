import { useGameStore } from './store/gameStore';
import { soundManager } from './sounds/soundManager';
import Scene from './components/Scene';
import TitleOverlay from './components/TitleOverlay';

export default function App() {
  const { showTitle, dismissTitle } = useGameStore();

  function handleStart() {
    soundManager.init();
    dismissTitle();
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100dvh',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'sans-serif',
      }}
    >
      <Scene />
      {showTitle && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 100 }}
          onClick={handleStart}
        >
          <TitleOverlay />
        </div>
      )}
    </div>
  );
}
