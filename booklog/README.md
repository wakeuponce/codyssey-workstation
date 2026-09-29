# Codyssey Mission 03 · 북로그 (React SPA + Supabase)

읽은 책·읽는 책·읽고 싶은 책을 기록하는 **React SPA** 입니다.
화면을 예쁘게 그리는 것보다 **"사용자 이벤트 → 상태 변화 → 렌더링 변화"** 가 코드 어디에서 어떻게 이어지는지 드러내는 데 집중했습니다.

| 항목 | 내용 |
|---|---|
| 배포 URL | **https://wakeuponce.github.io/codyssey-workstation/booklog/** (GitHub Pages, 해시 라우터) |
| 저장소 | https://github.com/wakeuponce/codyssey-workstation (`booklog/` 폴더) |
| 핵심 데이터 | 책 기록 1종 (`books` 테이블) — 등록 / 목록 / 상세 / 수정 / 삭제 |
| 기술 스택 | React 19 · React Router 7 · Vite 8 · Supabase (Postgres + Auth, `@supabase/supabase-js` v2) · 순수 CSS(CSS 변수) · JavaScript(ES2022) |
| 품질 도구 | ESLint 10 (`react-hooks` 규칙) · Vitest 5 + Testing Library (단위/컴포넌트 20개) · Playwright (E2E 40개 시나리오) |
| 보너스 | 전역 상태(Context: 로그인 사용자·알림) · 메모이제이션(`useMemo`/`useCallback`/`React.memo`) · Supabase Auth + 보호 라우트 |

---

## 1. 스크린샷

| 목록 (`/books`) | 상세 (`/books/1`) |
|---|---|
| ![책 카드 목록, 상태 필터와 검색창](docs/screenshots/books-list.png) | ![책 상세, 수정·삭제 버튼](docs/screenshots/detail.png) |

**상태 UI — 모든 조회 화면이 같은 컴포넌트(`AsyncView`)를 사용**

| 로딩 | 에러 (+ 다시 시도) | 빈 상태 |
|---|---|---|
| ![스피너와 '책 목록을 불러오는 중입니다'](docs/screenshots/state-loading.png) | ![요청에 실패했습니다. 다시 시도하세요.](docs/screenshots/state-error.png) | ![표시할 데이터가 없습니다.](docs/screenshots/state-empty.png) |

**폼 UX (`/books/new`, `/books/:id/edit`)**

| 필수값 검증 에러 | 입력 → 미리보기 | 제출 중 | 저장 실패 |
|---|---|---|---|
| ![필드 아래 빨간 에러 문구](docs/screenshots/form-errors.png) | ![오른쪽 카드 미리보기가 입력값을 따라 바뀜](docs/screenshots/form-preview.png) | ![버튼이 '저장 중…' 스피너로 바뀌고 입력이 잠김](docs/screenshots/form-submitting.png) | ![상단에 '저장에 실패했습니다. 권한이 없습니다'](docs/screenshots/form-submit-error.png) |

**그 밖의 흐름**

| 저장 성공 → 상세 이동 + 알림 | 삭제 확인 | 필터 + 검색 | 404 |
|---|---|---|---|
| ![하단 토스트 '기록을 저장했습니다'](docs/screenshots/create-success.png) | ![삭제 확인 모달](docs/screenshots/delete-confirm.png) | ![완독 필터 + '리팩' 검색 결과 1권](docs/screenshots/books-filter.png) | ![404 페이지](docs/screenshots/not-found.png) |

| 홈 | 로그인 실패 | 내 서재 (보호 라우트) | 모바일 |
|---|---|---|---|
| ![홈: 통계와 최근 기록](docs/screenshots/home.png) | ![이메일 또는 비밀번호가 올바르지 않습니다](docs/screenshots/login-error.png) | ![로그인 사용자의 책 목록](docs/screenshots/profile.png) | ![모바일 목록](docs/screenshots/mobile-list.png) |

> 스크린샷은 Playwright(Chromium)로 촬영했습니다. 촬영 환경에서는 Supabase 에 접속할 수 없어서
> **Supabase REST/Auth API 와 같은 형식으로 응답하는 인메모리 목 서버**로 요청을 가로채 촬영했습니다(9장).
> 앱 코드는 실제 배포본과 동일합니다.

---

## 2. 로컬 실행 방법

### 준비물
- Node.js **20.19 이상** (개발 환경: Node 22, npm 10)
- Supabase 계정 (무료 플랜으로 충분)

