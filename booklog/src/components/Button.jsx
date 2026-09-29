import { Link } from 'react-router';
import Spinner from './Spinner';

/**
 * 공통 버튼.
 * - variant: 'primary' | 'secondary' | 'danger' | 'ghost'  → 색
 * - size: 'md' | 'sm'
 * - loading: true 면 스피너 + 비활성화 (제출 중 상태)
 * - to: 값이 있으면 <Link> 로 렌더링 (페이지 이동 버튼)
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  to,
  type = 'button',
  children,
  className = '',
  ...rest
}) {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading} {...rest}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
