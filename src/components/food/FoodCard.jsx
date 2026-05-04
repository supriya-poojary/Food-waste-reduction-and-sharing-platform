import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Leaf, Star } from 'lucide-react';
import UrgencyBadge from '../ui/UrgencyBadge';

const CATEGORY_COLORS = {
  vegetables: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  fruits: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  cooked: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  bakery: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  dairy: { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/30' },
  snacks: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  grocery: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30' },
};

function getExpiryLabel(expiryDate) {
  const diff = new Date(expiryDate) - Date.now();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (diff < 0) return { label: 'Expired', urgent: true, level: 'EXPIRED' };
  if (hours < 2) return { label: `${Math.floor(hours * 60)}m left`, urgent: true, level: 'URGENT' };
  if (hours < 6) return { label: `${hours}h left`, urgent: true, level: 'HIGH' };
  if (hours < 24) return { label: `${hours}h left`, urgent: false, level: 'MEDIUM' };
  return { label: `${days}d left`, urgent: false, level: 'LOW' };
}

export default function FoodCard({ item, animationDelay = 0 }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const expiry = getExpiryLabel(item.expiryDate);
  const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.grocery;

  return (
    <Link
      to={`/food/${item.id}`}
      id={`food-card-${item.id}`}
      className="glass-card-hover overflow-hidden flex flex-col group block animate-fade-up"
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'both' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-48 bg-white/5">
        {!imgLoaded && !imgError && (
          <div className="skeleton absolute inset-0" />
        )}
        {!imgError ? (
          <img
            src={item.image}
            alt={item.title}
            className={`card-food-image object-cover transition-transform duration-500 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <span className="text-5xl">🍱</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className={`badge ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}>
            {item.category}
          </span>
          <UrgencyBadge level={expiry.level} />
          {item.isVeg && (
            <span className="badge bg-green-500/20 text-green-400 border border-green-500/30">
              <Leaf size={10} /> Veg
            </span>
          )}
        </div>

        {/* Status badge */}
        {item.status === 'requested' && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-yellow-500/30 text-yellow-300 border border-yellow-500/40">
              Requested
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-white text-base leading-snug mb-1.5 group-hover:text-green-400 transition-colors line-clamp-2">
          {item.title}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Meta info */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <MapPin size={12} className="text-green-400 flex-shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <Users size={12} className="text-blue-400 flex-shrink-0" />
            <span>~{item.servings} servings · {item.quantity}</span>
          </div>
          <div className={`flex items-center gap-1.5 text-xs ${expiry.urgent ? 'text-red-400' : 'text-white/50'}`}>
            <Clock size={12} className={expiry.urgent ? 'text-red-400' : 'text-orange-400'} />
            <span>{expiry.label}</span>
          </div>
        </div>

        {/* Donor */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {item.donorAvatar}
            </div>
            <span className="text-xs text-white/60">{item.donorName}</span>
          </div>
          <span className="text-xs text-green-400 font-semibold group-hover:text-green-300 transition-colors flex items-center gap-1">
            {(!item.price || item.price === 0) ? (
              <>
                <Star size={10} className="fill-green-400" />
                Free
              </>
            ) : (
              `₹${item.price}`
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