### ① Supabase 프로젝트 준비 (최초 1회)
1. https://supabase.com → **New project** 생성
2. 왼쪽 메뉴 **SQL Editor → New query** 에 [`supabase/schema.sql`](supabase/schema.sql) 전체를 붙여넣고 **Run**
   → `books` 테이블, 수정시각 트리거, 접근 정책(RLS), 예시 데이터 3건이 만들어집니다.
3. **Project Settings → API** 에서 `Project URL` 과 `anon public` 키를 복사
4. (로그인 보너스 기능을 바로 써 보려면) **Authentication → Sign In / Providers → Email** 에서
   `Confirm email` 을 끄면 가입 즉시 로그인됩니다. 켜 두면 인증 메일의 링크를 누른 뒤 로그인할 수 있습니다.

### ② 실행
```bash
cd booklog
cp .env.example .env          # 복사 후 .env 에 ③의 두 값을 채운다
npm install
npm run dev                   # → http://localhost:5173
```

`.env` (커밋되지 않음 — 루트 `.gitignore` 와 `booklog/.gitignore` 모두 `.env` 를 제외)
```dotenv
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> `.env` 없이 실행하면 화면 상단에 **"Supabase 연결 정보가 없습니다"** 안내가 뜨고, 모든 조회 화면이
> 에러 상태("환경변수가 설정되지 않았습니다")로 표시됩니다. 설정 누락이 조용히 묻히지 않게 한 것입니다.

### ③ 기타 명령어
| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (저장 시 자동 반영) |
| `npm run build` | 배포용 빌드 → `dist/` |
| `npm run preview` | 빌드 결과를 로컬에서 확인 (http://localhost:4173) |
| `npm run lint` | ESLint (React Hooks 규칙 포함) |
| `npm test` | Vitest 단위·컴포넌트 테스트 |

---

## 3. 배포

### GitHub Pages (현재 배포 방식)
[`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml) 하나로 Mission 02 포트폴리오(루트)와 이 앱(`/booklog/`)을 함께 배포합니다.

1. 저장소 **Settings → Secrets and variables → Actions → New repository secret** 에 두 개 등록
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. `main` 브랜치에 `booklog/**` 변경이 push 되면 → `npm ci` → lint → test → **Secret 존재 확인** → build → 배포
3. 접속: https://wakeuponce.github.io/codyssey-workstation/booklog/

- **Secret 이 없으면 워크플로가 실패**하도록 했습니다. "배포는 됐는데 CRUD 가 안 되는" 상태를 만들지 않기 위해서입니다.
- GitHub Pages 는 `/books/1` 같은 경로를 `index.html` 로 돌려보내는 설정(rewrite)이 없어서, 새로고침하면 404 가 납니다.
  그래서 Pages 빌드만 **해시 라우터**(`/#/books/1`)를 쓰도록 `VITE_ROUTER_MODE=hash` 를 줍니다. 로컬·Vercel 에서는 일반 경로(`/books/1`)를 씁니다.
- `VITE_` 로 시작하는 값은 빌드 시 JS 파일에 **그대로 박힙니다.** 그래서 브라우저에 노출돼도 되는 `anon` 키만 쓰고,
  `service_role` 키는 절대 넣지 않습니다. 코드와 저장소에는 키가 전혀 없고, Secret 으로만 주입됩니다.

### Vercel (대안)
1. Vercel → **Add New Project** → 이 저장소 Import
2. **Root Directory: `booklog`** (Framework: Vite 자동 인식)
3. **Environment Variables** 에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 등록 → Deploy
4. [`vercel.json`](vercel.json) 의 rewrite 덕분에 `/books/1` 에서 새로고침해도 SPA 가 응답합니다. (Netlify 는 [`public/_redirects`](public/_redirects))

---

## 4. 폴더 구조

