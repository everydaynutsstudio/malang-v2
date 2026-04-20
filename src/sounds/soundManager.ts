// Howler.js 사운드 매니저 — 파일은 나중에 연결
import { Howl, Howler } from 'howler';

type SoundKey =
  | 'bgm'
  | 'pour'
  | 'plop'
  | 'squeeze'
  | 'tap'
  | 'lid'
  | 'shake'
  | 'serve'
  | 'coin'
  | 'bubble_pop'
  | 'check';

// 파일이 없을 때 조용히 실패하도록 src를 placeholder 경로로 설정
const SOUND_CONFIG: Record<SoundKey, { src: string[]; loop?: boolean; volume?: number }> = {
  bgm:        { src: ['/sounds/bgm_cafe.mp3'],       loop: true,  volume: 0.4 },
  pour:       { src: ['/sounds/sfx_pour.mp3'],       volume: 0.8 },
  plop:       { src: ['/sounds/sfx_plop.mp3'],       volume: 0.8 },
  squeeze:    { src: ['/sounds/sfx_squeeze.mp3'],    volume: 0.8 },
  tap:        { src: ['/sounds/sfx_tap.mp3'],        volume: 0.6 },
  lid:        { src: ['/sounds/sfx_lid.mp3'],        volume: 0.7 },
  shake:      { src: ['/sounds/sfx_shake.mp3'],      loop: true,  volume: 0.7 },
  serve:      { src: ['/sounds/sfx_serve.mp3'],      volume: 0.8 },
  coin:       { src: ['/sounds/sfx_coin.mp3'],       volume: 0.8 },
  bubble_pop: { src: ['/sounds/sfx_bubble_pop.mp3'], volume: 0.6 },
  check:      { src: ['/sounds/sfx_check.mp3'],      volume: 0.6 },
};

class SoundManager {
  private sounds: Partial<Record<SoundKey, Howl>> = {};
  private initialized = false;

  // 첫 터치 시 AudioContext 초기화 (모바일 정책)
  init() {
    if (this.initialized) return;
    this.initialized = true;
    Howler.autoUnlock = true;

    for (const [key, config] of Object.entries(SOUND_CONFIG) as [SoundKey, typeof SOUND_CONFIG[SoundKey]][]) {
      this.sounds[key] = new Howl({
        ...config,
        onloaderror: () => {
          // 파일 없음 — 조용히 무시
        },
      });
    }

    this.play('bgm');
  }

  play(key: SoundKey) {
    if (!this.initialized) return;
    this.sounds[key]?.play();
  }

  stop(key: SoundKey) {
    this.sounds[key]?.stop();
  }

  stopAll() {
    Howler.stop();
  }
}

export const soundManager = new SoundManager();
