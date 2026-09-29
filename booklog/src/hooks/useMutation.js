import { useCallback, useState } from 'react';

/**
 * 등록·수정·삭제·로그인처럼 "사용자 이벤트로 시작되는" 비동기 작업용 훅.
 * 조회(useAsync)와 달리 useEffect 가 아니라 이벤트 핸들러에서 mutate() 를 직접 호출한다.
 *
 * mutate 는 성공하면 결과를, 실패하면 undefined 를 반환한다(에러는 state 로 화면에 표시).
 * @returns {{ mutate, status: 'idle'|'pending'|'success'|'error', error, isPending, reset }}
 */
export function useMutation(mutationFn) {
  const [state, setState] = useState({ status: 'idle', error: null });

  const mutate = useCallback(
    async (...args) => {
      setState({ status: 'pending', error: null });
      try {
        const result = await mutationFn(...args);
        setState({ status: 'success', error: null });
        return result;
      } catch (error) {
        setState({ status: 'error', error });
        return undefined;
      }
    },
    [mutationFn],
  );

  const reset = useCallback(() => setState({ status: 'idle', error: null }), []);

  return { ...state, isPending: state.status === 'pending', mutate, reset };
}
