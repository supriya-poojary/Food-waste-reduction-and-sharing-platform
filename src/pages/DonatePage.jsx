import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, CheckCircle, Leaf, Camera, MapPin } from 'lucide-react';
import { api } from '../data/storage';
import { useAuth } from '../context/AuthContext';
import { useAsyncAction, useFormValidation, validators } from '../hooks/useHelpers';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const STEPS = ['Food Details', 'Location & Pickup', 'Review & Submit'];

const CATEGORY_OPTIONS = [
  { value: 'vegetables', label: '🥦 Vegetables' },
  { value: 'fruits', label: '🍎 Fruits' },
  { value: 'cooked', label: '🍲 Cooked Food' },
  { value: 'bakery', label: '🥖 Bakery' },
  { value: 'dairy', label: '🥛 Dairy' },
  { value: 'snacks', label: '🍿 Snacks' },
  { value: 'grocery', label: '🛒 Grocery/Pantry' },
];

const VALIDATION_RULES = {
  title: [validators.required('Title is required'), validators.minLength(5, 'At least 5 characters')],
  description: [validators.required('Description is required'), validators.minLength(20, 'At least 20 characters')],
  category: [validators.required('Please select a category')],
  quantity: [validators.required('Quantity is required')],
  expiryDate: [validators.required('Expiry date is required')],
  location: [validators.required('Location is required'), validators.minLength(5)],
};

