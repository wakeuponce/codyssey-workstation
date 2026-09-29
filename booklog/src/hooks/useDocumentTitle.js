import { useEffect } from 'react';

/** 페이지 제목(브라우저 탭) 변경 — 외부 시스템(document)과 동기화하는 가장 단순한 useEffect 예 */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · 북로그` : '북로그 · 나의 독서 기록';
  }, [title]);
}
