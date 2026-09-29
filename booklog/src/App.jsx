import { createBrowserRouter, createHashRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import BookDetailPage from './pages/BookDetailPage';
import BookEditPage from './pages/BookEditPage';
import BookNewPage from './pages/BookNewPage';
import BooksPage from './pages/BooksPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';

/**
 * 라우트 표 — URL 과 페이지 컴포넌트의 1:1 대응.
 * 모든 페이지는 Layout(헤더·푸터) 안의 <Outlet /> 자리에 렌더링된다.
 */
const routes = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/books', element: <BooksPage /> },
      { path: '/books/new', element: <BookNewPage /> }, // '/books/:id' 보다 구체적이라 먼저 매칭됨
      { path: '/books/:id', element: <BookDetailPage /> },
      { path: '/books/:id/edit', element: <BookEditPage /> },
      {
        element: <ProtectedRoute />, // 로그인해야 들어갈 수 있는 구역
        children: [{ path: '/profile', element: <ProfilePage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

// 서버 설정이 필요 없는 정적 호스팅(GitHub Pages)에서는 해시 라우터(/#/books/1)를 쓴다.
const router =
  import.meta.env.VITE_ROUTER_MODE === 'hash'
    ? createHashRouter(routes)
    : createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  );
}
