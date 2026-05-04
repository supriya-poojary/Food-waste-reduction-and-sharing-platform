import { motion, AnimatePresence } from 'framer-motion';

const URGENCY_CONFIG = {
  URGENT: {
    label: 'URGENT',
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    text: 'text-red-400',
    glow: 'shadow-[0_0_12px_rgba(239,68,68,0.4)]',
    dot: 'bg-red-400',
    pulse: true,
    emoji: '🔴',
  },
  HIGH: {
    label: 'HIGH',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/50',
    text: 'text-orange-400',
    glow: 'shadow-[0_0_10px_rgba(249,115,22,0.35)]',
    dot: 'bg-orange-400',
    pulse: true,
    emoji: '🟠',
  },
  MEDIUM: {
    label: 'MEDIUM',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/40',
    text: 'text-yellow-400',
    glow: '',
    dot: 'bg-yellow-400',
    pulse: false,
    emoji: '🟡',
  },
  LOW: {
    label: 'FRESH',
    bg: 'bg-green-500/20',
    border: 'border-green-500/40',
    text: 'text-green-400',
    glow: '',
    dot: 'bg-green-400',
    pulse: false,
    emoji: '🟢',
  },
  EXPIRED: {
    label: 'EXPIRED',
    bg: 'bg-slate-500/20',
    border: 'border-slate-500/40',
    text: 'text-slate-400',
    glow: '',
    dot: 'bg-slate-400',
    pulse: false,
    emoji: '⚫',
  },
};

export default function UrgencyBadge({ level = 'LOW', size = 'sm', showLabel = true, className = '' }) {
  const cfg = URGENCY_CONFIG[level] || URGENCY_CONFIG.LOW;
  const isSmall = size === 'sm';

  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text} ${cfg.glow} ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {/* Pulsing dot */}
      <span className="relative flex items-center justify-center">
        {cfg.pulse && (
          <motion.span
            className={`absolute inline-flex rounded-full ${cfg.dot} opacity-60`}
            style={{ width: 8, height: 8 }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <span className={`inline-flex rounded-full ${cfg.dot}`} style={{ width: 6, height: 6 }} />
      </span>

      {showLabel && (
        <span className={`font-bold tracking-wider ${isSmall ? 'text-[10px]' : 'text-xs'}`}>
          {cfg.label}
        </span>
      )}
    </motion.div>
  );
}

// Urgency card border highlight
export function UrgencyRing({ level, children }) {
  if (level === 'URGENT') {
    return (
      <motion.div
        className="rounded-2xl"
        animate={{ boxShadow: ['0 0 0 1px rgba(239,68,68,0.3)', '0 0 20px rgba(239,68,68,0.5)', '0 0 0 1px rgba(239,68,68,0.3)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {children}
      </motion.div>
    );
  }
  if (level === 'HIGH') {
    return (
      <motion.div
        className="rounded-2xl"
        animate={{ boxShadow: ['0 0 0 1px rgba(249,115,22,0.2)', '0 0 15px rgba(249,115,22,0.35)', '0 0 0 1px rgba(249,115,22,0.2)'] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        {children}
      </motion.div>
    );
  }
  return <>{children}</>;
}