```
booklog/
├── index.html                  # Vite 진입 HTML (#root)
├── vite.config.js              # base 경로, 번들 분리, 테스트 환경
├── eslint.config.js
├── vercel.json / public/_redirects   # BrowserRouter 용 SPA rewrite
├── .env.example                # 환경변수 견본 (.env 는 커밋 금지)
├── supabase/schema.sql         # 테이블 + RLS + 예시 데이터
└── src/
    ├── main.jsx                # createRoot + StrictMode
    ├── App.jsx                 # 라우트 표 + 전역 Provider
    ├── pages/                  # ── 라우트 단위 화면 (URL 1개 = 파일 1개) ──
    │   ├── HomePage.jsx            /
    │   ├── LoginPage.jsx           /login
    │   ├── BooksPage.jsx           /books
    │   ├── BookNewPage.jsx         /books/new
    │   ├── BookDetailPage.jsx      /books/:id
    │   ├── BookEditPage.jsx        /books/:id/edit
    │   ├── ProfilePage.jsx         /profile   (보호 라우트)
    │   └── NotFoundPage.jsx        *
    ├── components/             # ── 재사용 UI (데이터를 직접 가져오지 않음, props 로만 동작) ──
    │   ├── Layout.jsx, Header.jsx, ProtectedRoute.jsx
    │   ├── AsyncView.jsx, Loading.jsx, ErrorState.jsx, EmptyState.jsx, Spinner.jsx
    │   ├── Button.jsx, Input.jsx, Select.jsx, FormField.jsx, Alert.jsx
    │   ├── BookCard.jsx, BookList.jsx, BookForm.jsx, StatusBadge.jsx, RatingStars.jsx, StatusFilter.jsx
    │   └── ConfirmDialog.jsx, Toast.jsx, PageHeader.jsx
    ├── hooks/                  # ── 커스텀 훅 (상태 + 부수효과 로직) ──
    │   ├── useAsync.js             조회 공통: loading/success/error + reload + abort
    │   ├── useBooks.js             목록 조회   (useAsync 사용)
    │   ├── useBook.js              상세 조회   (useAsync 사용)
    │   ├── useMutation.js          등록/수정/삭제/로그인: idle/pending/success/error
    │   ├── useForm.js              controlled input + 검증 + touched
    │   └── useDocumentTitle.js
    ├── contexts/               # ── 전역 상태 ──
    │   ├── AuthContext.jsx         로그인 사용자
    │   └── ToastContext.jsx        알림
    ├── lib/                    # ── React 와 무관한 순수 JS ──
    │   ├── supabase.js             클라이언트 생성 + 설정 누락 감지
    │   ├── booksApi.js             Supabase 호출은 이 파일에만 (fetch/create/update/delete)
    │   ├── books.js                상수, 필터·정렬·집계 함수
    │   ├── validation.js           폼 검증 규칙
    │   └── errors.js               에러 → 한국어 문장
    └── styles/index.css
```

**나눈 기준 한 줄 요약**: *URL 이 있으면 `pages`, 여러 곳에서 모양만 다르게 쓰이면 `components`, `useState`/`useEffect` 로직을 떼어낸 것이면 `hooks`, React 없이도 돌아가면 `lib`.*

---

## 5. 라우트

| 경로 | 페이지 | 하는 일 |
|---|---|---|
| `/` | `HomePage` | 상태별 권수 통계 + 최근 기록 3권 |
| `/login` | `LoginPage` | 로그인 / 회원가입 (모드 전환) |
| `/books` | `BooksPage` | 목록 + 상태 필터 + 검색 + 정렬 (조건은 `?status=&q=&sort=` 쿼리에 저장) |
| `/books/new` | `BookNewPage` | 등록 폼 → 성공 시 새 책 상세로 이동 |
| `/books/:id` | `BookDetailPage` | `useParams()` 의 `id` 로 조회, 수정·삭제 |
| `/books/:id/edit` | `BookEditPage` | 기존 값을 불러와 폼 초기값으로 → 저장 시 상세로 이동 |
| `/profile` | `ProfilePage` | **보호 라우트**. 비로그인 → `/login` 으로 보냈다가 로그인 후 되돌아옴 |
| `*` | `NotFoundPage` | 잘못된 주소 (예: `/no/such/page`) |

- 모든 라우트는 `Layout`(헤더·푸터) 의 `<Outlet />` 에 렌더링됩니다 → 공통 레이아웃이 전 페이지에 적용.
- 헤더의 `NavLink` 로 홈 / 책 목록 / 새 기록 / 로그인(또는 내 서재) 으로 이동하며, 현재 위치는 `is-active` 로 강조됩니다.
- `/books/new` 를 `/books/:id` 보다 먼저 선언했지만, React Router 는 **더 구체적인 경로를 우선** 매칭하므로 순서와 무관하게 `new` 가 id 로 해석되지 않습니다.
- 존재하지 않는 id(`/books/99999`)나 숫자가 아닌 id(`/books/abc`)는 404 가 아니라 **"책을 찾을 수 없습니다" 빈 상태**로 보여 줍니다. 경로 자체는 올바르고 데이터만 없기 때문입니다.

---

## 6. 컴포넌트 설계

