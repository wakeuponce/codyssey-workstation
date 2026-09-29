import BookCard from './BookCard';

/** 책 배열 → 카드 그리드. 목록/홈/프로필 페이지에서 재사용 */
export default function BookList({ books, getLink = (book) => `/books/${book.id}` }) {
  return (
    <ul className="book-grid">
      {books.map((book) => (
        <li key={book.id}>
          <BookCard book={book} to={getLink(book)} />
        </li>
      ))}
    </ul>
  );
}
