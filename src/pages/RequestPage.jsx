import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HandHeart, CheckCircle, Search } from 'lucide-react';
import { api } from '../data/storage';
import { useAuth } from '../context/AuthContext';
import { useAsyncAction, useFormValidation, validators } from '../hooks/useHelpers';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const FOOD_TYPE_OPTIONS = [
  { value: 'any', label: 'Any Type' },
  { value: 'vegetables', label: '🥦 Vegetables' },
  { value: 'fruits', label: '🍎 Fruits' },
  { value: 'cooked', label: '🍲 Cooked Food' },
  { value: 'bakery', label: '🥖 Bakery' },
  { value: 'dairy', label: '🥛 Dairy' },
  { value: 'snacks', label: '🍿 Snacks' },
  { value: 'grocery', label: '🛒 Grocery/Pantry' },
];

const URGENCY_OPTIONS = [
  { value: 'low', label: 'Low — within a week' },
  { value: 'medium', label: 'Medium — within 2-3 days' },
  { value: 'high', label: 'High — today or tomorrow' },
  { value: 'urgent', label: '🚨 Urgent — need immediately' },
];

const RULES = {
  name: [validators.required('Your name is required')],
  location: [validators.required('Location is required'), validators.minLength(5)],
  peopleCount: [validators.required('Please specify how many people')],
  description: [validators.required('Please describe what you need'), validators.minLength(20)],
  phone: [validators.required('Phone is required'), validators.phone()],
};