### 6-1. 재사용 컴포넌트 (prop 으로 동작·표시가 달라지는 것 20개)

| 컴포넌트 | 주요 props | 어떻게 달라지나 | 사용처 |
|---|---|---|---|
| `Button` | `variant` `size` `loading` `to` | 색·크기 / 스피너+비활성화 / `to` 가 있으면 `<Link>` | 전 페이지 |
| `Input` | `multiline` + 모든 input 속성 | `input` ↔ `textarea` | 폼, 검색창 |
| `Select` | `options` | 옵션 목록 | 폼, 정렬 |
| `FormField` | `label` `error` `hint` `counter` `required` | 에러 시 빨간 테두리+문구, 글자 수, 필수 `*`. 자식 input 에 `id`·`aria-*` 자동 연결 | 등록·수정·로그인 폼 |
| `Alert` | `type` `title` | error / info / success 색 | 폼 상단 에러, 설정 누락 안내 |
| `Spinner` | `size` | 버튼용 sm / 페이지용 lg | `Button`, `Loading` |
| `Loading` | `label` | 문구 | `AsyncView`, `ProtectedRoute` |
| `ErrorState` | `error` `title` `onRetry` | 에러 종류별 설명 문구, 재시도 버튼 유무 | `AsyncView` |
| `EmptyState` | `title` `description` `icon` `action` | 문구·아이콘·버튼 | `AsyncView`, 404 |
| **`AsyncView`** | `status` `error` `isEmpty` `empty` `onRetry` | 4가지 상태 중 하나를 렌더링 | 홈·목록·상세·수정·프로필 |
| `BookCard` | `book` `to` | 상태 뱃지·별점 / 링크 여부(목록 ↔ 미리보기) | `BookList`, `BookForm` 미리보기 |
| `BookList` | `books` `getLink` | 카드 그리드 | 홈·목록·프로필 |
| `BookForm` | `initialValues` `onSubmit` `submitting` `submitError` `submitLabel` `onCancel` | 등록/수정 공용 | 등록·수정 페이지 |
| `StatusBadge` | `status` | 글자·색 | 카드, 상세 |
| `RatingStars` | `value` `onChange` `size` | `onChange` 없으면 읽기전용 표시, 있으면 입력(radio) | 카드, 상세, 폼 |
| `StatusFilter` | `value` `counts` `onChange` | 선택 탭, 개수 표시 | 목록 |
| `ConfirmDialog` | `open` `title` `message` `pending` `onConfirm` `onCancel` | 열림/닫힘, 처리 중 | 상세(삭제) |
| `Toast` | `type` `message` `onClose` | 아이콘·색 | `ToastProvider` |
| `PageHeader` | `title` `description` `actions` `eyebrow` | 제목·설명·우측 버튼 | 대부분 페이지 |
| `ProtectedRoute` | (Context 의 `user`) | 로그인 여부에 따라 `<Outlet/>` / `<Navigate/>` | 라우트 표 |

### 6-2. 컴포넌트를 쪼갠 기준

1. **같은 모양이 두 곳 이상 나오면 분리** — 책 카드는 목록·홈·프로필·폼 미리보기 4곳에서 쓰여서 `BookCard`. 폼 미리보기를 따로 만들지 않고 **같은 카드에 입력 중인 값을 넣었기** 때문에 "저장하면 이렇게 보인다" 가 정확히 일치합니다.
2. **같은 상태 분기가 반복되면 분리** — "로딩이면 스피너, 에러면 에러, 비었으면 빈 화면" 이 5개 페이지에 반복되므로 `AsyncView` 하나로 모았습니다. 페이지에는 `if (loading)` 문이 하나도 없습니다.
3. **"무엇을" 과 "어떻게" 를 분리** — `BookForm` 은 입력·검증·미리보기만 알고, *어디에 저장하는지* 는 모릅니다. 등록 페이지는 `createBook`, 수정 페이지는 `updateBook` 을 `onSubmit` 으로 넘겨 **폼 하나로 두 기능**을 처리합니다.
4. **페이지 vs UI** — `pages/` 는 훅으로 데이터를 가져오고 이벤트를 처리하는 "조립" 담당, `components/` 는 **데이터를 직접 가져오지 않고 props 만 받아 그리는** 담당입니다. (`components/` 안에서 `booksApi` 를 import 하는 파일은 0개)

---

## 7. 상태 설계

### 7-1. `props` vs `state`

