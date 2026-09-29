import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import Alert from '../components/Alert';
import AsyncView from '../components/AsyncView';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import RatingStars from '../components/RatingStars';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../contexts/ToastContext';
import { useBook } from '../hooks/useBook';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMutation } from '../hooks/useMutation';
import { deleteBook } from '../lib/booksApi';
import { formatDate, STATUS } from '../lib/books';
import { toUserMessage } from '../lib/errors';

/** 상세 페이지: /books/:id 의 id 로 한 권을 불러오고, 수정·삭제로 이어진다. */
export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { book, status, error, reload } = useBook(id);
  const remove = useMutation(deleteBook);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useDocumentTitle(book?.title ?? '책 상세');

  const handleDelete = async () => {
    const deletedId = await remove.mutate(id);
    setConfirmOpen(false);
    if (deletedId === undefined) return; // 실패 → remove.error 가 화면에 표시됨
    showToast(`『${book.title}』 기록을 삭제했습니다.`);
    navigate('/books', { replace: true }); // 삭제된 상세로 "뒤로가기" 하지 않도록 replace
  };

  return (
    <AsyncView
      status={status}
      error={error}
      onRetry={reload}
      loadingLabel="책 정보를 불러오는 중입니다…"
      isEmpty={!book}
      empty={{
        icon: '🔎',
        title: '책을 찾을 수 없습니다.',
        description: `id "${id}" 에 해당하는 기록이 없거나 이미 삭제되었습니다.`,
        action: <Button to="/books">목록으로</Button>,
      }}
    >
      {() => (
        <article className="detail">
          <Button to="/books" variant="ghost" size="sm" className="detail__back">
            ← 목록으로
          </Button>

          {remove.error && (
            <Alert title="삭제에 실패했습니다.">{toUserMessage(remove.error)}</Alert>
          )}

          <header className="detail__header">
            <div className="detail__meta">
              <StatusBadge status={book.status} />
              {book.status === 'done' && <RatingStars value={book.rating} />}
            </div>
            <h1 className="detail__title">{book.title}</h1>
            <p className="detail__author">{book.author}</p>
          </header>

          <section className="detail__body" aria-labelledby="review-title">
            <h2 id="review-title" className="detail__label">
              {STATUS[book.status]?.reviewLabel}
            </h2>
            <p className="detail__review">{book.review}</p>
          </section>

          <dl className="detail__dates">
            <div>
              <dt>등록</dt>
              <dd>{formatDate(book.created_at)}</dd>
            </div>
            {book.updated_at !== book.created_at && (
              <div>
                <dt>수정</dt>
                <dd>{formatDate(book.updated_at)}</dd>
              </div>
            )}
          </dl>

          <div className="detail__actions">
            <Button to={`/books/${book.id}/edit`} variant="secondary">
              수정
            </Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              삭제
            </Button>
          </div>

          <ConfirmDialog
            open={confirmOpen}
            title="이 기록을 삭제할까요?"
            message={`『${book.title}』 기록이 영구히 삭제됩니다. 되돌릴 수 없습니다.`}
            confirmLabel="삭제"
            pending={remove.isPending}
            onConfirm={handleDelete}
            onCancel={() => setConfirmOpen(false)}
          />
        </article>
      )}
    </AsyncView>
  );
}
