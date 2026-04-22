// 픽업대 DOM 요소를 등록해두고 어디서든 bounds를 읽을 수 있는 모듈 싱글턴.
// React context 없이 Cup ↔ TakeoutWindow 간 위치 공유.
let _el: HTMLElement | null = null;

export const pickupZone = {
  register: (el: HTMLElement | null) => { _el = el; },
  getBounds: (): DOMRect | null => _el?.getBoundingClientRect() ?? null,
};
