import { STATUS, STATUS_KEYS } from '../lib/books';
import { toUserMessage } from '../lib/errors';
import { LIMITS, validateBook } from '../lib/validation';
import { useForm } from '../hooks/useForm';
import Alert from './Alert';
import BookCard from './BookCard';
import Button from './Button';
import FormField from './FormField';
import Input from './Input';
import RatingStars from './RatingStars';
import Select from './Select';

const STATUS_OPTIONS = STATUS_KEYS.map((key) => ({ value: key, label: STATUS[key].label }));

/**
 * 등록/수정 공용 폼. "무엇을 저장할지" 는 모르고, 검증을 통과한 값을 onSubmit 으로 올려보내기만 한다.
 *  - 등록 페이지: onSubmit = createBook,  수정 페이지: onSubmit = updateBook
 *  - submitting / submitError 는 페이지(useMutation)가 소유한 상태를 props 로 받는다.
 */
export default function BookForm({ initialValues, onSubmit, submitting, submitError, submitLabel, onCancel }) {
  const { values, visibleError, handleChange, handleBlur, handleSubmit, setValue } = useForm(
    initialValues,
    validateBook,
  );

  const reviewLabel = STATUS[values.status]?.reviewLabel ?? '내용';

  return (
    <div className="form-layout">
      <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {submitError && (
          <Alert title="저장에 실패했습니다.">
            {toUserMessage(submitError)} 입력한 내용은 그대로 남아 있으니 다시 시도해 주세요.
          </Alert>
        )}

        {/* disabled fieldset: 제출 중에는 모든 입력이 잠긴다 */}
        <fieldset className="form__fields" disabled={submitting}>
          <FormField
            label="제목"
            id="title"
            required
            error={visibleError('title')}
            counter={{ current: values.title.trim().length, max: LIMITS.title }}
          >
            <Input name="title" value={values.title} onChange={handleChange} onBlur={handleBlur} placeholder="예) 클린 코드" autoComplete="off" />
          </FormField>

          <FormField label="저자" id="author" required error={visibleError('author')}>
            <Input name="author" value={values.author} onChange={handleChange} onBlur={handleBlur} placeholder="예) 로버트 C. 마틴" autoComplete="off" />
          </FormField>

          <FormField label="독서 상태" id="status" required error={visibleError('status')}>
            <Select name="status" value={values.status} onChange={handleChange} onBlur={handleBlur} options={STATUS_OPTIONS} />
          </FormField>

          {/* 상태 변경 → 렌더링 변화: '다 읽은 책' 일 때만 별점 입력이 나타난다 */}
          {values.status === 'done' && (
            <div className={`field ${visibleError('rating') ? 'field--invalid' : ''}`}>
              <span className="field__label">
                별점<span className="field__required" aria-label="필수">*</span>
              </span>
              <RatingStars value={Number(values.rating)} onChange={(n) => setValue('rating', n)} disabled={submitting} />
              {visibleError('rating') && (
                <p className="field__error" role="alert">
                  {visibleError('rating')}
                </p>
              )}
            </div>
          )}

          <FormField
            label={reviewLabel}
            id="review"
            required
            error={visibleError('review')}
            hint={`${LIMITS.reviewMin}자 이상 적어 주세요.`}
            counter={{ current: values.review.trim().length, max: LIMITS.review }}
          >
            <Input multiline rows={6} name="review" value={values.review} onChange={handleChange} onBlur={handleBlur} placeholder="자유롭게 기록해 보세요." />
          </FormField>
        </fieldset>

        <div className="form__actions">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} disabled={submitting}>
              취소
            </Button>
          )}
          <Button type="submit" loading={submitting}>
            {submitting ? '저장 중…' : submitLabel}
          </Button>
        </div>
      </form>

      {/* 입력값 변경 → 미리보기 변경: 같은 BookCard 컴포넌트를 재사용 */}
      <aside className="form-preview" aria-label="카드 미리보기">
        <p className="form-preview__label">미리보기</p>
        <BookCard book={{ ...values, rating: Number(values.rating) }} />
      </aside>
    </div>
  );
}
