/** 회전하는 원. size: 'sm'(버튼 안) | 'lg'(페이지 로딩) */
export default function Spinner({ size = 'lg' }) {
  return <span className={`spinner spinner--${size}`} aria-hidden="true" />;
}
