import { useNavigate } from 'react-router';
import Alert from '../components/Alert';
import AsyncView from '../components/AsyncView';
import BookList from '../components/BookList';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useBooks } from '../hooks/useBooks';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMutation } from '../hooks/useMutation';
import { formatDate } from '../lib/books';
import { toUserMessage } from '../lib/errors';

/** 보호 라우트(/profile): 로그인한 사용자 정보 + 내가 등록한 책 */
export default function ProfilePage() {
  useDocumentTitle('내 서재');
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { books, status, error, reload } = useBooks({ userId: user.id });
  const logout = useMutation(signOut);

  const handleLogout = async () => {
    await logout.mutate();
    showToast('로그아웃했습니다.', 'info');
    navigate('/', { replace: true });
  };

  return (
    <>
      <PageHeader
        eyebrow="내 서재"
        title={user.email}
        description={`가입일 ${formatDate(user.created_at)}`}
        actions={
          <Button variant="secondary" onClick={handleLogout} loading={logout.isPending}>
            로그아웃
          </Button>
        }
      />
      {logout.error && <Alert title="로그아웃에 실패했습니다.">{toUserMessage(logout.error)}</Alert>}

      <section className="section" aria-labelledby="my-books-title">
        <h2 id="my-books-title" className="section__title">
          내가 등록한 책 {status === 'success' && <span className="muted">({books.length})</span>}
        </h2>
        <AsyncView
          status={status}
          error={error}
          onRetry={reload}
          isEmpty={books.length === 0}
          empty={{
            description: '로그인한 상태로 등록한 책이 여기에 모입니다.',
            action: <Button to="/books/new">책 등록하기</Button>,
          }}
        >
          <BookList books={books} />
        </AsyncView>
      </section>
    </>
  );
}
