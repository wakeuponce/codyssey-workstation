import { useCallback } from 'react';
import { fetchBook } from '../lib/booksApi';
import { useAsync } from './useAsync';

/** 라우트 파라미터 id 로 책 한 권 조회. 없으면 book === null (빈 상태) */
export function useBook(id) {
  const fetcher = useCallback((signal) => fetchBook(id, { signal }), [id]);
  const { data, ...rest } = useAsync(fetcher);
  return { book: data, ...rest };
}