export default function RequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [availableCount, setAvailableCount] = useState(null);
  const { loading, execute } = useAsyncAction();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    foodType: 'any',
    peopleCount: '',
    urgency: 'medium',
    description: '',
    dietaryRestrictions: '',
    preferredPickupTime: '',
  });

  const { errors, touched, validate, touch, touchAll } = useFormValidation(RULES);

  useEffect(() => {
    api.getFoodItems({ status: 'available' }).then(items => setAvailableCount(items.length));
  }, []);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (touched[field]) validate({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    touchAll(form);
    if (!validate(form)) return;

    if (!user) {
      toast.error('Please log in to submit a request');
      navigate('/auth');
      return;
    }

    await execute(
      () => api.submitRequest({
        ...form,
        requesterId: user.id,
        requesterName: user.name,
        foodId: null,
        type: 'general',
      }),
      {
        onSuccess: () => {
          toast.success('🙏 Request submitted! We\'ll match you with a donor soon.');
          setSubmitted(true);
        },
        onError: (err) => toast.error(err),
      }
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="glass-card p-10 text-center max-w-md w-full animate-scale-in">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="font-display font-bold text-2xl text-white mb-3">Login Required</h2>
          <p className="text-white/60 mb-6">You need an account to submit a food request.</p>
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={() => navigate('/auth')} fullWidth>Log In</Button>
            <Button variant="secondary" onClick={() => navigate('/auth?mode=register')} fullWidth>Create Account</Button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div
          className="glass-card p-10 text-center max-w-md w-full animate-scale-in"
          style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(16,185,129,0.08))', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-soft">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="font-display font-black text-3xl text-white mb-3">Request Submitted! 🙏</h2>
          <p className="text-white/60 mb-2">Your request has been received.</p>
          <p className="text-white/50 text-sm mb-8">
            We'll match you with available donors in your area. You'll be contacted within a few hours.
          </p>
          <div className="p-4 bg-white/5 rounded-xl mb-6 text-left">
            {[
              { label: 'Name', value: form.name },
              { label: 'Location', value: form.location },
              { label: 'Food Type', value: form.foodType === 'any' ? 'Any type' : form.foodType },
              { label: 'People', value: form.peopleCount },
              { label: 'Urgency', value: form.urgency },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-1 text-sm">
                <span className="text-white/40">{r.label}</span>
                <span className="text-white capitalize">{r.value}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={() => navigate('/browse')} fullWidth>Browse Available Food</Button>
            <Button variant="secondary" onClick={() => { setSubmitted(false); }} fullWidth>Submit Another Request</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
            <HandHeart size={14} />
            {availableCount !== null ? `${availableCount} items available right now` : 'Checking availability...'}
          </div>
          <h1 className="font-display font-black text-4xl text-white mb-2">Request Food</h1>
          <p className="text-white/50">Tell us what you need and we'll connect you with donors nearby</p>
        </div>

        {/* Quick browse prompt */}
        <Link
          to="/browse"
          id="request-browse-link"
          className="glass-card p-4 flex items-center gap-3 mb-6 hover:border-green-500/30 transition-all animate-fade-up group"
          style={{ animationDelay: '100ms' }}
        >
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-all">
            <Search size={18} className="text-green-400" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">Browse existing listings first</p>
            <p className="text-white/40 text-xs">You might find exactly what you need right now →</p>
          </div>
        </Link>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="animate-fade-up" style={{ animationDelay: '150ms' }}>
          <div className="glass-card p-6 sm:p-8 space-y-6">
            <h2 className="font-display font-bold text-xl text-white">Your Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="request-name"
                label="Full Name"
                placeholder="Your full name"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                onBlur={() => { touch('name'); validate(form); }}
                error={touched.name && errors.name}
                required
              />
              <Input
                id="request-phone"
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                onBlur={() => { touch('phone'); validate(form); }}
                error={touched.phone && errors.phone}
                required
              />
            </div>

            <Input
              id="request-location"
              label="Your Location"
              placeholder="e.g., Koramangala, Bangalore"
              value={form.location}
              onChange={e => update('location', e.target.value)}
              onBlur={() => { touch('location'); validate(form); }}
              error={touched.location && errors.location}
              helperText="We'll find donors near you"
              required
            />

            <hr className="border-white/10" />
            <h2 className="font-display font-bold text-xl text-white">Food Requirements</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="request-food-type"
                label="Type of Food Needed"
                value={form.foodType}
                onChange={e => update('foodType', e.target.value)}
                options={FOOD_TYPE_OPTIONS}
              />
              <Input
                id="request-people-count"
                label="Number of People"
                type="number"
                min="1"
                placeholder="e.g., 4"
                value={form.peopleCount}
                onChange={e => update('peopleCount', e.target.value)}
                onBlur={() => { touch('peopleCount'); validate(form); }}
                error={touched.peopleCount && errors.peopleCount}
                required
              />
            </div>

            <Select
              id="request-urgency"
              label="Urgency Level"
              value={form.urgency}
              onChange={e => update('urgency', e.target.value)}
              options={URGENCY_OPTIONS}
            />

            {form.urgency === 'urgent' && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-fade-in">
                🚨 For urgent needs, please also check our browse page for immediately available food.
              </div>
            )}

            <Textarea
              id="request-description"
              label="Describe Your Needs"
              placeholder="Tell us more about your situation and what kind of food would help. Be specific about any allergies, dietary restrictions, or preferences..."
              value={form.description}
              onChange={e => update('description', e.target.value)}
              onBlur={() => { touch('description'); validate(form); }}
              error={touched.description && errors.description}
              rows={4}
              required
            />

            <Input
              id="request-dietary"
              label="Dietary Restrictions (optional)"
              placeholder="e.g., No pork, nut allergy, diabetic-friendly needed"
              value={form.dietaryRestrictions}
              onChange={e => update('dietaryRestrictions', e.target.value)}
            />

            <Input
              id="request-pickup-time"
              label="Preferred Pickup Time (optional)"
              type="datetime-local"
              value={form.preferredPickupTime}
              onChange={e => update('preferredPickupTime', e.target.value)}
            />

            <div className="p-4 bg-white/5 rounded-xl text-xs text-white/40 leading-relaxed">
              🔒 Your personal information is only shared with donors who agree to help you. We never sell or share your data with third parties.
            </div>

            <Button
              id="request-submit-btn"
              type="submit"
              variant="primary"
              loading={loading}
              fullWidth
              size="lg"
              icon={<HandHeart size={20} />}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
