import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { EMPTY_BOOK } from '../lib/books';
import BookForm from './BookForm';

function renderForm(props = {}) {
  const onSubmit = vi.fn();
  render(
    <MemoryRouter>
      <BookForm initialValues={EMPTY_BOOK} onSubmit={onSubmit} submitLabel="등록하기" {...props} />
    </MemoryRouter>,
  );
  return { onSubmit, user: userEvent.setup() };
}

describe('BookForm', () => {
  it('빈 값으로 제출하면 필드 옆에 에러가 뜨고 onSubmit 이 호출되지 않는다', async () => {
    const { onSubmit, user } = renderForm();
    await user.click(screen.getByRole('button', { name: '등록하기' }));
    expect(screen.getByText('제목을 입력해 주세요.')).toBeInTheDocument();
    expect(screen.getByText('저자를 입력해 주세요.')).toBeInTheDocument();
    expect(screen.getByLabelText(/제목/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/제목/)).toHaveFocus(); // 첫 에러 필드로 포커스
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('입력하면 미리보기가 바뀌고, 올바른 값이면 onSubmit(values)', async () => {
    const { onSubmit, user } = renderForm();
    await user.type(screen.getByLabelText(/제목/), '리팩터링');
    await user.type(screen.getByLabelText(/저자/), '마틴 파울러');
    await user.type(screen.getByLabelText(/읽고 싶은 이유/), '코드 냄새를 알고 싶다');

    const preview = screen.getByRole('complementary', { name: '카드 미리보기' });
    expect(preview).toHaveTextContent('리팩터링');
    expect(preview).toHaveTextContent('마틴 파울러');

    await user.click(screen.getByRole('button', { name: '등록하기' }));
    expect(onSubmit).toHaveBeenCalledWith({
      title: '리팩터링', author: '마틴 파울러', status: 'want', rating: 0, review: '코드 냄새를 알고 싶다',
    });
  });

  it("상태를 '다 읽은 책' 으로 바꾸면 별점 입력이 나타나고 필수가 된다", async () => {
    const { onSubmit, user } = renderForm({
      initialValues: { ...EMPTY_BOOK, title: 'a', author: 'b', review: '다섯 글자 이상' },
    });
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/독서 상태/), 'done');
    expect(screen.getByLabelText('감상평', { exact: false })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '등록하기' }));
    expect(screen.getByText(/별점\(1~5\)을 매겨/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole('radio', { name: '4점' }));
    await user.click(screen.getByRole('button', { name: '등록하기' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ status: 'done', rating: 4 }));
  });

  it('제출 중에는 버튼이 "저장 중…" 으로 비활성화되고, 실패하면 상단에 에러가 보인다', () => {
    renderForm({ submitting: true, submitError: { code: '42501', message: 'denied' } });
    expect(screen.getByRole('button', { name: /저장 중/ })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('저장에 실패했습니다.');
    expect(screen.getByRole('alert')).toHaveTextContent('권한이 없습니다');
  });
});