| | `state` | `props` |
|---|---|---|
| 누가 소유 | 그 컴포넌트 자신 (`useState`) | 부모 |
| 바꾸는 법 | `setState` → 리렌더링 | 부모가 다른 값을 넘겨야만 바뀜 (자식은 읽기 전용) |
| 예 | `BookForm` 안의 `values` (입력값) | `BookForm` 이 받는 `submitting`, `submitError` |

자식이 부모의 상태를 바꿔야 할 때는 **함수를 props 로 내려 주고, 자식은 그 함수를 호출만** 합니다(상향 흐름).
예: `StatusFilter` 는 `value` 를 받아 그리고(하향), 탭을 누르면 `onChange('done')` 을 호출(상향) → 실제 상태 변경은 `BooksPage` 가 합니다.

### 7-2. 어떤 상태를 어디에 두었나

| 상태 | 위치 | 이유 |
|---|---|---|
| 폼 입력값 `values`, `touched` | `BookForm` → `useForm` (컴포넌트 지역) | 폼 밖에서는 아무도 필요 없음. 제출 시에만 `onSubmit(values)` 로 위로 올림 |
| 폼 에러 `errors` | **state 아님** — `values` 에서 매 렌더링마다 계산 (`useMemo`) | 입력값과 에러가 어긋날 수 없게 "단일 출처" 유지 |
| 제출 중 / 제출 실패 | 페이지의 `useMutation` | 성공 후 **이동(navigate)** 은 페이지의 일이므로 페이지가 소유하고, 폼에는 props 로 내림 |
| 목록 데이터 + 로딩/에러 | `useBooks()` (페이지가 호출) | 서버 데이터. 페이지마다 필요한 범위가 다름(전체 / 내 책) |
| 상세 데이터 + 로딩/에러 | `useBook(id)` | 라우트 파라미터 `id` 에 따라 달라짐 |
| 필터·검색어·정렬 | **URL 쿼리** (`useSearchParams`) | 새로고침·뒤로가기·링크 공유 후에도 같은 목록이 보이도록 |
| 보이는 목록 | **state 아님** — `books` + 쿼리에서 계산 (`useMemo`) | 원본과 필터 결과를 따로 저장하면 동기화 버그가 생김 |
| 삭제 확인창 열림 | `BookDetailPage` 의 `useState` | 그 페이지에서만 쓰임 |
| 로그인 사용자 | `AuthContext` (전역) | 헤더·보호 라우트·프로필이 모두 필요 — props 로 3단계 내리는 대신 Context |
| 알림 목록 | `ToastContext` (전역, **라우터 바깥**) | 저장 후 페이지가 바뀌어도 알림은 남아 있어야 함 |

원칙: **"이 값을 쓰는 컴포넌트들의 가장 가까운 공통 부모"** 에 두고, **다른 값에서 계산할 수 있으면 state 로 만들지 않는다.**

### 7-3. 커스텀 훅

```js
// hooks/useBooks.js
export function useBooks({ userId } = {}) {
  const fetcher = useCallback((signal) => fetchBooks({ userId, signal }), [userId]);
  const { data, ...rest } = useAsync(fetcher);
  return { books: data ?? [], ...rest };   // { books, status, error, reload }
}
```
페이지는 `const { books, status, error, reload } = useBooks();` 한 줄만 씁니다. Supabase 문법도, `useEffect` 도 페이지에 보이지 않습니다.

---

## 8. `useEffect` 와 비동기 흐름

### 8-1. 언제 실행되나

`useEffect(fn, deps)` 는 **렌더링이 화면에 반영된 뒤** 실행되고, 이후에는 **`deps` 중 하나라도 바뀐 렌더링 뒤에만** 다시 실행됩니다.
다시 실행되기 직전(또는 컴포넌트가 사라질 때) 이전 실행이 반환한 **cleanup 함수**가 먼저 호출됩니다.

```js
// hooks/useAsync.js (요약)
useEffect(() => {
  const controller = new AbortController();
  fetcher(controller.signal)                       // ② 요청
    .then((data) => setResult({ fetcher, attempt, data, error: null }))   // ③ 성공 → 리렌더링
    .catch((error) => { if (!controller.signal.aborted) setResult({ fetcher, attempt, data: null, error }); });
  return () => controller.abort();                 // ④ 다음 요청 전/언마운트 시 이전 요청 취소
}, [fetcher, attempt]);                            // ① 이 둘이 바뀔 때만 실행
```

