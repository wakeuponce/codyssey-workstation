import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import Alert from '../components/Alert';
import Button from '../components/Button';
import FormField from '../components/FormField';
import Input from '../components/Input';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useForm } from '../hooks/useForm';
import { useMutation } from '../hooks/useMutation';
import { toUserMessage } from '../lib/errors';
import { isSupabaseConfigured } from '../lib/supabase';
import { validateAuth } from '../lib/validation';

const MODES = {
  signIn: { title: '로그인', submit: '로그인', switchText: '계정이 없나요?', switchLabel: '회원가입' },
  signUp: { title: '회원가입', submit: '가입하기', switchText: '이미 계정이 있나요?', switchLabel: '로그인' },
};

export default function LoginPage() {
  const [mode, setMode] = useState('signIn');
  const [notice, setNotice] = useState('');
  const { user, signIn, signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/profile';

  useDocumentTitle(MODES[mode].title);

  const { values, visibleError, handleChange, handleBlur, handleSubmit } = useForm(
    { email: '', password: '' },
    validateAuth,
  );
  const auth = useMutation(mode === 'signIn' ? signIn : signUp);

  if (user && !auth.isPending) return <Navigate to={from} replace />;

  const onValid = async (credentials) => {
    setNotice('');
    const result = await auth.mutate(credentials);
    if (!result) return;
    if (mode === 'signUp' && !result.session) {
      // Supabase "Confirm email" 설정이 켜져 있으면 메일 인증 후 로그인 가능
      setNotice('확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해 주세요.');
      setMode('signIn');
      return;
    }
    showToast(`${result.user.email} 님, 환영합니다!`);
    navigate(from, { replace: true });
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'signIn' ? 'signUp' : 'signIn'));
    setNotice('');
    auth.reset();
  };

  return (
    <div className="auth">
      <PageHeader
        title={MODES[mode].title}
        description="로그인하면 내가 등록한 책을 '내 서재'에서 모아 볼 수 있어요. (목록 조회·등록은 로그인 없이도 가능)"
      />
      <form className="form auth__form" onSubmit={handleSubmit(onValid)} noValidate>
        {!isSupabaseConfigured && <Alert type="info">Supabase 설정 후 로그인할 수 있습니다.</Alert>}
        {notice && <Alert type="success">{notice}</Alert>}
        {auth.error && <Alert title={`${MODES[mode].title}에 실패했습니다.`}>{toUserMessage(auth.error)}</Alert>}

        <fieldset className="form__fields" disabled={auth.isPending}>
          <FormField label="이메일" id="email" required error={visibleError('email')}>
            <Input type="email" name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} autoComplete="email" />
          </FormField>
          <FormField label="비밀번호" id="password" required error={visibleError('password')} hint="6자 이상">
            <Input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
            />
          </FormField>
        </fieldset>

        <Button type="submit" loading={auth.isPending} className="auth__submit">
          {auth.isPending ? '처리 중…' : MODES[mode].submit}
        </Button>
        <p className="auth__switch">
          {MODES[mode].switchText}{' '}
          <button type="button" className="link-button" onClick={toggleMode}>
            {MODES[mode].switchLabel}
          </button>
        </p>
      </form>
    </div>
  );
}
