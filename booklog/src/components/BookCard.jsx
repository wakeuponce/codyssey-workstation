import { memo } from 'react';
import { Link } from 'react-router';
import { formatDate } from '../lib/books';
import RatingStars from './RatingStars';
import StatusBadge from './StatusBadge';

/**
 * 책 카드 1장. to 가 있으면 카드 전체가 상세 페이지 링크가 된다(없으면 미리보기용).
 * React.memo: 검색어를 한 글자 칠 때마다 목록이 다시 그려져도, props(book)가 같은 카드는 건너뛴다.
 */
function BookCard({ book, to }) {
  const body = (
    <>
      <div className="book-card__head">
        <StatusBadge status={book.status} />
        {book.status === 'done' && <RatingStars value={book.rating} size="sm" />}
      </div>
      <h3 className="book-card__title">{book.title || '제목 없음'}</h3>
      <p className="book-card__author">{book.author || '저자 미입력'}</p>
      {book.review && <p className="book-card__review">{book.review}</p>}
      {book.created_at && <p className="book-card__date">{formatDate(book.created_at)} 등록</p>}
    </>
  );

  return (
    <article className="book-card">
      {to ? (
        <Link to={to} className="book-card__link">
          {body}
        </Link>
      ) : (
        <div className="book-card__link">{body}</div>
      )}
    </article>
  );
}

export default memo(BookCard);