| 의존성 | 바뀌는 때 | 결과 |
|---|---|---|
| `fetcher` | `useBook(id)` 의 `id` 가 바뀜 (`/books/1` → `/books/2`) | `useCallback` 이 새 함수를 만듦 → effect 재실행 → 새 id 로 요청 |
| `attempt` | "다시 시도" 클릭 → `reload()` | 같은 조건으로 한 번 더 요청 |

- **왜 데이터 요청을 `useEffect` 에서 하나?** 렌더링은 "현재 상태 → 화면" 을 계산하는 순수한 과정이어야 합니다. 서버 요청은 외부 세계와의 동기화(부수효과)이므로 렌더링이 끝난 뒤 effect 에서 합니다. 렌더링 중에 요청하면 렌더링마다 요청이 나갑니다.
- **`useCallback` 이 필요한 이유**: 함수는 렌더링마다 새로 만들어집니다. 그냥 넘기면 effect 가 매 렌더링마다 재실행 → 응답이 setState → 리렌더링 → 또 요청… 무한 루프가 됩니다. `[userId]` 가 같으면 같은 함수를 돌려주도록 고정했습니다.
- **cleanup 에서 abort 하는 이유**: `/books/1` 에서 `/books/2` 로 빠르게 이동하면 1번 응답이 늦게 도착해 2번 화면을 덮어쓸 수 있습니다(경쟁 상태). 이전 요청을 취소하고 취소된 요청의 결과는 무시합니다. 개발 모드의 `StrictMode` 는 effect 를 일부러 두 번 실행하는데, 첫 번째 요청이 cleanup 으로 취소되므로 화면에는 영향이 없습니다.
- **로딩 상태를 따로 `setState` 하지 않는 이유**: "마지막 응답이 지금의 `fetcher`/`attempt` 에 대한 것인가?" 로 로딩 여부를 **계산**합니다. effect 안에서 `setLoading(true)` 를 동기 호출하면 렌더링이 한 번 더 일어나고, ESLint `react-hooks/set-state-in-effect` 규칙에도 걸립니다.

### 8-2. 조회 vs 변경 — 두 가지 비동기 흐름

| | 조회 (`useAsync` 기반) | 변경 (`useMutation`) |
|---|---|---|
| 시작 | **화면이 나타나면** 자동 (`useEffect`) | **사용자 이벤트**(제출·삭제 클릭) 핸들러에서 `mutate()` |
| 상태 | `loading → success / error` | `idle → pending → success / error` |
| UI | `AsyncView` 가 Loading / ErrorState / EmptyState / 내용 | 버튼 `loading`, fieldset `disabled`, 상단 `Alert`, 성공 시 토스트 + `navigate` |

### 8-3. 로딩 / 성공 / 실패 / 빈 상태 표현

| 상태 | 조회 화면 | 폼 제출 |
|---|---|---|
| 로딩 | `<Loading>` 스피너 + "…불러오는 중입니다" | 버튼이 스피너 + "저장 중…" 으로, 모든 입력 잠금(`<fieldset disabled>`) → 중복 제출 불가 |
| 성공 | 데이터 렌더링 | 토스트 "저장했습니다" + 상세 페이지로 이동 |
| 실패 | `<ErrorState>` "요청에 실패했습니다. 다시 시도하세요." + 원인 + **다시 시도** | 폼 위 `<Alert>` "저장에 실패했습니다." + 원인. **입력값은 유지**되어 그대로 재시도 가능 |
| 빈 상태 | `<EmptyState>` "표시할 데이터가 없습니다." + "첫 책 등록하기". 필터 결과가 없을 때는 "조건에 맞는 책이 없습니다" + "필터 초기화" 로 구분 | — |

실패 원인은 `lib/errors.js` 가 사람이 읽을 문장으로 바꿉니다: 네트워크 끊김 / 권한(RLS, 401·403) / 테이블 없음 / 환경변수 누락 / 로그인 실패 등.

---

## 9. 사용자 이벤트 → 상태 변화 → 렌더링 변화

