import { useCallback, useEffect, useState } from 'react';

/**
 * 비동기 "조회" 공통 훅.  fetcher(signal) => Promise<data>
 *
 * - fetcher 가 바뀌면(= 호출한 쪽의 useCallback 의존성이 바뀌면) useEffect 가 다시 실행되어 새로 요청한다.
 * - reload() 는 같은 fetcher 로 한 번 더 요청한다(에러 화면의 "다시 시도").
 * - 컴포넌트가 사라지거나 다음 요청이 시작되면 cleanup 에서 이전 요청을 abort 한다.
 *   → 늦게 도착한 옛 응답이 새 화면을 덮어쓰는 경쟁 상태(race condition)를 막는다.
 *
 * 로딩 여부는 따로 저장하지 않고 "마지막 응답이 지금 요청에 대한 것인가" 로 계산한다.
 * (effect 안에서 setState('loading') 을 동기 호출하면 렌더링이 한 번 더 일어나기 때문)
 *
 * @returns {{ status: 'loading'|'success'|'error', data: any, error: Error|null, reload: () => void }}
 */
export function useAsync(fetcher) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ fetcher: null, attempt: -1, data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();

    fetcher(controller.signal)
      .then((data) => setResult({ fetcher, attempt, data, error: null }))
      .catch((error) => {
        if (controller.signal.aborted) return; // 취소된 요청의 실패는 무시
        setResult({ fetcher, attempt, data: null, error });
      });

    return () => controller.abort();
  }, [fetcher, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const isCurrent = result.fetcher === fetcher && result.attempt === attempt;
  if (!isCurrent) return { status: 'loading', data: null, error: null, reload };
  if (result.error) return { status: 'error', data: null, error: result.error, reload };
  return { status: 'success', data: result.data, error: null, reload };
}
