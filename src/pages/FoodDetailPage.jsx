import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Clock, Users, Leaf, ArrowLeft, Share2, Heart,
  AlertTriangle, CheckCircle, Phone, Mail, Star, Calendar
} from 'lucide-react';
import { api } from '../data/storage';
import { useAuth } from '../context/AuthContext';
import { useAsyncAction } from '../hooks/useHelpers';
import { Button } from '../components/ui/Button';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/Input';
import { SkeletonText } from '../components/ui/Skeleton';
import UrgencyBadge, { UrgencyRing } from '../components/ui/UrgencyBadge';
import ClaimModal from '../components/food/ClaimModal';
import toast from 'react-hot-toast';

function getExpiryLabel(expiryDate) {
  const diff = new Date(expiryDate) - Date.now();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (diff < 0) return { label: 'Expired', urgent: true, level: 'EXPIRED' };
  if (hours < 2) return { label: `${Math.floor(hours * 60)} mins left`, urgent: true, level: 'URGENT' };
  if (hours < 6) return { label: `${hours} hours left`, urgent: true, level: 'HIGH' };
  if (hours < 24) return { label: `${hours} hours left`, urgent: false, level: 'MEDIUM' };
  return { label: `${days} days left`, urgent: false, level: 'LOW' };
}

export default function FoodDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgZoomed, setImgZoomed] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const { loading: submitting, execute } = useAsyncAction();
  const { loading: sharing, execute: executeShare } = useAsyncAction();

  useEffect(() => {
    api.getFoodById(id)
      .then(data => { setFood(data); setLoading(false); })
      .catch(() => { setLoading(false); navigate('/browse'); });
  }, [id]);

  const handleRequestClick = () => {
    if (!user) {
      toast.error('Please log in to claim food');
      navigate('/auth');
      return;
    }
    if (food.donorId === user.id) {
      toast.error("You can't claim your own listing");
      return;
    }
    setClaimModalOpen(true);
  };

  const handleFoodClaimed = () => {
    setFood(prev => ({ ...prev, status: 'claimed' }));
  };

  const handleShare = async () => {
    await executeShare(async () => {
      await new Promise(r => setTimeout(r, 500));
      if (navigator.share) {
        await navigator.share({ title: food.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="skeleton h-8 w-32 rounded mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="skeleton w-full h-80 rounded-2xl" />
            <div className="space-y-4">
              <div className="skeleton h-8 w-3/4 rounded" />
              <SkeletonText lines={4} />
              <div className="skeleton h-12 w-full rounded-xl mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!food) return null;

  const expiry = getExpiryLabel(food.expiryDate);
  const isOwner = user?.id === food.donorId;
  const canRequest = !isOwner && food.status === 'available' && !requested;

  return (
    <div className="min-h-screen pt-24 pb-16 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <button
          id="detail-back-btn"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Browse
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — image */}
          <div>
            <div
              className={`relative overflow-hidden rounded-2xl cursor-zoom-in ${imgZoomed ? 'fixed inset-0 z-50 m-4 cursor-zoom-out rounded-2xl' : ''}`}
              onClick={() => setImgZoomed(!imgZoomed)}
            >
              {imgZoomed && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[-1]" onClick={() => setImgZoomed(false)} />
              )}
              <UrgencyRing level={expiry.level}>
                <img
                  src={food.image}
                  alt={food.title}
                  className={`w-full object-cover transition-transform duration-500 rounded-2xl ${imgZoomed ? 'h-full object-contain' : 'h-80 hover:scale-105'}`}
                />
              </UrgencyRing>
              <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                <span className="badge badge-green">{food.category}</span>
                <UrgencyBadge level={expiry.level} />
                {food.isVeg && (
                  <span className="badge badge-green">
                    <Leaf size={10} /> Veg
                  </span>
                )}
              </div>
              {imgZoomed && (
                <button
                  className="absolute top-3 right-3 p-2 bg-black/50 rounded-xl text-white hover:bg-black/80 transition-all"
                  onClick={() => setImgZoomed(false)}
                >
                  ✕
                </button>
              )}
              <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white/70 text-xs px-2 py-1 rounded-lg">
                Click to zoom
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {food.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/60">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right — details */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-white leading-tight">
                {food.title}
              </h1>
              <Button
                id="detail-share-btn"
                variant="ghost"
                size="sm"
                onClick={handleShare}
                loading={sharing}
                icon={<Share2 size={16} />}
              >
                Share
              </Button>
            </div>

            <p className="text-white/60 leading-relaxed mb-6">{food.description}</p>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { icon: MapPin, color: 'text-green-400', label: 'Location', value: food.location },
                { icon: Users, color: 'text-blue-400', label: 'Quantity', value: `${food.quantity} (~${food.servings} servings)` },
                {
                  icon: Clock,
                  color: expiry.urgent ? 'text-red-400' : 'text-orange-400',
                  label: 'Expires',
                  value: expiry.label,
                  urgent: expiry.urgent,
                },
                {
                  icon: Calendar,
                  color: 'text-purple-400',
                  label: 'Posted',
                  value: new Date(food.postedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
                },
              ].map(info => (
                <div key={info.label} className="glass-card p-3">
                  <div className={`flex items-center gap-1.5 mb-1 ${info.color}`}>
                    <info.icon size={14} />
                    <span className="text-xs font-semibold uppercase tracking-wider">{info.label}</span>
                  </div>
                  <p className={`text-sm font-medium ${info.urgent ? 'text-red-400' : 'text-white'}`}>
                    {info.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Expiry warning */}
            {expiry.urgent && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6 animate-pulse">
                <AlertTriangle size={16} />
                <span>Expiring soon! Request now before it's gone.</span>
              </div>
            )}

            {/* Status */}
            {(food.status === 'claimed' || food.status === 'requested' || requested) && (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm mb-6">
                <CheckCircle size={16} />
                <span>This item has already been reserved</span>
              </div>
            )}

            {/* Donor card */}
            <div className="glass-card p-4 mb-6">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Shared by</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    {food.donorAvatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{food.donorName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={11} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-white/50">4.8 · Trusted Donor</span>
                    </div>
                  </div>
                </div>
                {user && !isOwner && (
                  <div className="flex gap-2">
                    <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 transition-all text-white/60 hover:text-white">
                      <Phone size={15} />
                    </button>
                    <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 transition-all text-white/60 hover:text-white">
                      <Mail size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-auto">
              {canRequest ? (
                <Button
                  id="detail-claim-btn"
                  variant="primary"
                  onClick={handleRequestClick}
                  fullWidth
                  icon={<Zap size={18} />}
                  size="lg"
                >
                  Claim This Food
                </Button>
              ) : isOwner ? (
                <div className="flex-1 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm text-center">
                  This is your listing
                </div>
              ) : (
                <div className="flex-1 p-3 bg-white/5 border border-white/15 rounded-xl text-white/40 text-sm text-center">
                  {requested ? '✅ Request Sent' : 'Not Available'}
                </div>
              )}
              <Link to="/payment" className="btn-secondary px-4 flex items-center gap-2 rounded-xl">
                <Heart size={16} /> Donate
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      <ClaimModal 
        food={{ ...food, urgency: expiry.level, expiryStatus: expiry.label }} 
        isOpen={claimModalOpen} 
        onClose={() => setClaimModalOpen(false)} 
        onClaimed={handleFoodClaimed} 
      />
    </div>
  );
}