| # | 이벤트 | 바뀌는 상태 | 렌더링 변화 | 코드 |
|---|---|---|---|---|
| 1 | 상태 탭 클릭 / 검색어 입력 / 정렬 선택 | URL 쿼리 `status` `q` `sort` | `useMemo` 로 계산된 목록이 바뀌어 카드가 줄거나 순서가 바뀜, "N권 표시 중" 갱신 | `BooksPage` |
| 2 | 폼 입력 | `useForm` 의 `values` | 오른쪽 **미리보기 카드**, 글자 수 카운터, 에러 문구가 즉시 갱신 | `BookForm` |
| 3 | 독서 상태를 "다 읽은 책" 으로 변경 | `values.status` | **별점 입력이 나타나고 필수**가 됨, 내용 라벨이 "읽고 싶은 이유 → 감상평" 으로 바뀜 | `BookForm` |
| 4 | 등록/수정 제출 | `useMutation` `pending → success` | 버튼 "저장 중…" → 상세 페이지로 이동 + **토스트 알림** | `BookNewPage`, `BookEditPage` |
| 5 | 삭제 → 확인 | `confirmOpen`, `pending` | 모달 열림 → "처리 중…" → 목록으로 이동 + 토스트 | `BookDetailPage` |
| 6 | "다시 시도" 클릭 | `useAsync` 의 `attempt` | 에러 화면 → 로딩 → 목록 | `ErrorState` → `useAsync` |
| 7 | 로그인 / 로그아웃 | `AuthContext` 의 `session` | 헤더 "로그인" ↔ "내 서재", 보호 라우트 통과/차단 | `AuthContext`, `Header` |

### 하나의 기능이 연결되는 과정 — "책 등록"

```
[라우팅]   /books/new  ──▶  <Layout> 의 <Outlet/> 에 <BookNewPage/> 렌더링
[컴포넌트] BookNewPage ──▶ <BookForm initialValues={EMPTY_BOOK} onSubmit={handleSubmit} submitting={create.isPending} …/>
[상태]     BookForm 안 useForm: values = { title:'', author:'', status:'want', rating:0, review:'' }
[이벤트]   입력 onChange → setValues → 리렌더링 → input value · 미리보기 카드 · 글자 수 갱신
           제출 onSubmit → preventDefault → 검증
             ├─ 에러 있음 → submitted=true → 필드 아래 에러 표시, 첫 에러 필드로 focus (요청 안 보냄)
             └─ 통과     → onSubmit(values)  (자식 → 부모로 상향)
[비동기]   BookNewPage.handleSubmit → create.mutate(toBookPayload(values))
             → useMutation: status='pending' → BookForm 에 submitting=true 로 내려감 → 버튼 스피너·입력 잠금
             → booksApi.createBook → supabase.from('books').insert(…).select().single()
[렌더링]   성공 → showToast('…저장했습니다') + navigate(`/books/${created.id}`)
                  → 라우트 변경 → BookDetailPage 마운트 → useBook(id) 의 useEffect 가 새 데이터 조회 → 상세 표시
           실패 → status='error' → BookForm 에 submitError 로 내려감 → 폼 상단 Alert (입력값 유지)
```

---

## 10. 요구사항 충족 표

| 요구사항 | 구현 |
|---|---|
| React 18 이상 | React **19.3** |
| `pages` / `components` / `hooks`·`lib` 분리 | 4장 폴더 구조 |
| 공통 레이아웃 | `Layout`(헤더+`<Outlet/>`+푸터)이 모든 라우트의 부모 |
| 라우트 5개 이상 | **8개** (5장), 목록 `/books` · 상세 `/books/:id` 포함 |
| Not Found | `path: '*'` → `NotFoundPage` |
| 네비게이션 링크 | `Header` 의 `NavLink` 4개 (현재 위치 강조) |
| 재사용 컴포넌트 8개 이상 (prop 으로 달라짐) | **20개** (6-1) |
| 페이지/UI 분리 | `components/` 는 데이터 조회 없이 props 로만 동작 |
| 로딩/에러/빈 상태 통일 | `AsyncView` + `Loading`/`ErrorState`/`EmptyState` 를 5개 조회 화면이 공유 |
| controlled input | `useForm` 의 `values` ↔ `value`/`onChange` (폼 2개: 책, 로그인) |
| 목록/상세/로딩/에러 상태 | `useBooks`, `useBook`, `useAsync`, `useMutation` |
| 커스텀 훅 분리 | `useAsync` `useBooks` `useBook` `useMutation` `useForm` `useDocumentTitle` |
| CRUD (Supabase 원격) | `lib/booksApi.js` — `fetchBooks` `fetchBook` `createBook` `updateBook` `deleteBook` |
| 등록/수정 → 이동, 삭제 → 이동 | 등록·수정 성공 → 상세, 삭제 성공 → 목록(`replace`) |
| 필수값 검증 | 제목·저자·내용 필수, 길이 제한, "다 읽은 책" 은 별점 필수 (`lib/validation.js`) |
| 에러 메시지 위치 | 필드 바로 아래(`FormField`) + 서버 에러는 폼 상단(`Alert`) |
| 제출 중 표시 | 버튼 스피너 + "저장 중…" + `disabled`, 입력 전체 잠금 |
| 요청 실패 표시 | 네트워크·권한·기타 오류를 문장으로 변환해 표시 (8-3) |
| 상태 → 렌더링 변화 3곳 이상 | **7곳** (9장) |
| `.env` 분리, `.gitignore` | `.env.example` 만 커밋. 루트·`booklog` 모두 `.env` 제외 |
| 배포 + README | 3장 (GitHub Pages 워크플로, Secret 누락 시 배포 실패) |

