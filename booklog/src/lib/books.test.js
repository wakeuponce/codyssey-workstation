import { describe, expect, it } from 'vitest';
import { countByStatus, filterAndSortBooks, toBookPayload } from './books';

const books = [
  { id: 1, title: '클린 코드', author: '마틴', status: 'done', rating: 4, created_at: '2026-01-01' },
  { id: 2, title: '리팩터링', author: '파울러', status: 'reading', rating: 0, created_at: '2026-03-01' },
  { id: 3, title: '가나다', author: '마틴', status: 'done', rating: 5, created_at: '2026-02-01' },
];

describe('filterAndSortBooks', () => {
  it('기본은 최신 등록순', () => {
    expect(filterAndSortBooks(books).map((b) => b.id)).toEqual([2, 3, 1]);
  });
  it('상태 필터 + 검색어(제목·저자)', () => {
    expect(filterAndSortBooks(books, { status: 'done' }).map((b) => b.id)).toEqual([3, 1]);
    expect(filterAndSortBooks(books, { query: '마틴' }).map((b) => b.id)).toEqual([3, 1]);
    expect(filterAndSortBooks(books, { query: '리팩' }).map((b) => b.id)).toEqual([2]);
  });
  it('제목순 / 별점순 정렬, 원본은 그대로', () => {
    expect(filterAndSortBooks(books, { sort: 'title' }).map((b) => b.id)).toEqual([3, 2, 1]);
    expect(filterAndSortBooks(books, { sort: 'rating' }).map((b) => b.id)).toEqual([3, 1, 2]);
    expect(books.map((b) => b.id)).toEqual([1, 2, 3]);
  });
});

it('countByStatus', () => {
  expect(countByStatus(books)).toEqual({ all: 3, want: 0, reading: 1, done: 2 });
});

it('toBookPayload: 공백 제거, 다 읽지 않은 책의 별점은 0', () => {
  expect(toBookPayload({ title: ' a ', author: ' b ', status: 'reading', rating: 3, review: ' c ' })).toEqual({
    title: 'a', author: 'b', status: 'reading', rating: 0, review: 'c',
  });
});
