import { useNavigate } from 'react-router';
import BookForm from '../components/BookForm';
import PageHeader from '../components/PageHeader';
import { useToast } from '../contexts/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMutation } from '../hooks/useMutation';
import { createBook } from '../lib/booksApi';
import { EMPTY_BOOK, toBookPayload } from '../lib/books';

/** 등록: 폼 제출 → createBook → 성공 시 토스트 + 새 책 상세 페이지로 이동 */
export default function BookNewPage() {
  useDocumentTitle('새 기록');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const create = useMutation(createBook);

  const handleSubmit = async (values) => {
    const created = await create.mutate(toBookPayload(values));
    if (!created) return; // 실패 → create.error 를 폼 상단에 표시
    showToast(`『${created.title}』 기록을 저장했습니다.`);
    navigate(`/books/${created.id}`);
  };

  return (
    <>
      <PageHeader title="새 기록 쓰기" description="* 표시는 필수 입력입니다." />
      <BookForm
        initialValues={EMPTY_BOOK}
        onSubmit={handleSubmit}
        submitting={create.isPending}
        submitError={create.error}
        submitLabel="등록하기"
        onCancel={() => navigate(-1)}
      />
    </>
  );
}
