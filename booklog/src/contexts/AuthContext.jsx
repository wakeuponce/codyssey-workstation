import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabase, supabase } from '../lib/supabase';

/**
 * 전역 상태 ①: 로그인 사용자.
 * 헤더(로그인/로그아웃 버튼), 보호 라우트, 프로필 페이지, 책 등록(작성자 표시) 등
 * 서로 멀리 떨어진 컴포넌트가 같은 값을 써야 하므로 props 로 내려보내는 대신 Context 에 둔다.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  // Supabase 가 없으면 확인할 세션도 없으므로 처음부터 "확인 완료"
  const [initializing, setInitializing] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return undefined;

    // 1) 새로고침 직후: 저장된 세션 복원
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });

    // 2) 이후 로그인/로그아웃/토큰 갱신이 일어날 때마다 구독으로 반영
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => data.subscription.unsubscribe(); // 언마운트 시 구독 해제
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signUp = useCallback(async ({ email, password }) => {
    const { data, error } = await getSupabase().auth.signUp({ email, password });
    if (error) throw error;
    return data; // 이메일 인증이 켜져 있으면 data.session === null
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
  }, []);

  // value 객체를 메모이제이션 → session 이 바뀔 때만 구독 컴포넌트가 리렌더링된다.
  const value = useMemo(
    () => ({ user: session?.user ?? null, initializing, signIn, signUp, signOut }),
    [session, initializing, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth 는 <AuthProvider> 안에서만 사용할 수 있습니다.');
  return context;
}
