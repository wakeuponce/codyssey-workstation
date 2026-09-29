import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

/**
 * 보호 라우트. 로그인하지 않았으면 /login 으로 보내고,
 * 로그인 후 원래 가려던 주소로 돌아올 수 있도록 location 을 state 로 넘긴다.
 */
export default function ProtectedRoute() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <Loading label="로그인 상태를 확인하는 중입니다…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
