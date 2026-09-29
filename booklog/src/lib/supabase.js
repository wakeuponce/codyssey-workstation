import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** .env(로컬) 또는 배포 대시보드(Vercel·GitHub Secrets)에 두 값이 모두 있어야 true */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;

export class ConfigError extends Error {
  constructor() {
    super('Supabase 환경변수(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)가 설정되지 않았습니다.');
    this.name = 'ConfigError';
  }
}

/** API 함수에서 사용하는 클라이언트. 설정이 없으면 화면에 에러 상태로 드러나도록 예외를 던진다. */
export function getSupabase() {
  if (!supabase) throw new ConfigError();
  return supabase;
}
