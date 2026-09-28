/**
 * 사이트 설정값.
 * 개인 정보나 기준값을 바꿀 때는 이 파일만 수정하면 된다.
 * (클래식 스크립트의 최상위 const 는 이후 로드되는 main.js 에서도 참조 가능)
 */
const CONFIG = Object.freeze({
  githubUser: 'wakeuponce',

  // 스크롤 기준값(px) — README 에 명시
  navScrollThreshold: 60, // 이 값 이상 스크롤하면 헤더 배경 변경
  scrollTopThreshold: 300, // 이 값 이상 스크롤하면 맨 위로 버튼 표시

  // Intersection Observer 임계값 — 요소가 20% 보이면 등장 애니메이션
  revealThreshold: 0.2,

  // GitHub API 응답 캐시 (레이트 리밋 60회/시간 보호). 0 이면 캐시 끔
  cacheTtlMs: 10 * 60 * 1000,
  requestTimeoutMs: 10000,

  // Hero 타이핑 효과 문구
  typingPhrases: [
    '현장의 문제를 코드로 푸는 개발자를 꿈꿉니다.',
    '이벤트 → 상태 → 렌더링을 설명할 수 있는 개발자.',
    '재현 가능한 환경부터 화면까지 직접 만듭니다.',
  ],

  // 폼 실제 전송(보너스): Formspree 폼 주소를 넣으면 실제 이메일 전송
  // 예) 'https://formspree.io/f/abcdwxyz'  — 비워 두면 전송을 시뮬레이션
  formEndpoint: '',
});
