/** 알림 한 개. type: 'success' | 'error' | 'info' */
export default function Toast({ type = 'success', message, onClose }) {
  const icon = { success: '✓', error: '!', info: 'i' }[type];
  return (
    <div className={`toast toast--${type}`}>
      <span className="toast__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="toast__message">{message}</span>
      <button type="button" className="toast__close" onClick={onClose} aria-label="알림 닫기">
        ×
      </button>
    </div>
  );
}
