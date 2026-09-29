import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Toast from '../components/Toast';

/**
 * 전역 상태 ②: 알림(토스트).
 * "저장 성공 → 목록 페이지로 이동 → 알림 표시" 처럼 페이지가 바뀌어도 알림은 남아야 하므로
 * 페이지보다 위(라우터 바깥)에 상태를 둔다.
 */
const ToastContext = createContext(null);
const DURATION_MS = 3000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss],
  );

  // showToast 는 항상 같은 함수 → 이 값을 쓰는 컴포넌트는 토스트 목록이 바뀌어도 리렌더링되지 않는다.
  const api = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast 는 <ToastProvider> 안에서만 사용할 수 있습니다.');
  return context;
}
