import { cloneElement } from 'react';

/**
 * 라벨 + 입력 요소 + 도움말/에러 문구를 한 묶음으로.
 * children 으로 받은 입력 요소에 id·aria 속성을 자동으로 연결해 준다.
 * - error 가 있으면 빨간 테두리 + 필드 바로 아래 에러 문구
 * - counter 가 있으면 "12 / 100" 글자 수 표시
 */
export default function FormField({ label, id, error, hint, counter, required = false, children }) {
  const messageId = `${id}-message`;
  const hasMessage = Boolean(error || hint);

  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <div className="field__top">
        <label htmlFor={id} className="field__label">
          {label}
          {required && <span className="field__required" aria-label="필수">*</span>}
        </label>
        {counter && (
          <span className={`field__counter ${counter.current > counter.max ? 'is-over' : ''}`}>
            {counter.current} / {counter.max}
          </span>
        )}
      </div>
      {cloneElement(children, {
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': hasMessage ? messageId : undefined,
      })}
      {hasMessage && (
        <p id={messageId} className={error ? 'field__error' : 'field__hint'} role={error ? 'alert' : undefined}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
