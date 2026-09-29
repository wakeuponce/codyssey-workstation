/** 폼 상단 등에 띄우는 안내 상자. type: 'error' | 'info' | 'success' */
export default function Alert({ type = 'error', title, children }) {
  return (
    <div className={`alert alert--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {title && <strong className="alert__title">{title}</strong>}
      <div>{children}</div>
    </div>
  );
}
