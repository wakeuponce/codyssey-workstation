import { useLocation } from 'react-router';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('페이지를 찾을 수 없음');
  const { pathname } = useLocation();
  return (
    <EmptyState
      icon="🧭"
      title="404 · 페이지를 찾을 수 없습니다."
      description={`"${pathname}" 은(는) 없는 주소입니다.`}
      action={
        <div className="row">
          <Button to="/">홈으로</Button>
          <Button to="/books" variant="secondary">
            책 목록
          </Button>
        </div>
      }
    />
  );
}
