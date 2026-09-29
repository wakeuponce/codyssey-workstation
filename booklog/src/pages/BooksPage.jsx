import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import AsyncView from '../components/AsyncView';
import BookList from '../components/BookList';
import Button from '../components/Button';
import Input from '../components/Input';
import PageHeader from '../components/PageHeader';
import Select from '../components/Select';
import StatusFilter from '../components/StatusFilter';
import { useBooks } from '../hooks/useBooks';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { countByStatus, filterAndSortBooks, SORT_OPTIONS } from '../lib/books';

/**
 * 목록 페이지.
 * - 서버 데이터(books)  : useBooks 커스텀 훅이 소유
 * - 화면 조건(필터·검색·정렬) : URL 쿼리(?status=done&q=클린&sort=title)가 소유
 *   → 새로고침·뒤로가기·링크 공유를 해도 같은 화면이 나온다.
 * - 보이는 목록 : 위 두 값에서 "계산" (별도 state 없음)
 */
export default function BooksPage() {
  useDocumentTitle('책 목록');
  const { books, status, error, reload } = useBooks();
  const [searchParams, setSearchParams] = useSearchParams();

  const filter = searchParams.get('status') ?? 'all';
  const query = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') ?? 'latest';

  const updateParam = useCallback(
    (key, value, defaultValue) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (!value || value === defaultValue) next.delete(key);
          else next.set(key, value);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // 필터·검색어·정렬 또는 원본 목록이 바뀔 때만 다시 계산
  const visibleBooks = useMemo(
    () => filterAndSortBooks(books, { status: filter, query, sort }),
    [books, filter, query, sort],
  );
  const counts = useMemo(() => countByStatus(books), [books]);
  const isFiltered = filter !== 'all' || query !== '';

  return (
    <>
      <PageHeader
        title="책 목록"
        description="카드를 누르면 상세 기록을 볼 수 있어요."
        actions={<Button to="/books/new">+ 새 기록</Button>}
      />

      <div className="toolbar">
        <StatusFilter value={filter} counts={status === 'success' ? counts : null} onChange={(v) => updateParam('status', v, 'all')} />
        <div className="toolbar__right">
          <Input
            type="search"
            value={query}
            onChange={(e) => updateParam('q', e.target.value, '')}
            placeholder="제목·저자 검색"
            aria-label="제목 또는 저자 검색"
            className="toolbar__search"
          />
          <Select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value, 'latest')}
            options={SORT_OPTIONS}
            aria-label="정렬 기준"
          />
        </div>
      </div>

      <AsyncView
        status={status}
        error={error}
        onRetry={reload}
        loadingLabel="책 목록을 불러오는 중입니다…"
        isEmpty={visibleBooks.length === 0}
        empty={
          isFiltered && books.length > 0
            ? {
                icon: '🔍',
                title: '조건에 맞는 책이 없습니다.',
                description: '필터나 검색어를 바꿔 보세요.',
                action: (
                  <Button variant="secondary" onClick={() => setSearchParams({}, { replace: true })}>
                    필터 초기화
                  </Button>
                ),
              }
            : {
                title: '표시할 데이터가 없습니다.',
                description: '첫 번째 책을 등록해 보세요.',
                action: <Button to="/books/new">첫 책 등록하기</Button>,
              }
        }
      >
        <p className="result-count" aria-live="polite">
          {visibleBooks.length}권 표시 중
        </p>
        <BookList books={visibleBooks} />
      </AsyncView>
    </>
  );
}