export default function DonatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const { loading, execute } = useAsyncAction();
  const [detectingLoc, setDetectingLoc] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    quantity: '',
    servings: '4',
    expiryDate: '',
    location: '',
    pickupInstructions: '',
    isVeg: true,
    tags: '',
    image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&q=80',
    price: '0',
    lat: null,
    lng: null,
  });

  const { errors, touched, validate, touch, touchAll, setErrors } = useFormValidation(VALIDATION_RULES);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validate({ ...form, [field]: value });
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
        setForm(prev => ({ ...prev, image: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          if (data && data.display_name) {
            update('location', data.display_name);
            setForm(prev => ({ ...prev, lat: latitude, lng: longitude }));
            toast.success('Location detected!');
          }
        } catch (error) {
          toast.error('Failed to get address. Please type it manually.');
          setForm(prev => ({ ...prev, lat: latitude, lng: longitude }));
        }
        setDetectingLoc(false);
      },
      (error) => {
        toast.error('Unable to retrieve your location. Please type it manually.');
        setDetectingLoc(false);
      }
    );
  };

  const step1Valid = () => {
    const fields = ['title', 'description', 'category', 'quantity', 'expiryDate'];
    let ok = true;
    const newErrors = { ...errors };
    fields.forEach(f => {
      touch(f);
      for (const rule of VALIDATION_RULES[f]) {
        const err = rule(form[f], form);
        if (err) { newErrors[f] = err; ok = false; break; }
        else { delete newErrors[f]; }
      }
    });
    setErrors(newErrors);
    return ok;
  };

  const step2Valid = () => {
    const fields = ['location'];
    let ok = true;
    const newErrors = { ...errors };
    fields.forEach(f => {
      touch(f);
      for (const rule of VALIDATION_RULES[f]) {
        const err = rule(form[f], form);
        if (err) { newErrors[f] = err; ok = false; break; }
        else { delete newErrors[f]; }
      }
    });
    setErrors(newErrors);
    return ok;
  };

  const handleNext = () => {
    if (step === 0 && !step1Valid()) return;
    if (step === 1 && !step2Valid()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!user) { navigate('/auth'); return; }
    await execute(
      () => api.donateFood({
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        servings: parseInt(form.servings) || 4,
        price: parseFloat(form.price) || 0,
        donorId: user.id,
        donorName: user.name,
        donorAvatar: user.avatar,
      }),
      {
        onSuccess: (item) => {
          toast.success('🎉 Your food listing is live! Thank you for sharing.');
          setSubmitted(true);
        },
        onError: (err) => toast.error(err),
      }
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="glass-card p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="font-display font-bold text-2xl text-white mb-3">Login Required</h2>
          <p className="text-white/60 mb-6">You need to be logged in to donate food.</p>
          <Button variant="primary" onClick={() => navigate('/auth')} fullWidth>
            Log In to Continue
          </Button>
        </div>
      </div>
    );
  }

  if (user.role === 'requester') {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="glass-card p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🙏</div>
          <h2 className="font-display font-bold text-2xl text-white mb-3">Donor Access Only</h2>
          <p className="text-white/60 mb-6">Your account is set to "Requester". Only Donors can list food items.</p>
          <Button variant="primary" onClick={() => navigate('/browse')} fullWidth>
            Go to Browse Food
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="glass-card p-10 text-center max-w-md w-full animate-scale-in"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.08))', border: '1px solid rgba(34,197,94,0.3)' }}>
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-soft">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="font-display font-black text-3xl text-white mb-3">Food Listed! 🎉</h2>
          <p className="text-white/60 mb-8">Your listing is now live. People in your area will be notified. Thank you for making a difference!</p>
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={() => navigate('/browse')} fullWidth>View All Listings</Button>
            <Button variant="secondary" onClick={() => { setSubmitted(false); setStep(0); setForm({ title:'',description:'',category:'',quantity:'',servings:'4',expiryDate:'',location:'',pickupInstructions:'',isVeg:true,tags:'',image:'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&q=80',lat:null,lng:null }); setImagePreview(null); }} fullWidth>
              Donate More Food
            </Button>
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
          <h1 className="font-display font-black text-4xl text-white mb-2">Donate Food</h1>
          <p className="text-white/50">Share your surplus food with those who need it most</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10 animate-fade-up" style={{ animationDelay: '100ms' }}>
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`step-indicator ${i < step ? 'completed' : i === step ? 'active' : 'inactive'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs whitespace-nowrap ${i === step ? 'text-green-400' : 'text-white/30'}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-16 sm:w-24 h-px mx-2 mb-5 transition-all duration-500 ${i < step ? 'bg-green-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="glass-card p-6 sm:p-8 animate-fade-up" style={{ animationDelay: '150ms' }}>
          {/* ── Step 0: Food Details ── */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-display font-bold text-xl text-white mb-2">Tell us about the food</h2>

              {/* Image upload */}
              <div>
                <label className="text-sm font-medium text-white/70 block mb-1.5">Food Photo</label>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                    <button
                      onClick={() => { setImagePreview(null); setForm(prev => ({ ...prev, image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&q=80' })); }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-black/80 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleImageDrop}
                  >
                    <Camera size={32} className="text-white/30 mx-auto mb-3" />
                    <p className="text-white/60 font-medium text-sm">Drop image here or click to upload</p>
                    <p className="text-white/30 text-xs mt-1">JPG, PNG, WebP up to 5MB</p>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageDrop} />
                  </div>
                )}
              </div>

              <Input
                id="donate-title"
                label="Food Title"
                placeholder="e.g., Fresh Organic Vegetables Pack"
                value={form.title}
                onChange={e => update('title', e.target.value)}
                onBlur={() => { touch('title'); validate(form); }}
                error={touched.title && errors.title}
                required
              />

              <Textarea
                id="donate-description"
                label="Description"
                placeholder="Describe what you're sharing — ingredients, quantity, freshness, any allergens..."
                value={form.description}
                onChange={e => update('description', e.target.value)}
                onBlur={() => { touch('description'); validate(form); }}
                error={touched.description && errors.description}
                rows={4}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  id="donate-category"
                  label="Category"
                  value={form.category}
                  onChange={e => update('category', e.target.value)}
                  onBlur={() => { touch('category'); validate(form); }}
                  options={CATEGORY_OPTIONS}
                  placeholder="Select category"
                  error={touched.category && errors.category}
                  required
                />
                <Input
                  id="donate-quantity"
                  label="Quantity"
                  placeholder="e.g., 2 kg, 5 portions"
                  value={form.quantity}
                  onChange={e => update('quantity', e.target.value)}
                  onBlur={() => { touch('quantity'); validate(form); }}
                  error={touched.quantity && errors.quantity}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="donate-servings"
                  label="Approx. Servings"
                  type="number"
                  min="1"
                  max="200"
                  value={form.servings}
                  onChange={e => update('servings', e.target.value)}
                />
                <Input
                  id="donate-expiry"
                  label="Best Before / Expiry"
                  type="datetime-local"
                  value={form.expiryDate}
                  onChange={e => update('expiryDate', e.target.value)}
                  onBlur={() => { touch('expiryDate'); validate(form); }}
                  error={touched.expiryDate && errors.expiryDate}
                  required
                />
              </div>
              
              <Input
                id="donate-price"
                label="Price (set to 0 for free)"
                type="number"
                min="0"
                placeholder="0"
                value={form.price}
                onChange={e => update('price', e.target.value)}
                icon={<span className="text-white/40 text-xs font-bold">₹</span>}
                helperText="Leave as 0 to donate for free"
              />

              <Input
                id="donate-tags"
                label="Tags (comma separated)"
                placeholder="e.g., organic, fresh, vegan"
                value={form.tags}
                onChange={e => update('tags', e.target.value)}
                helperText="Helps people find your listing faster"
              />

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <button
                  id="donate-veg-toggle"
                  type="button"
                  onClick={() => update('isVeg', !form.isVeg)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 ${form.isVeg ? 'bg-green-500' : 'bg-white/20'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${form.isVeg ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <div className="flex items-center gap-1.5 text-sm text-white/70">
                  <Leaf size={14} className={form.isVeg ? 'text-green-400' : 'text-white/30'} />
                  {form.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Location & Pickup ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display font-bold text-xl text-white mb-2">Pickup Details</h2>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <Input
                    id="donate-location"
                    label="Pickup Location"
                    placeholder="e.g., 15 MG Road, Koramangala, Bangalore"
                    value={form.location}
                    onChange={e => update('location', e.target.value)}
                    onBlur={() => { touch('location'); validate(form); }}
                    error={touched.location && errors.location}
                    required
                    helperText="Be specific enough for people to find you"
                  />
                </div>
                <div className="pt-[22px]">
                  <Button 
                    id="donate-detect-btn"
                    variant="secondary" 
                    onClick={detectLocation} 
                    loading={detectingLoc}
                    icon={<MapPin size={16} />}
                  >
                    Detect
                  </Button>
                </div>
              </div>
              <Textarea
                id="donate-pickup-instructions"
                label="Pickup Instructions (optional)"
                placeholder="e.g., Ring the bell at Gate 2, available after 6 PM, call before coming..."
                value={form.pickupInstructions}
                onChange={e => update('pickupInstructions', e.target.value)}
                rows={3}
              />

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-blue-400 text-sm font-medium mb-1">📍 Location Privacy</p>
                <p className="text-white/50 text-xs">Your exact address is only shown to approved requesters. We only display the general area publicly.</p>
              </div>
            </div>
          )}

          {/* ── Step 2: Review ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-display font-bold text-xl text-white mb-2">Review Your Listing</h2>

              <div className="glass-card overflow-hidden">
                <img src={imagePreview || form.image} alt="Preview" className="w-full h-40 object-cover" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-white text-lg">{form.title}</h3>
                    <span className="badge badge-green flex-shrink-0">{form.category}</span>
                  </div>
                  <p className="text-white/60 text-sm mb-3 line-clamp-2">{form.description}</p>
                  {[
                    { label: 'Quantity', value: `${form.quantity} (~${form.servings} servings)` },
                    { label: 'Location', value: form.location },
                    { label: 'Expiry', value: new Date(form.expiryDate).toLocaleString('en-IN') },
                    { label: 'Price', value: parseFloat(form.price) === 0 ? 'FREE' : `₹${form.price}` },
                    { label: 'Type', value: form.isVeg ? '🌿 Vegetarian' : '🍗 Non-Vegetarian' },
                  ].map(info => (
                    <div key={info.label} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-white/40 text-sm">{info.label}</span>
                      <span className="text-white text-sm font-medium text-right max-w-[60%] truncate">{info.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-green-400 text-sm">✅ Your listing will be visible to people near {form.location?.split(',')[0]}.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button id="donate-back-btn" variant="secondary" onClick={() => setStep(s => s - 1)} disabled={loading}>
                ← Back
              </Button>
            )}
            <div className="flex-1" />
            {step < STEPS.length - 1 ? (
              <Button id="donate-next-btn" variant="primary" onClick={handleNext}>
                Continue →
              </Button>
            ) : (
              <Button id="donate-submit-btn" variant="primary" onClick={handleSubmit} loading={loading} icon={<Upload size={16} />}>
                Publish Listing
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
