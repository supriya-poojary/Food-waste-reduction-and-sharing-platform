import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Eye, EyeOff, Leaf, Mail, Lock, User, Phone, MapPin, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAsyncAction, useFormValidation, validators } from '../hooks/useHelpers';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const LOGIN_RULES = {
  email: [validators.required('Email is required'), validators.email()],
  password: [validators.required('Password is required')],
};

const REGISTER_RULES = {
  name: [validators.required('Name is required'), validators.minLength(2)],
  email: [validators.required('Email is required'), validators.email()],
  password: [validators.required('Password is required'), validators.minLength(8, 'Minimum 8 characters')],
  confirmPassword: [validators.required('Please confirm your password'), validators.match('password')],
  phone: [validators.phone()],
};

export default function AuthPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const { loading, execute } = useAsyncAction();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', location: '',
  });

  const loginVal = useFormValidation(LOGIN_RULES);
  const registerVal = useFormValidation(REGISTER_RULES);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/');
  }, [user]);

  useEffect(() => {
    setIsLogin(searchParams.get('mode') !== 'register');
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    loginVal.touchAll(loginForm);
    if (!loginVal.validate(loginForm)) return;
    await execute(
      () => login(loginForm.email, loginForm.password),
      {
        onSuccess: () => {
          toast.success('Welcome back! 👋');
          navigate('/');
        },
        onError: (err) => {
          toast.error(err);
          loginVal.setErrors({ password: err });
        },
      }
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    registerVal.touchAll(registerForm);
    if (!registerVal.validate(registerForm)) return;
    await execute(
      () => register(registerForm),
      {
        onSuccess: () => {
          toast.success('Account created! Welcome to FoodShare 🌱');
          navigate('/');
        },
        onError: (err) => {
          toast.error(err);
          registerVal.setErrors({ email: err });
        },
      }
    );
  };

  const updateLogin = (f, v) => {
    setLoginForm(prev => ({ ...prev, [f]: v }));
    if (loginVal.touched[f]) loginVal.validate({ ...loginForm, [f]: v });
  };

  const updateRegister = (f, v) => {
    setRegisterForm(prev => ({ ...prev, [f]: v }));
    if (registerVal.touched[f]) registerVal.validate({ ...registerForm, [f]: v });
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 hero-bg relative overflow-hidden">
      {/* Background orbs */}
      <div className="floating-orb w-96 h-96 bg-green-500 -top-20 -left-20 opacity-15" style={{ animationDuration: '8s' }} />
      <div className="floating-orb w-64 h-64 bg-emerald-600 bottom-10 right-10 opacity-15" style={{ animationDuration: '10s', animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-md py-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-up">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-glow-green">
              <Leaf size={24} className="text-white" />
            </div>
            <span className="font-display font-black text-2xl gradient-text">FoodShare</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white">
            {isLogin ? 'Welcome back!' : 'Join the movement'}
          </h1>
          <p className="text-white/50 mt-1 text-sm">
            {isLogin ? 'Log in to continue sharing food' : 'Create your free account today'}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-white/5 rounded-2xl p-1 mb-6 animate-fade-up" style={{ animationDelay: '50ms' }}>
          {[{ label: 'Log In', val: true }, { label: 'Sign Up', val: false }].map(t => (
            <button
              key={t.label}
              id={`auth-toggle-${t.label.toLowerCase().replace(' ', '-')}`}
              onClick={() => {
                setIsLogin(t.val);
                loginVal.clearErrors();
                registerVal.clearErrors();
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isLogin === t.val
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-glow-green'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Demo credentials hint */}
        {isLogin && (
          <div
            className="p-3 mb-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 animate-fade-in cursor-pointer hover:bg-blue-500/15 transition-all"
            onClick={() => { setLoginForm({ email: 'alex@foodshare.com', password: 'password123' }); }}
          >
            💡 <strong>Demo:</strong> Click here to auto-fill — <code>alex@foodshare.com</code> / <code>password123</code>
          </div>
        )}

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
          {isLogin ? (
            /* ── Login form ── */
            <form onSubmit={handleLogin} noValidate className="space-y-4">
              <Input
                id="auth-email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={e => updateLogin('email', e.target.value)}
                onBlur={() => { loginVal.touch('email'); loginVal.validate(loginForm); }}
                error={loginVal.touched.email && loginVal.errors.email}
                icon={<Mail size={16} />}
                required
              />
              <div>
                <Input
                  id="auth-password"
                  label="Password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Your password"
                  value={loginForm.password}
                  onChange={e => updateLogin('password', e.target.value)}
                  onBlur={() => { loginVal.touch('password'); loginVal.validate(loginForm); }}
                  error={loginVal.touched.password && loginVal.errors.password}
                  icon={<Lock size={16} />}
                  suffix={
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-white/40 hover:text-white transition-colors">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  required
                />
                <div className="flex justify-end mt-1">
                  <button type="button" className="text-xs text-green-400 hover:text-green-300 transition-colors">
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button
                id="auth-login-btn"
                type="submit"
                variant="primary"
                loading={loading}
                fullWidth
                size="lg"
              >
                Log In
              </Button>

              <p className="text-center text-white/50 text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-green-400 hover:text-green-300 font-semibold transition-colors"
                >
                  Sign up free
                </button>
              </p>
            </form>
          ) : (
            /* ── Register form ── */
            <form onSubmit={handleRegister} noValidate className="space-y-4">
              <Input
                id="auth-reg-name"
                label="Full Name"
                placeholder="Alex Johnson"
                value={registerForm.name}
                onChange={e => updateRegister('name', e.target.value)}
                onBlur={() => { registerVal.touch('name'); registerVal.validate(registerForm); }}
                error={registerVal.touched.name && registerVal.errors.name}
                icon={<User size={16} />}
                required
              />
              <Input
                id="auth-reg-email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={registerForm.email}
                onChange={e => updateRegister('email', e.target.value)}
                onBlur={() => { registerVal.touch('email'); registerVal.validate(registerForm); }}
                error={registerVal.touched.email && registerVal.errors.email}
                icon={<Mail size={16} />}
                required
              />
              <Input
                id="auth-reg-password"
                label="Password"
                type={showPwd ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                value={registerForm.password}
                onChange={e => updateRegister('password', e.target.value)}
                onBlur={() => { registerVal.touch('password'); registerVal.validate(registerForm); }}
                error={registerVal.touched.password && registerVal.errors.password}
                icon={<Lock size={16} />}
                suffix={
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-white/40 hover:text-white transition-colors">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                required
              />
              <Input
                id="auth-reg-confirm-password"
                label="Confirm Password"
                type={showConfirmPwd ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={registerForm.confirmPassword}
                onChange={e => updateRegister('confirmPassword', e.target.value)}
                onBlur={() => { registerVal.touch('confirmPassword'); registerVal.validate(registerForm); }}
                error={registerVal.touched.confirmPassword && registerVal.errors.confirmPassword}
                icon={<Lock size={16} />}
                suffix={
                  <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="text-white/40 hover:text-white transition-colors">
                    {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="auth-reg-phone"
                  label="Phone (optional)"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={registerForm.phone}
                  onChange={e => updateRegister('phone', e.target.value)}
                  onBlur={() => { registerVal.touch('phone'); registerVal.validate(registerForm); }}
                  error={registerVal.touched.phone && registerVal.errors.phone}
                  icon={<Phone size={16} />}
                />
                <Input
                  id="auth-reg-location"
                  label="Location (optional)"
                  placeholder="City, Area"
                  value={registerForm.location}
                  onChange={e => updateRegister('location', e.target.value)}
                  icon={<MapPin size={16} />}
                />
              </div>

              {/* Password strength */}
              {registerForm.password && (
                <div className="animate-fade-in">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => {
                      const strength = Math.min(
                        Math.floor(registerForm.password.length / 3) +
                        (registerForm.password.match(/[A-Z]/) ? 1 : 0) +
                        (registerForm.password.match(/[0-9]/) ? 1 : 0) +
                        (registerForm.password.match(/[^A-Za-z0-9]/) ? 1 : 0),
                        4
                      );
                      const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
                      return (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength - 1] : 'bg-white/10'}`} />
                      );
                    })}
                  </div>
                  <p className="text-xs text-white/40">
                    {registerForm.password.length < 8 ? 'Too short' :
                     registerForm.password.match(/[A-Z]/) && registerForm.password.match(/[0-9]/) ? '✅ Strong password' : 'Add uppercase & numbers'}
                  </p>
                </div>
              )}

              <Button
                id="auth-register-btn"
                type="submit"
                variant="primary"
                loading={loading}
                fullWidth
                size="lg"
              >
                Create Account
              </Button>

              <p className="text-center text-white/40 text-xs">
                By signing up, you agree to our{' '}
                <a href="#" className="text-green-400 hover:text-green-300">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-green-400 hover:text-green-300">Privacy Policy</a>
              </p>

              <p className="text-center text-white/50 text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-green-400 hover:text-green-300 font-semibold transition-colors"
                >
                  Log in
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Benefits */}
        {!isLogin && (
          <div className="mt-6 grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
            {[
              { icon: '🌱', text: '100% Free' },
              { icon: '🛡️', text: 'Verified Users' },
              { icon: '⚡', text: 'Instant Match' },
            ].map(b => (
              <div key={b.text} className="glass-card p-3 text-center">
                <div className="text-xl mb-1">{b.icon}</div>
                <p className="text-white/50 text-xs">{b.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
