import { useRipple } from '../../hooks/useHelpers';

export function Spinner({ size = 'sm', className = '' }) {
  const sizes = {
    xs: 'w-3 h-3 border',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
    xl: 'w-12 h-12 border-3',
  };
  return (
    <div
      className={`${sizes[size]} rounded-full border-white/30 border-t-white animate-spin ${className}`}
    />
  );
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon = null,
  fullWidth = false,
  id,
}) {
  const createRipple = useRipple();
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all',
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      id={id}
      type={type}
      onClick={(e) => {
        if (!isDisabled) {
          createRipple(e);
          onClick?.(e);
        }
      }}
      disabled={isDisabled}
      className={`
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-200 relative overflow-hidden select-none
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading ? (
        <>
          <Spinner size="sm" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

export function IconButton({ children, onClick, className = '', title = '', id }) {
  const createRipple = useRipple();
  return (
    <button
      id={id}
      title={title}
      onClick={(e) => {
        createRipple(e);
        onClick?.(e);
      }}
      className={`
        relative overflow-hidden p-2 rounded-xl bg-white/5 border border-white/10
        hover:bg-white/15 hover:border-white/20 text-white/70 hover:text-white
        transition-all duration-200 active:scale-90
        ${className}
      `}
    >
      {children}
    </button>
  );
}
