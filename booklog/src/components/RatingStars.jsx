/**
 * 별점. onChange 가 없으면 읽기 전용 표시, 있으면 클릭해서 고르는 입력 컴포넌트.
 * 입력 모드는 radio 그룹이라 키보드(←/→)로도 조작된다.
 */
export default function RatingStars({ value = 0, onChange, name = 'rating', size = 'md', disabled = false }) {
  const stars = [1, 2, 3, 4, 5];

  if (!onChange) {
    return (
      <span className={`stars stars--${size}`} aria-label={`별점 5점 중 ${value}점`} role="img">
        {stars.map((n) => (
          <span key={n} className={n <= value ? 'star is-on' : 'star'} aria-hidden="true">
            ★
          </span>
        ))}
      </span>
    );
  }

  return (
    <div className={`stars stars--input stars--${size}`} role="radiogroup" aria-label="별점 선택">
      {stars.map((n) => (
        <label key={n} className={n <= value ? 'star is-on' : 'star'}>
          <input
            type="radio"
            name={name}
            value={n}
            checked={Number(value) === n}
            onChange={() => onChange(n)}
            disabled={disabled}
            className="sr-only"
          />
          <span aria-hidden="true">★</span>
          <span className="sr-only">{n}점</span>
        </label>
      ))}
      <span className="stars__value">{value > 0 ? `${value}점` : '선택 안 함'}</span>
    </div>
  );
}
