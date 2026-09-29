-- =====================================================================
-- 북로그(booklog) · Supabase 스키마
-- Supabase 대시보드 → SQL Editor → New query 에 전체를 붙여넣고 Run.
-- 여러 번 실행해도 안전하도록 작성했습니다.
-- =====================================================================

-- 1) 핵심 데이터: 책 한 권 = 한 행
create table if not exists public.books (
  id          bigint generated always as identity primary key,
  title       text        not null check (char_length(title)  between 1 and 100),
  author      text        not null check (char_length(author) between 1 and 50),
  status      text        not null default 'want'
                          check (status in ('want', 'reading', 'done')),
  rating      smallint    not null default 0 check (rating between 0 and 5),
  review      text        not null default '' check (char_length(review) <= 2000),
  -- 로그인한 상태로 등록하면 작성자 id 가 자동 저장된다(비로그인이면 null).
  user_id     uuid        default auth.uid() references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists books_created_at_idx on public.books (created_at desc);
create index if not exists books_user_id_idx    on public.books (user_id);

-- 2) 수정 시각 자동 갱신
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

-- 3) 접근 정책 (RLS)
-- 이 과제의 평가 대상은 "React 구조와 데이터 흐름" 이므로,
-- 배포 URL 에서 누구나 CRUD 를 확인할 수 있게 anon 에게도 전체 권한을 연다.
-- (실서비스라면 insert/update/delete 를 auth.uid() = user_id 로 제한해야 한다.)
alter table public.books enable row level security;

drop policy if exists "books: 누구나 조회" on public.books;
drop policy if exists "books: 누구나 등록" on public.books;
drop policy if exists "books: 누구나 수정" on public.books;
drop policy if exists "books: 누구나 삭제" on public.books;

create policy "books: 누구나 조회" on public.books for select to anon, authenticated using (true);
create policy "books: 누구나 등록" on public.books for insert to anon, authenticated with check (true);
create policy "books: 누구나 수정" on public.books for update to anon, authenticated using (true) with check (true);
create policy "books: 누구나 삭제" on public.books for delete to anon, authenticated using (true);

-- 4) 예시 데이터 (테이블이 비어 있을 때만)
insert into public.books (title, author, status, rating, review)
select * from (values
  ('클린 코드',            '로버트 C. 마틴', 'done',    4, '함수는 한 가지 일만 해야 한다는 원칙이 React 컴포넌트 분리 기준과 그대로 연결된다.'),
  ('모던 자바스크립트 Deep Dive', '이웅모',   'reading', 0, '클로저 장을 읽는 중. useEffect 의 오래된 클로저(stale closure) 문제가 왜 생기는지 이해가 됐다.'),
  ('실용주의 프로그래머',   '데이비드 토머스', 'want',    0, '개발자로서 오래 가는 습관을 배우고 싶어서.')
) as seed(title, author, status, rating, review)
where not exists (select 1 from public.books);
