import { useMemo } from 'react';
import AsyncView from '../components/AsyncView';
import BookList from '../components/BookList';
import Button from '../components/Button';
import { useBooks } from '../hooks/useBooks';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { countByStatus, STATUS, STATUS_KEYS } from '../lib/books';

/** 홈: 서비스 소개 + 상태별 통계 + 최근 기록 3권 */
export default function HomePage() {
  useDocumentTitle('');
  const { books, status, error, reload } = useBooks();
  const counts = useMemo(() => countByStatus(books), [books]);

  return (
    <>
      <section className="hero">
        <p className="hero__eyebrow">나의 독서 기록장</p>
        <h1 className="hero__title">
          읽은 책, 읽는 책, <br />
          읽고 싶은 책을 한곳에.
        </h1>
        <p className="hero__desc">책 제목과 감상을 기록하고, 상태별로 모아 보세요.</p>
        <div className="hero__actions">
          <Button to="/books/new">새 기록 쓰기</Button>
          <Button to="/books" variant="secondary">
            전체 목록 보기
          </Button>
        </div>
      </section>

      <section className="section" aria-labelledby="stats-title">
        <h2 id="stats-title" className="section__title">
          한눈에 보기
        </h2>
        <AsyncView status={status} error={error} onRetry={reload} loadingLabel="통계를 불러오는 중입니다…">
          <ul className="stats">
            {STATUS_KEYS.map((key) => (
              <li key={key} className={`stat stat--${key}`}>
                <span className="stat__label">{STATUS[key].label}</span>
                <strong className="stat__value">{counts[key]}</strong>
              </li>
            ))}
          </ul>
        </AsyncView>
      </section>

      <section className="section" aria-labelledby="recent-title">
        <div className="section__head">
          <h2 id="recent-title" className="section__title">
            최근 기록
          </h2>
          <Button to="/books" variant="ghost" size="sm">
            더 보기 →
          </Button>
        </div>
        <AsyncView
          status={status}
          error={error}
          onRetry={reload}
          isEmpty={books.length === 0}
          empty={{
            description: '아직 기록한 책이 없어요. 첫 번째 책을 등록해 보세요.',
            action: <Button to="/books/new">첫 책 등록하기</Button>,
          }}
        >
          <BookList books={books.slice(0, 3)} />
        </AsyncView>
      </section>
    </>
  );
}
