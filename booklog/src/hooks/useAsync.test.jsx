import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useAsync } from './useAsync';

it('loading → success, 실패 후 reload 하면 다시 요청한다', async () => {
  const fetcher = vi
    .fn()
    .mockRejectedValueOnce(new Error('boom'))
    .mockResolvedValueOnce(['책']);

  const { result } = renderHook(() => useAsync(fetcher));
  expect(result.current.status).toBe('loading');

  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(result.current.error.message).toBe('boom');

  act(() => result.current.reload());
  expect(result.current.status).toBe('loading');
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current.data).toEqual(['책']);
  expect(fetcher).toHaveBeenCalledTimes(2);
});

it('언마운트되면 진행 중인 요청을 abort 한다', () => {
  let signal;
  const fetcher = vi.fn((s) => {
    signal = s;
    return new Promise(() => {});
  });
  const { unmount } = renderHook(() => useAsync(fetcher));
  expect(signal.aborted).toBe(false);
  unmount();
  expect(signal.aborted).toBe(true);
});