### 보너스

| 과제 | 구현 |
|---|---|
| 전역 상태 | `AuthContext`(로그인 사용자), `ToastContext`(알림). `value` 를 `useMemo` 로 고정해 불필요한 리렌더링 방지 |
| 성능 최적화 | `useMemo`: 필터·정렬 결과, 통계, 폼 에러 / `useCallback`: 훅의 fetcher·핸들러 / `React.memo`: `BookCard` (검색어 입력 시 바뀌지 않은 카드는 다시 그리지 않음) / 번들: Supabase·React 를 별도 청크로 분리해 앱 수정 시 캐시 재사용 |
| 인증 + 보호 라우트 | Supabase Auth 이메일/비밀번호 로그인·가입·로그아웃, `ProtectedRoute` 로 `/profile` 보호, 로그인 후 원래 가려던 주소로 복귀. 로그인 상태로 등록한 책은 DB 기본값 `auth.uid()` 로 작성자가 기록되어 "내 서재" 에 모임 |

> **CRUD 를 로그인 없이 열어 둔 이유**: 평가 기준이 "배포 URL 에서 등록/수정/삭제가 동작" 이므로, 평가자가 가입·메일 인증을 거치지 않아도 되게 `anon` 에게도 쓰기 정책을 열었습니다([`schema.sql`](supabase/schema.sql) 3번). 실서비스라면 `insert/update/delete` 정책을 `auth.uid() = user_id` 로 제한하고 등록·수정 라우트도 `ProtectedRoute` 안으로 옮기면 됩니다.

---

## 11. 검증

### 단위·컴포넌트 테스트 (Vitest, 20개)
```bash
npm test
```
| 파일 | 확인 내용 |
|---|---|
| `lib/validation.test.js` | 필수값·길이·"다 읽은 책은 별점 필수"·이메일 형식 |
| `lib/books.test.js` | 필터·검색·정렬(원본 불변), 상태별 집계, payload 정리 |
| `components/AsyncView.test.jsx` | 로딩/에러(+재시도 클릭)/빈/성공 4가지 분기 |
| `components/BookForm.test.jsx` | 빈 제출 시 에러+포커스+미제출, 입력→미리보기, 상태 변경→별점 필수, 제출 중 비활성화, 실패 Alert |
| `hooks/useAsync.test.jsx` | loading→error→reload→success, 언마운트 시 abort |

### E2E (Playwright, 40개 체크)
빌드 결과(`vite preview`)를 Chromium 으로 열고, `https://<project>.supabase.co/rest/v1/books`·`/auth/v1/*` 요청을
PostgREST 형식으로 응답하는 인메모리 목 서버로 가로채서 실제 사용자처럼 클릭·입력했습니다. 결과: **40/40 통과 (3회 연속)**.

주요 시나리오: 홈 통계 → 목록 로딩 스피너 → 필터/검색/정렬 + URL 유지 → 상세 → 빈 폼 제출 에러 → 입력·미리보기 →
제출 중 잠금 → 등록 후 상세 이동+토스트 → 수정 → 삭제 확인·처리 중 → 목록 복귀 → 403 저장 실패 문구 →
없는 id → 네트워크 에러+다시 시도 → 빈 목록 → 404 → 비로그인 `/profile` 리다이렉트 → 로그인 실패 → 로그인 성공 후 복귀 →
로그아웃 → 모바일(390px) 가로 스크롤 없음 → 콘솔 에러 0건.
GitHub Pages 와 같은 구조(`/codyssey-workstation/booklog/#/books/7`)로 해시 라우터 빌드도 따로 띄워 상세 진입·새로고침·404 를 확인했습니다.

### 정적 검사
- `npm run lint` — 경고 0 (`react-hooks` 의 exhaustive-deps, set-state-in-effect 등 포함)
- `npm run build` — 청크 크기 경고 0
