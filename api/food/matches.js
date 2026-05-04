// ─── Smart Matching Algorithm ─────────────────────────────────────────────────
import dbConnect from '../../lib/db.js';
import FoodItem from '../../lib/models/FoodItem.js';
import Claim from '../../lib/models/Claim.js';

// Haversine distance formula (km)
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getExpiryScore(expiryDate) {
  const hoursLeft = (new Date(expiryDate) - Date.now()) / (1000 * 60 * 60);
  if (hoursLeft < 0) return 0;
  if (hoursLeft < 2) return 100;
  if (hoursLeft < 6) return 85;
  if (hoursLeft < 24) return 55;
  if (hoursLeft < 72) return 30;
  return 15;
}

function getDistanceScore(distanceKm) {
  if (distanceKm === null || distanceKm === undefined) return 50; // no location: neutral
  if (distanceKm < 1) return 100;
  if (distanceKm < 3) return 80;
  if (distanceKm < 7) return 60;
  if (distanceKm < 15) return 35;
  if (distanceKm < 30) return 15;
  return 5;
}

function getQuantityScore(servings) {
  if (!servings) return 20;
  return Math.min(100, Math.max(20, servings * 4));
}

export function getUrgencyLevel(expiryDate) {
  const hoursLeft = (new Date(expiryDate) - Date.now()) / (1000 * 60 * 60);
  if (hoursLeft < 0) return 'EXPIRED';
  if (hoursLeft < 2) return 'URGENT';
  if (hoursLeft < 6) return 'HIGH';
  if (hoursLeft < 24) return 'MEDIUM';
  return 'LOW';
}

export function getExpiryStatus(expiryDate) {
  const hoursLeft = (new Date(expiryDate) - Date.now()) / (1000 * 60 * 60);
  if (hoursLeft < 0) return 'Expired';
  if (hoursLeft < 2) return `${Math.floor(hoursLeft * 60)}min left`;
  if (hoursLeft < 24) return `${Math.floor(hoursLeft)}h left`;
  return `${Math.floor(hoursLeft / 24)}d left`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  await dbConnect();

  try {
    const { lat, lng, radius = 30, limit = 20 } = req.query;
    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;

    // Auto-release expired claims
    const now = new Date();
    const expiredClaims = await Claim.find({ status: 'active', expiresAt: { $lt: now } });
    if (expiredClaims.length > 0) {
      const expiredFoodIds = expiredClaims.map((c) => c.foodId);
      await FoodItem.updateMany(
        { _id: { $in: expiredFoodIds } },
        { status: 'available', claimedBy: null, claimExpiresAt: null }
      );
      await Claim.updateMany({ _id: { $in: expiredClaims.map((c) => c._id) } }, { status: 'expired' });
    }

    // Fetch available + not expired food
    const items = await FoodItem.find({
      status: { $in: ['available', 'claimed'] },
      expiryDate: { $gt: new Date(Date.now() - 60 * 60 * 1000) }, // include items expired up to 1h ago
    }).lean();

    // Score each item
    const scored = items
      .map((item) => {
        let distanceKm = null;
        if (userLat && userLng && item.lat && item.lng) {
          distanceKm = haversineDistance(userLat, userLng, item.lat, item.lng);
          // Filter by radius
          if (distanceKm > parseFloat(radius)) return null;
        }

        const expiryScore = getExpiryScore(item.expiryDate);
        const distScore = getDistanceScore(distanceKm);
        const qtyScore = getQuantityScore(item.servings);
        const matchScore = Math.round(expiryScore * 0.4 + distScore * 0.35 + qtyScore * 0.25);
        const urgency = getUrgencyLevel(item.expiryDate);
        const expiryStatus = getExpiryStatus(item.expiryDate);

        return {
          ...item,
          id: item._id.toString(),
          distanceKm: distanceKm ? Math.round(distanceKm * 10) / 10 : null,
          matchScore,
          urgency,
          expiryStatus,
          expiryScore: Math.round(expiryScore),
          distanceScore: Math.round(distScore),
          quantityScore: Math.round(qtyScore),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, parseInt(limit));

    res.status(200).json(scored);
  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
