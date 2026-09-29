/** 빈 상태 공통 UI. action 에 버튼 등을 넣을 수 있다. */
export default function EmptyState({
  title = '표시할 데이터가 없습니다.',
  description,
  icon = '📚',
  action,
}) {
  return (
    <div className="state state--empty">
      <span className="state__icon state__icon--empty" aria-hidden="true">
        {icon}
      </span>
      <p className="state__title">{title}</p>
      {description && <p className="state__text">{description}</p>}
      {action && <div className="state__action">{action}</div>}
    </div>
  );
}
