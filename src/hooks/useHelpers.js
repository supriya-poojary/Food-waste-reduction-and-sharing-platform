import { useState, useCallback } from 'react';

/**
 * Wraps an async operation with loading/error state management.
 */
export function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFn, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      if (options.onSuccess) options.onSuccess(result);
      return result;
    } catch (err) {
      const msg = err.message || 'Something went wrong';
      setError(msg);
      if (options.onError) options.onError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute, setError };
}

/**
 * Ripple effect handler for buttons.
 */
export function useRipple() {
  const createRipple = useCallback((event) => {
    const button = event.currentTarget;
    const existing = button.querySelector('.ripple-element');
    if (existing) existing.remove();

    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.style.position = 'absolute';
    circle.style.borderRadius = '50%';
    circle.style.background = 'rgba(255,255,255,0.25)';
    circle.style.transform = 'scale(0)';
    circle.style.animation = 'ripple 0.6s linear';
    circle.style.pointerEvents = 'none';
    circle.classList.add('ripple-element');

    button.style.overflow = 'hidden';
    button.style.position = 'relative';
    button.appendChild(circle);
    setTimeout(() => circle.remove(), 700);
  }, []);

  return createRipple;
}

/**
 * Form validation hook.
 */
export function useFormValidation(rules) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback((values) => {
    const newErrors = {};
    Object.entries(rules).forEach(([field, fieldRules]) => {
      const value = values[field];
      for (const rule of fieldRules) {
        const error = rule(value, values);
        if (error) {
          newErrors[field] = error;
          break;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [rules]);

  const touch = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const touchAll = useCallback((values) => {
    const allTouched = Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return { errors, touched, validate, touch, touchAll, clearErrors, setErrors };
}

// ─── Validation rules ────────────────────────────────────────────────────────

export const validators = {
  required: (msg = 'This field is required') => (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) return msg;
    return null;
  },
  email: () => (value) => {
    if (!value) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value)) return 'Enter a valid email address';
    return null;
  },
  minLength: (min, msg) => (value) => {
    if (!value) return null;
    if (value.length < min) return msg || `Minimum ${min} characters required`;
    return null;
  },
  maxLength: (max, msg) => (value) => {
    if (!value) return null;
    if (value.length > max) return msg || `Maximum ${max} characters allowed`;
    return null;
  },
  phone: () => (value) => {
    if (!value) return null;
    const re = /^[+]?[\d\s\-()]{10,15}$/;
    if (!re.test(value)) return 'Enter a valid phone number';
    return null;
  },
  match: (fieldName, label) => (value, values) => {
    if (!value) return null;
    if (value !== values[fieldName]) return `Passwords do not match`;
    return null;
  },
  cardNumber: () => (value) => {
    if (!value) return null;
    const cleaned = value.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cleaned)) return 'Enter a valid 16-digit card number';
    return null;
  },
  expiry: () => (value) => {
    if (!value) return null;
    const [mm, yy] = value.split('/');
    if (!mm || !yy) return 'Format: MM/YY';
    const month = parseInt(mm);
    const year = parseInt('20' + yy);
    if (month < 1 || month > 12) return 'Invalid month';
    const now = new Date();
    if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
      return 'Card has expired';
    }
    return null;
  },
  cvv: () => (value) => {
    if (!value) return null;
    if (!/^\d{3,4}$/.test(value)) return 'Enter valid CVV';
    return null;
  },
};
