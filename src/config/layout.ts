// UI 요소 위치/크기 중앙 관리
// x, y : 9:16 게임 컨테이너 기준 % (left / top)
// scale : 1.0 = 기본 크기
// 모든 요소는 transform: translate(-50%, -50%) scale(s) 로 중심점 배치

export const LAYOUT = {
  cup:           { x: 50,  y: 60,  scale: 0.8 },
  cupAction:     { x: 55,  y: 84,  scale: 1.0 },
  clearCupBtn:   { x: 70,  y: 72,  scale: 1.0 },
  shakeGauge:    { x: 55,  y: 63,  scale: 1.0 },
  character:     { x: 28,  y: 72,  scale: 1.0 },

  ingredients: {
    pearl:   { x: 15, y: 52, scale: 0.8 },
    jelly:   { x: 25, y: 56, scale: 0.8 },
    oreo:    { x: 35, y: 60, scale: 0.8 },
    cream:   { x: 20, y: 36, scale: 1.0 },
    syrup:   { x: 35, y: 32, scale: 1.0 },
    milktea: { x: 55, y: 44, scale: 1.0 },
    taro:    { x: 70, y: 48, scale: 1.0 },
    matcha:  { x: 85, y: 52, scale: 1.0 },
  },

  coinHUD:       { x: 50,  y:  4,  scale: 1.0 },

  takeoutWindow: { x: 82,  y: 88,  scale: 1.0 },
  softOrder:     { x: 82,  y: 80,  scale: 1.0 },
  settingsBtn:   { x:  8,  y: 94,  scale: 1.0 },

  // Cup 기준 너비 (px) — scale 1.0 기준, 높이는 aspect-ratio 자동
  cup_base_w: 90,

  // 액체 rect 영역 — 컵 내부 clipping 영역 기준 %/px
  liquid: {
    widthPct:  90,   // clipping 영역 너비의 %
    heightPct: 90,   // clipping 영역 높이의 % (액체 최대 수위 영역)
    offsetX:    0,   // 중심에서 좌우 미세조정 (px)
    offsetY:    -10,   // 중심에서 상하 미세조정 (px)
  },

  // 액체 윗면 타원 크기 (컵 내부 clipping 영역 기준 %)
  liquidEllipse: { widthPct: 85, height: 20 },
} as const;
