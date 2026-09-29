import { STATUS, STATUS_KEYS } from '../lib/books';

const TABS = [{ value: 'all', label: '전체' }, ...STATUS_KEYS.map((key) => ({ value: key, label: STATUS[key].short }))];

/**
 * 상태 필터 탭. 현재 값(value)과 변경 함수(onChange)를 부모에게서 받는다.
 * → 필터 상태 자체는 부모(BooksPage, URL 쿼리)가 소유하고, 이 컴포넌트는 표시·이벤트 전달만 한다.
 */
export default function StatusFilter({ value, counts, onChange }) {
  return (
    <div className="filter" role="tablist" aria-label="독서 상태 필터">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          className={`filter__tab ${value === tab.value ? 'is-active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {counts && <span className="filter__count">{counts[tab.value] ?? 0}</span>}
        </button>
      ))}
    </div>
  );
}
