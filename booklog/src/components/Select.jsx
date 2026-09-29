/** options: [{ value, label }] 배열을 받아 <option> 목록을 그린다. */
export default function Select({ options, className = '', ...rest }) {
  return (
    <select className={`input input--select ${className}`.trim()} {...rest}>
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
