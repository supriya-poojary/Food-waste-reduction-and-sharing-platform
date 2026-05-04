import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../data/storage';
import { useAsyncAction, useFormValidation, validators } from '../hooks/useHelpers';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const PAYMENT_RULES = {
  cardHolder: [validators.required('Cardholder name is required'), validators.minLength(3)],
  cardNumber: [validators.required('Card number is required'), validators.cardNumber()],
  expiry: [validators.required('Expiry date is required'), validators.expiry()],
  cvv: [validators.required('CVV is required'), validators.cvv()],
};

function detectCardType(number) {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6(?:011|5)/.test(n)) return 'discover';
  return null;
}

function formatCardNumber(value) {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 2) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
  return cleaned;
}

const CARD_LOGOS = {
  visa: { label: 'VISA', style: 'font-black text-blue-300 text-lg tracking-widest italic' },
  mastercard: { label: '●●', style: 'text-2xl' },
  amex: { label: 'AMEX', style: 'font-bold text-green-300 text-sm tracking-widest' },
  discover: { label: 'DISCOVER', style: 'font-bold text-orange-300 text-xs tracking-widest' },
};

const AMOUNTS = [5, 10, 25, 50, 100];

export default function PaymentPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [cardType, setCardType] = useState(null);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [cardFlipped, setCardFlipped] = useState(false);
  const { loading, execute } = useAsyncAction();

  const [form, setForm] = useState({
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const { errors, touched, validate, touch, touchAll } = useFormValidation(PAYMENT_RULES);

  const finalAmount = customAmount ? parseFloat(customAmount) : amount;

  const update = (field, rawValue) => {
    let value = rawValue;
    if (field === 'cardNumber') {
      value = formatCardNumber(rawValue);
      setCardType(detectCardType(rawValue));
    }
    if (field === 'expiry') value = formatExpiry(rawValue);
    if (field === 'cvv') value = rawValue.replace(/\D/g, '').slice(0, 4);
    setForm(prev => ({ ...prev, [field]: value }));
    if (touched[field]) validate({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    touchAll(form);
    if (!validate(form)) return;
    if (!finalAmount || finalAmount < 1) {
      toast.error('Please enter a valid amount');
      return;
    }

    await execute(
      () => api.processPayment({ ...form, amount: finalAmount }),
      {
        onSuccess: (result) => {
          setTransactionId(result.transactionId);
          setSuccess(true);
          toast.success('💳 Payment successful!');
        },
        onError: (err) => toast.error(err),
      }
    );
  };

  const maskedNumber = form.cardNumber
    ? form.cardNumber.split(' ').map((g, i) => i < 3 ? '••••' : g).join(' ')
    : '•••• •••• •••• ••••';

  if (success) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div
          className="glass-card p-10 text-center max-w-md w-full animate-scale-in"
          style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(16,185,129,0.08))', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-glow-green">
              <CheckCircle size={44} className="text-white" />
            </div>
          </div>
          <h2 className="font-display font-black text-3xl text-white mb-2">Payment Successful!</h2>
          <p className="text-green-400 font-bold text-2xl mb-1">₹{finalAmount.toFixed(2)}</p>
          <p className="text-white/50 text-sm mb-2">Your donation helps fight food waste</p>
          <div className="p-3 bg-white/5 rounded-xl mb-6">
            <p className="text-white/40 text-xs">Transaction ID</p>
            <p className="text-white font-mono text-sm">{transactionId}</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-sm">
              <span className="text-white/50">Amount</span>
              <span className="text-white font-bold">₹{finalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-sm">
              <span className="text-white/50">Card</span>
              <span className="text-white">{maskedNumber}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-sm">
              <span className="text-white/50">Status</span>
              <span className="text-green-400 font-semibold flex items-center gap-1"><CheckCircle size={14} /> Completed</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-6">
            <Button variant="primary" onClick={() => navigate('/')} fullWidth>Back to Home</Button>
            <Button variant="secondary" onClick={() => { setSuccess(false); setForm({ cardHolder:'',cardNumber:'',expiry:'',cvv:'' }); }} fullWidth>
              Make Another Donation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <h1 className="font-display font-black text-4xl text-white">Support FoodShare</h1>
          <p className="text-white/50 mt-1">Your donation helps us fight food waste and feed communities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — Card preview + amount */}
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
            {/* Donation amount */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">Choose Amount</h3>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {AMOUNTS.map(a => (
                  <button
                    key={a}
                    id={`payment-amount-${a}`}
                    onClick={() => { setAmount(a); setCustomAmount(''); }}
                    className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      amount === a && !customAmount
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-glow-green scale-105'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    ₹{a}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 font-semibold">₹</span>
                <input
                  id="payment-custom-amount"
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); setAmount(0); }}
                  className="input-glass pl-8"
                  min="1"
                />
              </div>
              <p className="text-white/40 text-xs mt-2 text-center">
                ₹{finalAmount || 0} will feed approximately {Math.round((finalAmount || 0) / 3)} people
              </p>
            </div>

            {/* 3D Card Preview */}
            <div className="relative h-52 perspective-1000" style={{ perspective: '1000px' }}>
              <div
                className={`w-full h-full transition-transform duration-700 relative`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front */}
                <div
                  className="payment-card absolute inset-0 rounded-2xl p-6 flex flex-col justify-between"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex justify-between items-start">
                    <div className="card-chip" />
                    {cardType && CARD_LOGOS[cardType] && (
                      <span className={CARD_LOGOS[cardType].style}>
                        {CARD_LOGOS[cardType].label}
                      </span>
                    )}
                    {!cardType && (
                      <CreditCard size={28} className="text-white/30" />
                    )}
                  </div>
                  <div>
                    <p className="font-mono text-white text-xl tracking-widest mb-4">
                      {maskedNumber}
                    </p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Card Holder</p>
                        <p className="text-white font-semibold uppercase tracking-wider text-sm">
                          {form.cardHolder || 'YOUR NAME'}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Expires</p>
                        <p className="text-white font-semibold text-sm">{form.expiry || 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back */}
                <div
                  className="payment-card absolute inset-0 rounded-2xl"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="h-12 bg-black/50 mt-8 mb-6" />
                  <div className="px-6">
                    <div className="bg-white/20 h-10 rounded-lg flex items-center justify-end pr-4">
                      <p className="font-mono text-white tracking-widest text-sm">{form.cvv || '•••'}</p>
                    </div>
                    <p className="text-white/30 text-xs mt-3 text-center">
                      This card is issued by FoodShare Finance
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 text-white/40 text-xs">
              <span className="flex items-center gap-1"><Lock size={12} /> 256-bit SSL</span>
              <span className="flex items-center gap-1">🔒 PCI Compliant</span>
              <span className="flex items-center gap-1">✅ Secure Payment</span>
            </div>
          </div>

          {/* Right — Payment form */}
          <div className="animate-fade-up" style={{ animationDelay: '150ms' }}>
            <form onSubmit={handleSubmit} noValidate className="glass-card p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={20} className="text-green-400" />
                <h3 className="font-display font-bold text-xl text-white">Card Details</h3>
              </div>

              <Input
                id="payment-cardholder"
                label="Cardholder Name"
                placeholder="As on card"
                value={form.cardHolder}
                onChange={e => update('cardHolder', e.target.value)}
                onBlur={() => { touch('cardHolder'); validate(form); }}
                error={touched.cardHolder && errors.cardHolder}
                required
              />

              <div>
                <Input
                  id="payment-card-number"
                  label="Card Number"
                  placeholder="0000 0000 0000 0000"
                  value={form.cardNumber}
                  onChange={e => update('cardNumber', e.target.value)}
                  onBlur={() => { touch('cardNumber'); validate(form); }}
                  error={touched.cardNumber && errors.cardNumber}
                  icon={<CreditCard size={16} />}
                  required
                  inputMode="numeric"
                />
                {cardType && (
                  <p className="text-xs text-green-400 mt-1 ml-1 flex items-center gap-1 animate-fade-in">
                    ✅ {cardType.charAt(0).toUpperCase() + cardType.slice(1)} detected
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="payment-expiry"
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={form.expiry}
                  onChange={e => update('expiry', e.target.value)}
                  onBlur={() => { touch('expiry'); validate(form); }}
                  error={touched.expiry && errors.expiry}
                  required
                  inputMode="numeric"
                />
                <Input
                  id="payment-cvv"
                  label="CVV"
                  placeholder="•••"
                  value={form.cvv}
                  onChange={e => update('cvv', e.target.value)}
                  onBlur={() => { touch('cvv'); validate(form); }}
                  error={touched.cvv && errors.cvv}
                  onFocus={() => setCardFlipped(true)}
                  onBlurCapture={() => setCardFlipped(false)}
                  type="password"
                  required
                  inputMode="numeric"
                />
              </div>

              {/* Order summary */}
              <div className="p-4 bg-white/5 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Donation Amount</span>
                  <span className="text-white">₹{finalAmount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Processing Fee</span>
                  <span className="text-green-400">FREE</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-white text-lg">₹{finalAmount || 0}</span>
                </div>
              </div>

              {/* Test hint */}
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-xs">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>Test mode: Use any card number starting with <strong>4</strong> for success. Numbers starting with <strong>0</strong> will decline.</span>
              </div>

              <Button
                id="payment-submit-btn"
                type="submit"
                variant="primary"
                loading={loading}
                fullWidth
                size="lg"
                icon={loading ? null : <Lock size={18} />}
              >
                {loading ? 'Processing Payment...' : `Pay ₹${finalAmount || 0} Securely`}
              </Button>

              <p className="text-center text-white/30 text-xs">
                🔒 Your payment info is encrypted and secure. We never store card details.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
