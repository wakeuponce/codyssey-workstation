/** 책 데이터(도메인) 관련 상수와 순수 함수. React 와 무관하므로 lib 에 둔다. */

export const STATUS = {
  want: { label: '읽고 싶은 책', short: '읽고 싶음', reviewLabel: '읽고 싶은 이유' },
  reading: { label: '읽는 중', short: '읽는 중', reviewLabel: '읽으며 든 생각' },
  done: { label: '다 읽은 책', short: '완독', reviewLabel: '감상평' },
};

export const STATUS_KEYS = Object.keys(STATUS);

export const SORT_OPTIONS = [
  { value: 'latest', label: '최신 등록순' },
  { value: 'title', label: '제목순' },
  { value: 'rating', label: '별점 높은순' },
];

export const EMPTY_BOOK = { title: '', author: '', status: 'want', rating: 0, review: '' };

/** 폼 → DB 로 보낼 값만 골라내고 공백을 정리한다. */
export function toBookPayload(values) {
  return {
    title: values.title.trim(),
    author: values.author.trim(),
    status: values.status,
    rating: values.status === 'done' ? Number(values.rating) : 0,
    review: values.review.trim(),
  };
}

/** 목록 화면의 필터·검색·정렬. 원본 배열은 건드리지 않는다. */
export function filterAndSortBooks(books, { status = 'all', query = '', sort = 'latest' } = {}) {
  const keyword = query.trim().toLowerCase();

  const filtered = books.filter((book) => {
    if (status !== 'all' && book.status !== status) return false;
    if (!keyword) return true;
    return (
      book.title.toLowerCase().includes(keyword) || book.author.toLowerCase().includes(keyword)
    );
  });

  const compare = {
    latest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
    title: (a, b) => a.title.localeCompare(b.title, 'ko'),
    rating: (a, b) => b.rating - a.rating || new Date(b.created_at) - new Date(a.created_at),
  }[sort] ?? (() => 0);

  return [...filtered].sort(compare);
}

/** 상태별 권수 { all, want, reading, done } */
export function countByStatus(books) {
  return books.reduce(
    (acc, { status }) => ({ ...acc, [status]: (acc[status] ?? 0) + 1 }),
    { all: books.length, want: 0, reading: 0, done: 0 },
  );
}

export function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(value));
}
