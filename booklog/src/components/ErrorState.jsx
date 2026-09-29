import { toUserMessage } from '../lib/errors';
import Button from './Button';

/** 에러 상태 공통 UI. onRetry 가 있으면 "다시 시도" 버튼을 보여 준다. */
export default function ErrorState({ error, title = '요청에 실패했습니다. 다시 시도하세요.', onRetry }) {
  const detail = toUserMessage(error);
  return (
    <div className="state state--error" role="alert">
      <span className="state__icon" aria-hidden="true">!</span>
      <p className="state__title">{title}</p>
      {detail && <p className="state__text">{detail}</p>}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}
