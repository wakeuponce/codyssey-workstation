import { NavLink } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: '홈', end: true },
  { to: '/books', label: '책 목록', end: true },
  { to: '/books/new', label: '새 기록' },
];

/** 공통 헤더. 로그인 여부(전역 상태)에 따라 오른쪽 메뉴가 바뀐다. */
export default function Header() {
  const { user, initializing } = useAuth();
  const navClass = ({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`;

  return (
    <header className="header">
      <div className="container header__inner">
        <NavLink to="/" className="logo">
          <span className="logo__mark" aria-hidden="true">📖</span>
          북로그
        </NavLink>
        <nav aria-label="주요 메뉴">
          <ul className="nav">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={navClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              {initializing ? (
                <span className="nav__link nav__link--muted">…</span>
              ) : user ? (
                <NavLink to="/profile" className={navClass} title={user.email}>
                  내 서재
                </NavLink>
              ) : (
                <NavLink to="/login" className={navClass}>
                  로그인
                </NavLink>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
