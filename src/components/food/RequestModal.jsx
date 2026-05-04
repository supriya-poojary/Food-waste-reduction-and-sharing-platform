import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Send, MessageSquare } from 'lucide-react';
import { api } from '../../data/storage';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import UrgencyBadge from '../ui/UrgencyBadge';
import toast from 'react-hot-toast';

export default function RequestModal({ food, isOpen, onClose, onRequestSent }) {
  const { user } = useAuth();
  const [step, setStep] = useState('compose'); // 'compose' | 'success'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { 
    if (isOpen) {
      setStep('compose');
      setMessage(`Hi ${food?.donorName || 'there'}, I would like to request this food. I can pick it up today.`);
    }
  }, [isOpen, food]);

  const handleRequest = async () => {
    if (!user) { toast.error('Please login first'); return; }
    setLoading(true);
    try {
      await api.submitRequest({
        foodId: food.id || food._id,
        message: message
      });
      setStep('success');
      toast.success('Request sent to the donor!');
      if (onRequestSent) onRequestSent();
    } catch (err) {
      toast.error(err.message || 'Failed to send request');
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
              {step === 'success' ? '✅ Request Sent!' : '🙏 Request This Food'}
            </h2>
            <button onClick={onClose} className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <X size={18} />
            </button>
          </div>

          {step === 'compose' && (
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

              {/* Message to Donor */}
              <Textarea
                label="Message to Donor"
                placeholder="Let the donor know when you can pick it up..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />

              {/* Info */}
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs text-orange-400">
                  <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
                  <span className="text-white/60">The donor must approve your request before you can pick it up. They will provide pickup details upon approval.</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={onClose} fullWidth disabled={loading}>Cancel</Button>
                <Button
                  variant="primary" onClick={handleRequest} fullWidth loading={loading}
                  icon={<Send size={16} />}
                >
                  Send Request
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <motion.div
                  className="text-5xl mb-3"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
                >📨</motion.div>
                <p className="text-white/70 text-sm">Your request has been sent to the donor. We will notify you once they approve it!</p>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-400 flex items-center gap-2">
                <MessageSquare size={14} /> You can track this in <strong className="text-white">Profile {'>'} My Requests</strong>.
              </div>
              <Button variant="primary" onClick={onClose} fullWidth>Got it!</Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
