import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Leaf, Users, TrendingDown, Globe2, 
  Heart, ChevronRight, Sparkles, Shield, Zap
} from 'lucide-react';
import { api } from '../data/storage';
import FoodCard from '../components/food/FoodCard';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

const STATS = [
  { value: '12,400+', label: 'Meals Shared', icon: Heart, color: 'from-green-400 to-emerald-500' },
  { value: '3,200+', label: 'Active Donors', icon: Users, color: 'from-blue-400 to-cyan-500' },
  { value: '48%', label: 'Waste Reduced', icon: TrendingDown, color: 'from-purple-400 to-pink-500' },
  { value: '25+', label: 'Cities Covered', icon: Globe2, color: 'from-orange-400 to-amber-500' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Matching',
    desc: 'Our smart algorithm connects donors with nearby recipients in real-time.',
    color: 'from-yellow-400 to-orange-400',
  },
  {
    icon: Shield,
    title: 'Safe & Verified',
    desc: 'All users are verified. Food safety guidelines are strictly enforced.',
    color: 'from-blue-400 to-cyan-400',
  },
  {
    icon: Sparkles,
    title: 'Zero Waste Goal',
    desc: 'Track your environmental impact with detailed donation statistics.',
    color: 'from-purple-400 to-pink-400',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Home Cook, Bangalore',
    text: 'FoodShare helped me donate my party leftovers to 15 families in my neighborhood. The platform is incredibly easy to use!',
    avatar: 'PS',
    rating: 5,
  },
  {
    name: 'Rahul Mehta',
    role: 'Restaurant Owner',
    text: 'We used to throw away 20kg of food daily. Now it all goes to families in need. FoodShare changed our business culture completely.',
    avatar: 'RM',
    rating: 5,
  },
  {
    name: 'Anita Krishnan',
    role: 'Community Volunteer',
    text: 'As a volunteer coordinator, FoodShare has made organizing food drives so much more efficient. Highly recommended!',
    avatar: 'AK',
    rating: 5,
  },
];

