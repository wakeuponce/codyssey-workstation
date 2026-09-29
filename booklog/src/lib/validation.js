/**
 * 폼 유효성 검사 규칙. 값 → 에러 메시지(없으면 빈 문자열)를 돌려주는 순수 함수라
 * 컴포넌트 없이도 테스트할 수 있다.
 */
export const LIMITS = { title: 100, author: 50, review: 2000, reviewMin: 5 };

const bookRules = {
  title: (v) => {
    if (!v.trim()) return '제목을 입력해 주세요.';
    if (v.trim().length > LIMITS.title) return `제목은 ${LIMITS.title}자 이하로 입력해 주세요.`;
    return '';
  },
  author: (v) => {
    if (!v.trim()) return '저자를 입력해 주세요.';
    if (v.trim().length > LIMITS.author) return `저자는 ${LIMITS.author}자 이하로 입력해 주세요.`;
    return '';
  },
  status: (v) => (['want', 'reading', 'done'].includes(v) ? '' : '독서 상태를 선택해 주세요.'),
  // 다른 필드(status)에 따라 규칙이 달라지는 예: 다 읽은 책만 별점 필수
  rating: (v, values) => {
    if (values.status !== 'done') return '';
    return Number(v) >= 1 && Number(v) <= 5 ? '' : '다 읽은 책은 별점(1~5)을 매겨 주세요.';
  },
  review: (v) => {
    const length = v.trim().length;
    if (length === 0) return '내용을 입력해 주세요.';
    if (length < LIMITS.reviewMin) return `내용은 ${LIMITS.reviewMin}자 이상 입력해 주세요.`;
    if (length > LIMITS.review) return `내용은 ${LIMITS.review}자 이하로 입력해 주세요.`;
    return '';
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const authRules = {
  email: (v) => {
    if (!v.trim()) return '이메일을 입력해 주세요.';
    return EMAIL_RE.test(v.trim()) ? '' : '올바른 이메일 형식이 아닙니다.';
  },
  password: (v) => (v.length >= 6 ? '' : '비밀번호는 6자 이상이어야 합니다.'),
};

function runRules(rules, values) {
  return Object.fromEntries(
    Object.entries(rules)
      .map(([name, rule]) => [name, rule(values[name] ?? '', values)])
      .filter(([, message]) => message),
  );
}

export const validateBook = (values) => runRules(bookRules, values);
export const validateAuth = (values) => runRules(authRules, values);
export const hasErrors = (errors) => Object.keys(errors).length > 0;
