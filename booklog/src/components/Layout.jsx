import { Outlet } from 'react-router';
import { isSupabaseConfigured } from '../lib/supabase';
import Alert from './Alert';
import Header from './Header';

/** 모든 페이지 공통 틀. <Outlet /> 자리에 현재 URL 에 맞는 페이지가 들어간다. */
export default function Layout() {
  return (
    <div className="app">
      <Header />
      <main className="container main">
        {!isSupabaseConfigured && (
          <Alert type="info" title="Supabase 연결 정보가 없습니다.">
            <code>.env</code> 에 <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code> 를 설정한 뒤 다시
            실행해 주세요. (README 4장 참고)
          </Alert>
        )}
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">Codyssey Mission 03 · React + Supabase SPA</div>
      </footer>
    </div>
  );
}
