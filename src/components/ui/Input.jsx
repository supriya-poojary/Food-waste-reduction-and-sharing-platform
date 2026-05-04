import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    id,
    type = 'text',
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    icon,
    suffix,
    className = '',
    helperText,
    required,
    ...rest
  },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-white/70">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`
            input-glass
            ${icon ? 'pl-10' : ''}
            ${suffix ? 'pr-12' : ''}
            ${error ? 'error' : ''}
          `}
          {...rest}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1 animate-fade-in">
          <span>⚠</span> {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-white/40 text-xs">{helperText}</p>
      )}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, id, placeholder, value, onChange, onBlur, error, className = '', rows = 4, required },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-white/70">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        rows={rows}
        className={`input-glass resize-none ${error ? 'error' : ''}`}
      />
      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1 animate-fade-in">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
});

export const Select = forwardRef(function Select(
  { label, id, value, onChange, onBlur, error, options = [], className = '', required, placeholder },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-white/70">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`input-glass ${error ? 'error' : ''} cursor-pointer`}
        style={{ WebkitAppearance: 'none' }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option
            key={opt.value}
            value={opt.value}
            style={{ background: '#0f172a', color: 'white' }}
          >
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1 animate-fade-in">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
});
