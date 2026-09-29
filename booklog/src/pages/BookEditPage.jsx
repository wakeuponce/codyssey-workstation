import { useNavigate, useParams } from 'react-router';
import AsyncView from '../components/AsyncView';
import BookForm from '../components/BookForm';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import { useToast } from '../contexts/ToastContext';
import { useBook } from '../hooks/useBook';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMutation } from '../hooks/useMutation';
import { updateBook } from '../lib/booksApi';
import { toBookPayload } from '../lib/books';

/** 수정: 기존 값을 불러와 폼 초기값으로 → 제출 → updateBook → 상세로 이동 */
export default function BookEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { book, status, error, reload } = useBook(id);
  const update = useMutation((values) => updateBook(id, toBookPayload(values)));

  useDocumentTitle(book ? `${book.title} 수정` : '기록 수정');

  const handleSubmit = async (values) => {
    const updated = await update.mutate(values);
    if (!updated) return;
    showToast('수정 내용을 저장했습니다.');
    navigate(`/books/${id}`, { replace: true });
  };

  return (
    <>
      <PageHeader title="기록 수정" description="* 표시는 필수 입력입니다." />
      <AsyncView
        status={status}
        error={error}
        onRetry={reload}
        loadingLabel="수정할 기록을 불러오는 중입니다…"
        isEmpty={!book}
        empty={{
          icon: '🔎',
          title: '수정할 책을 찾을 수 없습니다.',
          action: <Button to="/books">목록으로</Button>,
        }}
      >
        {() => (
          <BookForm
            initialValues={{
              title: book.title,
              author: book.author,
              status: book.status,
              rating: book.rating,
              review: book.review,
            }}
            onSubmit={handleSubmit}
            submitting={update.isPending}
            submitError={update.error}
            submitLabel="수정 저장"
            onCancel={() => navigate(`/books/${id}`)}
          />
        )}
      </AsyncView>
    </>
  );
}
