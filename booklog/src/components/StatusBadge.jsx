import { STATUS } from '../lib/books';

/** 독서 상태 뱃지. status 값에 따라 글자와 색이 바뀐다. */
export default function StatusBadge({ status }) {
  return <span className={`badge badge--${status}`}>{STATUS[status]?.short ?? status}</span>;
}
