import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, CheckCircle, AlertTriangle, Zap, Lock } from 'lucide-react';
import { api } from '../../data/storage';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import UrgencyBadge from '../ui/UrgencyBadge';
import toast from 'react-hot-toast';

function CountdownTimer({ expiresAt }) {
  const [remaining, setRemaining] = useState('');
  const [percent, setPercent] = useState(100);

  useEffect(() => {
    const WINDOW = 2 * 60 * 60 * 1000; // 2 hours in ms
    const tick = () => {
      const now = Date.now();
      const end = new Date(expiresAt).getTime();
      const diff = end - now;
      if (diff <= 0) { setRemaining('Expired'); setPercent(0); return; }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      setPercent(Math.max(0, (diff / WINDOW) * 100));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const color = percent > 50 ? 'from-green-500 to-emerald-400' : percent > 20 ? 'from-yellow-500 to-orange-400' : 'from-red-500 to-rose-400';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/60 flex items-center gap-1.5"><Clock size={13} /> Claim expires in</span>
        <span className="font-mono font-bold text-white">{remaining}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

export default function ClaimModal({ food, isOpen, onClose, onClaimed }) {
  const { user } = useAuth();
  const [step, setStep] = useState('confirm'); // 'confirm' | 'success'
  const [loading, setLoading] = useState(false);
  const [claim, setClaim] = useState(null);

  useEffect(() => { if (isOpen) setStep('confirm'); }, [isOpen]);

  const handleClaim = async () => {
    if (!user) { toast.error('Please login first'); return; }
    setLoading(true);
    try {
      const result = await api.claimFood(food.id || food._id);
      setClaim(result);
      setStep('success');
      toast.success('🎉 Food claimed! You have 2 hours to pick it up.');
      if (onClaimed) onClaimed();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !food) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[#0d1b2e] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <div className="flex items-start justify-between mb-5">
            <h2 className="font-display font-bold text-xl text-white">
              {step === 'success' ? '✅ Claim Confirmed!' : '⚡ Claim This Food'}
            </h2>
            <button onClick={onClose} className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <X size={18} />
            </button>
          </div>

          {step === 'confirm' && (
            <div className="space-y-4">
              {/* Food preview */}
              <div className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <img src={food.image} alt={food.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm leading-tight">{food.title}</p>
                  <p className="text-white/50 text-xs mt-1 truncate">📍 {food.location}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <UrgencyBadge level={food.urgency || 'LOW'} />
                    <span className="text-xs text-white/50">{food.expiryStatus}</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2">
                {[
                  { icon: Lock, text: 'Item is locked for you for 2 hours once claimed', color: 'text-blue-400' },
                  { icon: AlertTriangle, text: 'Auto-released if not picked up in time', color: 'text-orange-400' },
                  { icon: CheckCircle, text: 'Mark as complete after pickup to help track impact', color: 'text-green-400' },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className={`flex items-start gap-2 text-xs ${color}`}>
                    <Icon size={13} className="mt-0.5 flex-shrink-0" />
                    <span className="text-white/60">{text}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={onClose} fullWidth disabled={loading}>Cancel</Button>
                <Button
                  variant="primary" onClick={handleClaim} fullWidth loading={loading}
                  icon={<Zap size={16} />}
                >
                  Claim Now
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && claim && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <motion.div
                  className="text-5xl mb-3"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
                >🎉</motion.div>
                <p className="text-white/70 text-sm">You have successfully claimed this food item. Head to the pickup location before the timer runs out!</p>
              </div>
              <CountdownTimer expiresAt={claim.expiresAt} />
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400 flex items-center gap-2">
                <CheckCircle size={14} /> Head to <strong className="text-white">{food.location}</strong> for pickup
              </div>
              <Button variant="primary" onClick={onClose} fullWidth>Got it!</Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
