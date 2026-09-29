import { useEffect, useRef } from 'react';
import Button from './Button';

/**
 * 확인 모달. open 이 true 일 때만 렌더링된다.
 * pending 이면 버튼이 "삭제 중…" 으로 바뀌고 닫을 수 없다.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '확인',
  pending = false,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus(); // 열리면 안전한 쪽(취소)에 포커스
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !pending) onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, pending, onCancel]);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" onClick={pending ? undefined : onCancel}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="dialog-title" className="dialog__title">
          {title}
        </h2>
        <p id="dialog-message" className="dialog__message">
          {message}
        </p>
        <div className="dialog__actions">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={pending}>
            취소
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={pending}>
            {pending ? '처리 중…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
