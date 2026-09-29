import { useCallback, useMemo, useState } from 'react';
import { hasErrors } from '../lib/validation';

/**
 * controlled input 폼 공통 훅.
 * - values: 모든 입력값의 단일 출처(single source of truth). input 의 value 는 항상 여기서 온다.
 * - touched: 사용자가 한 번이라도 건드린(blur) 필드. 처음부터 빨간 에러가 뜨지 않게 한다.
 * - errors: values 로부터 매 렌더링마다 "계산" 한다(따로 state 로 들고 있지 않음 → 불일치 불가).
 */
export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validate(values), [validate, values]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  /** 제출 이벤트: 기본 동작을 막고, 에러가 없을 때만 onValid(values) 를 호출 */
  const handleSubmit = useCallback(
    (onValid) => (event) => {
      event.preventDefault();
      setSubmitted(true);
      if (hasErrors(errors)) {
        // 첫 번째 에러 필드로 포커스 이동 (접근성)
        const firstName = Object.keys(errors)[0];
        event.currentTarget.querySelector(`[name="${firstName}"]`)?.focus();
        return;
      }
      onValid(values);
    },
    [errors, values],
  );

  /** 화면에 보여줄 에러: 건드렸거나 제출을 시도한 필드만 */
  const visibleError = (name) => ((touched[name] || submitted) && errors[name]) || '';

  return {
    values,
    errors,
    isValid: !hasErrors(errors),
    visibleError,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
  };
}
