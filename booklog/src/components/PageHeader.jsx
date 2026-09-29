/** 페이지 상단 제목 영역. actions 에 버튼을 넣으면 오른쪽에 배치된다. */
export default function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
        <h1 className="page-header__title">{title}</h1>
        {description && <p className="page-header__desc">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}
