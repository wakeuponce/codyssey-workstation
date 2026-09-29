import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AsyncView from './AsyncView';

describe('AsyncView', () => {
  it('loading → 로딩 UI', () => {
    render(<AsyncView status="loading">내용</AsyncView>);
    expect(screen.getByRole('status')).toHaveTextContent('불러오는 중');
    expect(screen.queryByText('내용')).not.toBeInTheDocument();
  });

  it('error → 에러 문구 + 다시 시도', async () => {
    const onRetry = vi.fn();
    render(<AsyncView status="error" error={new Error('Failed to fetch')} onRetry={onRetry}>내용</AsyncView>);
    expect(screen.getByText('요청에 실패했습니다. 다시 시도하세요.')).toBeInTheDocument();
    expect(screen.getByText(/네트워크 연결을 확인/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('success + isEmpty → 빈 상태', () => {
    render(<AsyncView status="success" isEmpty>내용</AsyncView>);
    expect(screen.getByText('표시할 데이터가 없습니다.')).toBeInTheDocument();
  });

  it('success → children (함수형 children 도 지원)', () => {
    render(<AsyncView status="success">{() => '내용'}</AsyncView>);
    expect(screen.getByText('내용')).toBeInTheDocument();
  });
});
