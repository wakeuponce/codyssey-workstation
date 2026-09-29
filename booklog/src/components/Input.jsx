/** 한 줄 입력. multiline 이면 textarea. 나머지 props(value, onChange, ...)는 그대로 전달 */
export default function Input({ multiline = false, className = '', ...rest }) {
  const Tag = multiline ? 'textarea' : 'input';
  return <Tag className={`input ${multiline ? 'input--multiline' : ''} ${className}`.trim()} {...rest} />;
}
