import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import Loading from './Loading';

/**
 * 모든 조회 화면의 상태 분기를 한 곳에 모은 컴포넌트.
 *   loading → <Loading>, error → <ErrorState>, 성공이지만 비었음 → <EmptyState>, 그 외 → children
 * 페이지는 status 만 넘기면 되므로, 페이지마다 if 문으로 상태 UI 를 다시 만들 필요가 없다.
 *
 * children 은 함수로도 받을 수 있다: 성공했을 때만 호출되므로 data 가 항상 존재한다고 가정 가능.
 */
export default function AsyncView({
  status,
  error,
  onRetry,
  isEmpty = false,
  loadingLabel,
  empty,
  children,
}) {
  if (status === 'loading') return <Loading label={loadingLabel} />;
  if (status === 'error') return <ErrorState error={error} onRetry={onRetry} />;
  if (isEmpty) return <EmptyState {...empty} />;
  return typeof children === 'function' ? children() : children;
}
