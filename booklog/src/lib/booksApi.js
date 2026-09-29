import { getSupabase } from './supabase';

/**
 * Supabase 와 통신하는 함수는 이 파일에만 둔다.
 * 컴포넌트·훅은 "무엇을 가져올지" 만 알고, "어떻게 가져오는지"(SDK 문법)는 모른다.
 * 모든 함수는 성공 시 데이터를 반환하고, 실패 시 에러를 throw 한다.
 */
const TABLE = 'books';
const COLUMNS = 'id, title, author, status, rating, review, user_id, created_at, updated_at';

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function fetchBooks({ userId, signal } = {}) {
  let query = getSupabase().from(TABLE).select(COLUMNS).order('created_at', { ascending: false });
  if (userId) query = query.eq('user_id', userId);
  if (signal) query = query.abortSignal(signal);
  return unwrap(await query);
}

/** 존재하지 않으면 null (에러가 아니라 "없음" 상태로 다룬다) */
export async function fetchBook(id, { signal } = {}) {
  if (!/^\d+$/.test(String(id))) return null;
  let query = getSupabase().from(TABLE).select(COLUMNS).eq('id', id);
  if (signal) query = query.abortSignal(signal);
  return unwrap(await query.maybeSingle());
}

export async function createBook(payload) {
  return unwrap(await getSupabase().from(TABLE).insert(payload).select(COLUMNS).single());
}

export async function updateBook(id, payload) {
  const data = unwrap(
    await getSupabase().from(TABLE).update(payload).eq('id', id).select(COLUMNS).maybeSingle(),
  );
  if (!data) throw new Error('수정할 책을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.');
  return data;
}

export async function deleteBook(id) {
  const data = unwrap(await getSupabase().from(TABLE).delete().eq('id', id).select('id'));
  if (data.length === 0) throw new Error('삭제할 책을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.');
  return id;
}
