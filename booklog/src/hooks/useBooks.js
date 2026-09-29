import { useCallback } from 'react';
import { fetchBooks } from '../lib/booksApi';
import { useAsync } from './useAsync';

/** 책 목록 조회. userId 를 주면 그 사용자가 등록한 책만. */
export function useBooks({ userId } = {}) {
  // userId 가 바뀔 때만 새 함수 → useAsync 의 useEffect 가 그때만 다시 요청
  const fetcher = useCallback((signal) => fetchBooks({ userId, signal }), [userId]);
  const { data, ...rest } = useAsync(fetcher);
  return { books: data ?? [], ...rest };
}
