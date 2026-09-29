import { describe, expect, it } from 'vitest';
import { hasErrors, validateAuth, validateBook } from './validation';

const valid = { title: '클린 코드', author: '로버트 C. 마틴', status: 'want', rating: 0, review: '읽어 보고 싶다' };

describe('validateBook', () => {
  it('모든 값이 올바르면 에러가 없다', () => {
    expect(hasErrors(validateBook(valid))).toBe(false);
  });

  it('제목·저자·내용이 비어 있으면(공백만 있어도) 에러', () => {
    const errors = validateBook({ ...valid, title: '   ', author: '', review: '' });
    expect(errors).toMatchObject({
      title: '제목을 입력해 주세요.',
      author: '저자를 입력해 주세요.',
      review: '내용을 입력해 주세요.',
    });
  });

  it('길이 제한을 검사한다', () => {
    const errors = validateBook({ ...valid, title: 'a'.repeat(101), review: '짧음' });
    expect(errors.title).toMatch('100자 이하');
    expect(errors.review).toMatch('5자 이상');
  });

  it('다 읽은 책만 별점이 필수다 (다른 필드에 의존하는 규칙)', () => {
    expect(validateBook({ ...valid, status: 'done', rating: 0 }).rating).toBeTruthy();
    expect(validateBook({ ...valid, status: 'done', rating: 4 }).rating).toBeUndefined();
    expect(validateBook({ ...valid, status: 'reading', rating: 0 }).rating).toBeUndefined();
  });
});

describe('validateAuth', () => {
  it('이메일 형식과 비밀번호 길이를 검사한다', () => {
    expect(validateAuth({ email: 'abc', password: '123' })).toEqual({
      email: '올바른 이메일 형식이 아닙니다.',
      password: '비밀번호는 6자 이상이어야 합니다.',
    });
    expect(validateAuth({ email: 'a@b.co', password: '123456' })).toEqual({});
  });
});
