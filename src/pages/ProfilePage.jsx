import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User, Heart, HandHeart, Edit3, Save, Camera,
  MapPin, Phone, Mail, Star, Award, Clock, CheckCircle, XCircle, Send, Bell
} from 'lucide-react';
import { api, storage } from '../data/storage';
import { useAuth } from '../context/AuthContext';
import { useAsyncAction, useFormValidation, validators } from '../hooks/useHelpers';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { SkeletonProfile, SkeletonGrid } from '../components/ui/Skeleton';
import FoodCard from '../components/food/FoodCard';
import toast from 'react-hot-toast';

// Define base tabs
const BASE_TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'impact', label: 'Impact', icon: Star },
];

const PROFILE_RULES = {
  name: [validators.required('Name is required'), validators.minLength(2)],
  email: [validators.required('Email is required'), validators.email()],
  phone: [validators.phone()],
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [editing, setEditing] = useState(false);
  const [myDonations, setMyDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [approvalModal, setApprovalModal] = useState({ open: false, requestId: null, pickupDetails: '' });
  const { loading: saving, execute } = useAsyncAction();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
  });

  const { errors, touched, validate, touch, touchAll } = useFormValidation(PROFILE_RULES);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    ...(user?.role === 'donor' ? [{ id: 'donations', label: 'My Donations', icon: Heart }] : []),
    ...(user?.role === 'donor' ? [{ id: 'incoming', label: 'Incoming Requests', icon: Bell }] : []),
    ...(user?.role === 'requester' ? [{ id: 'requests', label: 'My Requests', icon: HandHeart }] : []),
    { id: 'impact', label: 'Impact', icon: Star },
  ];

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    if (activeTab === 'donations' || activeTab === 'requests' || activeTab === 'incoming') loadUserData();
  }, [user, activeTab]);

  async function loadUserData() {
    setDataLoading(true);
    try {
      if (activeTab === 'donations') {
        const donations = await api.getFoodItems({ donorId: user.id });
        setMyDonations(donations);
      } else if (activeTab === 'requests') {
        const myRequests = await api.getUserRequests();
        setRequests(myRequests);
      } else if (activeTab === 'incoming') {
        const incoming = await fetcher('/api/requests?type=incoming');
        setRequests(incoming);
      }
    } catch (err) {
      console.error(err);
    }
    setDataLoading(false);
  }

  const handleApproveRequest = async () => {
    try {
      await fetcher(`/api/requests/${approvalModal.requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'approved', pickupDetails: approvalModal.pickupDetails })
      });
      toast.success('Request approved!');
      setApprovalModal({ open: false, requestId: null, pickupDetails: '' });
      loadUserData();
    } catch (error) {
      toast.error(error.message || 'Failed to approve');
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await fetcher(`/api/requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'rejected' })
      });
      toast.success('Request rejected');
      loadUserData();
    } catch (error) {
      toast.error(error.message || 'Failed to reject');
    }
  };

  const handleMarkCollected = async (id) => {
    try {
      await fetcher(`/api/requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'completed' })
      });
      toast.success('Food marked as collected! 🎉');
      // Success celebration!
      loadUserData();
      navigate('/payment'); // Redirect to payment for support as requested
    } catch (error) {
      toast.error(error.message || 'Failed to update');
    }
  };

  // Helper fetcher since we need some custom endpoints
  async function fetcher(url, options = {}) {
    const token = storage.getToken();
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  }

  const update = (f, v) => {
    setForm(prev => ({ ...prev, [f]: v }));
    if (touched[f]) validate({ ...form, [f]: v });
  };

  const handleSave = async () => {
    touchAll(form);
    if (!validate(form)) return;
    await execute(
      () => api.updateProfile(user.id, form),
      {
        onSuccess: (updated) => {
          updateUser(updated);
          setEditing(false);
          toast.success('✅ Profile updated successfully!');
        },
        onError: (err) => toast.error(err),
      }
    );
  };

  if (!user) return null;

  const impactStats = [
    { 
      label: user.role === 'donor' ? 'Meals Donated' : 'Meals Requested', 
      value: user.role === 'donor' ? (user.donationsCount || 0) : (user.requestsCount || 0), 
      icon: user.role === 'donor' ? Heart : HandHeart, 
      color: user.role === 'donor' ? 'from-green-400 to-emerald-500' : 'from-blue-400 to-cyan-500' 
    },
    { label: 'Rating', value: `${(user.rating || 5).toFixed(1)}★`, icon: Star, color: 'from-yellow-400 to-orange-500' },
    { label: 'CO₂ Saved', value: `${((user.donationsCount || 0) * 0.3).toFixed(1)}kg`, icon: Award, color: 'from-purple-400 to-pink-500' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Profile header banner */}
        <div
          className="glass-card p-6 sm:p-8 mb-6 relative overflow-hidden animate-fade-up"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(16,185,129,0.06))' }}
        >
          <div className="floating-orb w-48 h-48 bg-green-500 -top-10 -right-10 opacity-10" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-glow-green">
                {user.avatar || user.name?.[0] || 'U'}
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center hover:bg-green-400 transition-all shadow-lg">
                <Camera size={14} className="text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="font-display font-black text-2xl text-white">{user.name}</h1>
                {user.badges?.map(b => (
                  <span key={b} className="badge badge-green text-xs">{b}</span>
                ))}
              </div>
              <p className="text-white/50 text-sm mb-2">{user.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-white/50">
                {user.location && <span className="flex items-center gap-1"><MapPin size={13} />{user.location}</span>}
                {user.phone && <span className="flex items-center gap-1"><Phone size={13} />{user.phone}</span>}
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  Joined {new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              {user.bio && <p className="mt-3 text-white/60 text-sm max-w-lg">{user.bio}</p>}
            </div>

            <Button
              id="profile-edit-btn"
              variant={editing ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => { setEditing(!editing); setActiveTab('profile'); }}
              icon={<Edit3 size={15} />}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
          {impactStats.map(stat => (
            <div key={stat.label} className="glass-card p-4 text-center hover:scale-105 transition-all duration-300">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <stat.icon size={18} className="text-white" />
              </div>
              <p className="text-xl font-display font-black text-white">{stat.value}</p>
              <p className="text-white/40 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-2xl p-1 mb-6 overflow-x-auto animate-fade-up" style={{ animationDelay: '150ms' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              id={`profile-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-glow-green'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-fade-in">
          {/* ── Profile Tab ── */}
          {activeTab === 'profile' && (
            <div className="glass-card p-6 sm:p-8">
              {editing ? (
                <div className="space-y-5">
                  <h2 className="font-display font-bold text-xl text-white mb-4">Edit Your Profile</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="profile-name"
                      label="Full Name"
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      onBlur={() => { touch('name'); validate(form); }}
                      error={touched.name && errors.name}
                      icon={<User size={16} />}
                      required
                    />
                    <Input
                      id="profile-email"
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={e => update('email', e.target.value)}
                      onBlur={() => { touch('email'); validate(form); }}
                      error={touched.email && errors.email}
                      icon={<Mail size={16} />}
                      required
                    />
                    <Input
                      id="profile-phone"
                      label="Phone"
                      type="tel"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      onBlur={() => { touch('phone'); validate(form); }}
                      error={touched.phone && errors.phone}
                      icon={<Phone size={16} />}
                    />
                    <Input
                      id="profile-location"
                      label="Location"
                      value={form.location}
                      onChange={e => update('location', e.target.value)}
                      icon={<MapPin size={16} />}
                    />
                  </div>
                  <Textarea
                    id="profile-bio"
                    label="Bio"
                    placeholder="Tell the community about yourself..."
                    value={form.bio}
                    onChange={e => update('bio', e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-3 justify-end">
                    <Button id="profile-cancel-btn" variant="secondary" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
                    <Button id="profile-save-btn" variant="primary" onClick={handleSave} loading={saving} icon={<Save size={16} />}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="font-display font-bold text-xl text-white mb-4">Account Information</h2>
                  {[
                    { label: 'Full Name', value: user.name, icon: User },
                    { label: 'Email', value: user.email, icon: Mail },
                    { label: 'Phone', value: user.phone || 'Not set', icon: Phone },
                    { label: 'Location', value: user.location || 'Not set', icon: MapPin },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/8 transition-all">
                      <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <row.icon size={16} className="text-white/60" />
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">{row.label}</p>
                        <p className="text-white font-medium text-sm">{row.value}</p>
                      </div>
                    </div>
                  ))}
                  {user.bio && (
                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-white/40 text-xs mb-1">Bio</p>
                      <p className="text-white/80 text-sm">{user.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Donations Tab ── */}
          {activeTab === 'donations' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl text-white">
                  My Donations ({myDonations.length})
                </h2>
              </div>
              {dataLoading ? (
                <SkeletonGrid count={3} />
              ) : myDonations.length === 0 ? (
                <div className="text-center py-20 glass-card">
                  <div className="text-5xl mb-4">📦</div>
                  <h3 className="font-bold text-xl text-white mb-2">No donations yet</h3>
                  <p className="text-white/50 mb-6">Share your first food item and make a difference!</p>
                  <Button id="profile-donate-btn" variant="primary" onClick={() => navigate('/donate')}>
                    Donate Food Now
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {myDonations.map((item, i) => (
                    <FoodCard key={item.id} item={item} animationDelay={i * 60} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Requests Tab (Requester View) ── */}
          {activeTab === 'requests' && (
            <div>
              <h2 className="font-display font-bold text-xl text-white mb-6">
                My Requests ({requests.length})
              </h2>
              {dataLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton h-24 rounded-xl" />
                  ))}
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-20 glass-card">
                  <div className="text-5xl mb-4">🙏</div>
                  <h3 className="font-bold text-xl text-white mb-2">No active requests</h3>
                  <p className="text-white/50 mb-6">Need food? Check out our browse page to find items near you.</p>
                  <Button variant="primary" onClick={() => navigate('/browse')}>Browse Food</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req, i) => (
                    <div key={req.id} className="glass-card p-4 flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                      <img src={req.foodId?.image || 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=200&q=80'} alt="Food" className="w-full sm:w-24 h-24 object-cover rounded-xl border border-white/10" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-white font-semibold line-clamp-1">{req.foodId?.title || 'General Request'}</p>
                            <span className={`badge flex-shrink-0 ${
                              req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              req.status === 'approved' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                              req.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                              'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {req.status.toUpperCase()}
                            </span>
                          </div>
                          {req.status === 'approved' && (
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-2">
                              <p className="text-blue-400 text-xs font-bold mb-1 uppercase tracking-wider">Pickup Instructions:</p>
                              <p className="text-white text-sm">{req.pickupDetails || 'Collect from the listed location.'}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-white/40 text-xs">
                            Requested on {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                          {req.status === 'approved' && (
                            <Button size="sm" variant="primary" onClick={() => handleMarkCollected(req.id)}>
                              Mark as Collected
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Incoming Requests Tab (Donor View) ── */}
          {activeTab === 'incoming' && (
            <div>
              <h2 className="font-display font-bold text-xl text-white mb-6">
                Requests Received ({requests.length})
              </h2>
              {dataLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton h-24 rounded-xl" />
                  ))}
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-20 glass-card">
                  <div className="text-5xl mb-4">📨</div>
                  <h3 className="font-bold text-xl text-white mb-2">No requests yet</h3>
                  <p className="text-white/50">Your donated items will appear here once people request them.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req, i) => (
                    <div key={req.id} className="glass-card p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`badge ${
                              req.status === 'pending' ? 'badge-yellow' : 
                              req.status === 'approved' ? 'badge-green' : 'badge-red'
                            }`}>
                              {req.status}
                            </span>
                            <span className="text-white/40 text-xs">• Requested by {req.requesterName}</span>
                          </div>
                          <h3 className="text-white font-bold text-lg mb-1">{req.foodId?.title}</h3>
                          <p className="text-white/60 text-sm italic">"{req.message || 'No message provided'}"</p>
                        </div>
                        
                        {req.status === 'pending' && (
                          <div className="flex sm:flex-col gap-2">
                            <Button size="sm" variant="primary" onClick={() => setApprovalModal({ open: true, requestId: req.id, pickupDetails: '' })}>
                              Approve
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10" onClick={() => handleRejectRequest(req.id)}>
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Impact Tab ── */}
          {activeTab === 'impact' && (
            <div className="space-y-6">
              <h2 className="font-display font-bold text-xl text-white">Your Environmental Impact</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { label: 'CO₂ Emissions Prevented', value: `${((user.donationsCount || 0) * 0.3).toFixed(2)} kg`, icon: '🌍', progress: Math.min((user.donationsCount || 0) * 8, 100) },
                  { label: 'Water Saved', value: `${((user.donationsCount || 0) * 15).toFixed(0)} L`, icon: '💧', progress: Math.min((user.donationsCount || 0) * 12, 100) },
                  { label: 'Meals Provided', value: `${(user.donationsCount || 0) * 4} meals`, icon: '🍽️', progress: Math.min((user.donationsCount || 0) * 7, 100) },
                  { label: 'Trees Equivalent', value: `${((user.donationsCount || 0) * 0.05).toFixed(2)} trees`, icon: '🌳', progress: Math.min((user.donationsCount || 0) * 10, 100) },
                ].map(metric => (
                  <div key={metric.label} className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{metric.icon}</span>
                      <div>
                        <p className="text-white font-bold text-lg">{metric.value}</p>
                        <p className="text-white/50 text-xs">{metric.label}</p>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.max(metric.progress, 5)}%` }} />
                    </div>
                    <p className="text-white/30 text-xs mt-1">{metric.progress}% of monthly goal</p>
                  </div>
                ))}
              </div>

              <div className="glass-card p-6" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.05))' }}>
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <Award size={18} className="text-yellow-400" /> Your Achievements
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {user.badges?.map(badge => (
                    <div key={badge} className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
                      <span className="text-xl">🏅</span>
                      <span className="text-white text-xs font-medium">{badge}</span>
                    </div>
                  ))}
                  {(!user.badges || user.badges.length < 3) && (
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl opacity-40">
                      <span className="text-xl">🔒</span>
                      <span className="text-white text-xs">Donate 5x to unlock</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      <Modal 
        isOpen={approvalModal.open} 
        onClose={() => setApprovalModal({ ...approvalModal, open: false })}
        title="Approve Request"
      >
        <div className="space-y-4">
          <p className="text-white/60 text-sm">
            Provide pickup instructions for the requester (e.g., exact address, gate code, or preferred time).
          </p>
          <Textarea 
            placeholder="e.g., Please collect from Gate 2. I'm available between 6-8 PM today."
            value={approvalModal.pickupDetails}
            onChange={(e) => setApprovalModal({ ...approvalModal, pickupDetails: e.target.value })}
            rows={4}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setApprovalModal({ ...approvalModal, open: false })} fullWidth>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApproveRequest} fullWidth icon={<Send size={16} />}>
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
