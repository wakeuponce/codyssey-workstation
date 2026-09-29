import Spinner from './Spinner';

/** 로딩 상태 공통 UI */
export default function Loading({ label = '불러오는 중입니다…' }) {
  return (
    <div className="state state--loading" role="status" aria-live="polite">
      <Spinner size="lg" />
      <p className="state__text">{label}</p>
    </div>
  );
}
