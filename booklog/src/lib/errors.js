/**
 * Supabase / 네트워크 에러를 사용자에게 보여 줄 한국어 문장으로 바꾼다.
 * 에러 "객체" 는 훅이 들고 있고, 문장 변환은 화면(ErrorState·Alert)에서만 한다.
 */
export function toUserMessage(error) {
  if (!error) return '';
  if (error.name === 'ConfigError') return error.message;

  const message = String(error.message ?? error);
  const code = error.code ?? '';
  const status = error.status ?? 0;

  if (/failed to fetch|network|load failed|fetch failed/i.test(message)) {
    return '네트워크 연결을 확인해 주세요. 서버에 연결할 수 없습니다.';
  }
  if (code === '42501' || status === 401 || status === 403) {
    return '권한이 없습니다. 로그인 상태나 접근 정책을 확인해 주세요.';
  }
  if (code === 'PGRST205' || code === '42P01') {
    return 'books 테이블이 없습니다. supabase/schema.sql 을 먼저 실행해 주세요.';
  }
  if (code === '23514') return '입력값이 허용 범위를 벗어났습니다.';
  if (/invalid login credentials/i.test(message)) return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (/user already registered/i.test(message)) return '이미 가입된 이메일입니다. 로그인해 주세요.';
  if (/email not confirmed/i.test(message)) return '이메일 인증이 완료되지 않았습니다. 받은 메일함을 확인해 주세요.';
  return message || '알 수 없는 오류가 발생했습니다.';
}