export default function HomePage() {
  const [recentFood, setRecentFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counter, setCounter] = useState({ meals: 0, donors: 0, waste: 0, cities: 0 });
  const statsRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    api.getFoodItems().then(items => {
      setRecentFood(items.slice(0, 6));
      setLoading(false);
    });
  }, []);

  // Animate counters when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Scroll animate
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(el => {
          if (el.isIntersecting) {
            el.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  function animateCounters() {
    const targets = { meals: 12400, donors: 3200, waste: 48, cities: 25 };
    const duration = 2000;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounter({
        meals: Math.floor(ease * targets.meals),
        donors: Math.floor(ease * targets.donors),
        waste: Math.floor(ease * targets.waste),
        cities: Math.floor(ease * targets.cities),
      });
      if (progress >= 1) clearInterval(timer);
    }, 16);
  }

  const counterValues = [
    `${counter.meals.toLocaleString()}+`,
    `${counter.donors.toLocaleString()}+`,
    `${counter.waste}%`,
    `${counter.cities}+`,
  ];

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center hero-bg overflow-hidden pt-16">
        {/* Floating orbs */}
        <div className="floating-orb w-96 h-96 bg-green-500 top-1/4 -left-32" style={{ animationDuration: '8s' }} />
        <div className="floating-orb w-64 h-64 bg-emerald-600 bottom-1/4 right-10" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="floating-orb w-48 h-48 bg-teal-500 top-10 right-1/3" style={{ animationDuration: '12s', animationDelay: '4s' }} />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-8 animate-fade-up">
              <Sparkles size={14} />
              <span>🌱 Join 3,200+ food heroes in your city</span>
            </div>

            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
              Turn Food Waste
              <br />
              Into <span className="gradient-text text-glow">Community Care</span>
            </h1>

            <p className="text-xl text-white/60 leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '200ms' }}>
              FoodShare connects surplus food with people who need it most. 
              Donate your leftovers, request what you need — zero waste, maximum impact.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '300ms' }}>
              <Link
                to="/donate"
                id="hero-donate-btn"
                className="btn-primary text-lg px-8 py-4 rounded-2xl inline-flex items-center gap-2 font-bold"
              >
                <Heart size={20} />
                Donate Food
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/browse"
                id="hero-browse-btn"
                className="btn-secondary text-lg px-8 py-4 rounded-2xl inline-flex items-center gap-2 font-bold"
              >
                <Leaf size={20} />
                Browse Food
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40 animate-fade-up" style={{ animationDelay: '400ms' }}>
              {['✅ 100% Free', '🛡️ Verified Users', '⚡ Instant Matching', '🌍 25+ Cities'].map(t => (
                <span key={t} className="flex items-center gap-1.5">{t}</span>
              ))}
            </div>
          </div>

          {/* Hero visual - floating cards */}
          <div className="mt-20 relative hidden lg:block">
            <div className="flex justify-center gap-4 perspective-1000">
              {recentFood.slice(0, 3).map((item, i) => (
                <div
                  key={item.id}
                  className="glass-card overflow-hidden w-64 flex-shrink-0 animate-float"
                  style={{
                    animationDelay: `${i * 0.8}s`,
                    transform: `rotate(${(i - 1) * 3}deg) translateY(${i === 1 ? '-20px' : '0'})`,
                  }}
                >
                  <img src={item.image} alt={item.title} className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <p className="text-white font-medium text-sm truncate">{item.title}</p>
                    <p className="text-green-400 text-xs mt-1">{item.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-soft">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-green-400 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section ref={statsRef} className="py-20 bg-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="stat-card scroll-animate" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon size={22} className="text-white" />
                </div>
                <p className="text-3xl font-display font-black text-white mb-1">
                  {counterValues[i]}
                </p>
                <p className="text-white/50 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recently Added Food ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-green-400 text-sm font-semibold uppercase tracking-wider">Fresh Listings</span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-1">
                Recently Added Food
              </h2>
              <p className="text-white/50 mt-2">Freshly listed by your neighbors — claim before it's gone!</p>
            </div>
            <Link
              to="/browse"
              id="home-view-all-btn"
              className="hidden sm:flex items-center gap-1 text-green-400 hover:text-green-300 font-semibold transition-colors text-sm"
            >
              View all <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <SkeletonGrid count={6} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentFood.map((item, i) => (
                <FoodCard key={item.id} item={item} animationDelay={i * 80} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/browse" id="home-browse-more-btn" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
              Browse All Food <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 bg-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 scroll-animate">
            <span className="text-green-400 text-sm font-semibold uppercase tracking-wider">Simple Process</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-2">How FoodShare Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'List Your Food', desc: 'Post surplus food with photos, location, and availability. Takes under 2 minutes.', emoji: '📸', color: 'from-green-400 to-emerald-500' },
              { step: '02', title: 'Get Matched', desc: 'Our algorithm instantly connects your listing with nearby recipients in your area.', emoji: '🔗', color: 'from-blue-400 to-cyan-500' },
              { step: '03', title: 'Share & Impact', desc: 'Coordinate pickup and track your environmental impact. Every meal counts!', emoji: '🌍', color: 'from-purple-400 to-pink-500' },
            ].map((s, i) => (
              <div
                key={s.step}
                className="glass-card p-8 text-center scroll-animate hover:scale-105 transition-all duration-300"
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="text-5xl mb-4">{s.emoji}</div>
                <div className={`inline-block text-xs font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent mb-2 tracking-widest`}>
                  STEP {s.step}
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-3">{s.title}</h3>
                <p className="text-white/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-green-400 text-sm font-semibold uppercase tracking-wider">Why FoodShare</span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-2 mb-6">
                Built for Real Community Impact
              </h2>
              <div className="space-y-6">
                {FEATURES.map((f, i) => (
                  <div key={f.title} className="flex gap-4 scroll-animate" style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center flex-shrink-0`}>
                      <f.icon size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/auth?mode=register" id="home-join-btn" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
                  Join the Movement <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* Impact card */}
            <div className="relative">
              <div className="glass-card p-8 scroll-animate">
                <h3 className="font-display font-bold text-2xl text-white mb-6">Your Impact Dashboard</h3>
                {[
                  { label: 'CO₂ Saved', value: '2.4 kg', progress: 78, color: 'from-green-500 to-emerald-400' },
                  { label: 'Water Saved', value: '180 L', progress: 65, color: 'from-blue-500 to-cyan-400' },
                  { label: 'Meals Shared', value: '12', progress: 45, color: 'from-purple-500 to-pink-400' },
                ].map(m => (
                  <div key={m.label} className="mb-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">{m.label}</span>
                      <span className="font-semibold text-white">{m.value}</span>
                    </div>
                    <div className="progress-bar">
                      <div className={`progress-fill bg-gradient-to-r ${m.color}`} style={{ width: `${m.progress}%` }} />
                    </div>
                  </div>
                ))}
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                  <p className="text-green-400 font-semibold text-sm">🌟 You're a Community Hero!</p>
                  <p className="text-white/50 text-xs mt-1">Top 10% of donors this month</p>
                </div>
              </div>
              <div className="floating-orb w-48 h-48 bg-green-500 -top-8 -right-8 opacity-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 scroll-animate">
            <span className="text-green-400 text-sm font-semibold uppercase tracking-wider">Community Love</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-2">What People Are Saying</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className="glass-card p-6 scroll-animate hover:scale-105 transition-all duration-300"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="glass-card p-12 relative overflow-hidden scroll-animate"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.08))',
              border: '1px solid rgba(34,197,94,0.25)',
            }}
          >
            <div className="floating-orb w-64 h-64 bg-green-400 top-0 left-0 opacity-10" />
            <div className="floating-orb w-48 h-48 bg-emerald-500 bottom-0 right-0 opacity-10" style={{ animationDelay: '3s' }} />
            <div className="relative z-10">
              <div className="text-5xl mb-6">🌿</div>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">
                Start Making a <span className="gradient-text">Difference</span> Today
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of community members who are fighting food waste and helping families in need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth?mode=register" id="cta-signup-btn" className="btn-primary px-8 py-4 text-lg font-bold rounded-2xl inline-flex items-center gap-2">
                  <Heart size={20} /> Get Started Free
                </Link>
                <Link to="/browse" id="cta-browse-btn" className="btn-secondary px-8 py-4 text-lg font-bold rounded-2xl">
                  Explore Food
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
