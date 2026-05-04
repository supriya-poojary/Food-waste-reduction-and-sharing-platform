import dbConnect from '../../lib/db.js';
import Offer from '../../lib/models/Offer.js';
import Request from '../../lib/models/Request.js';
import { getAuthUser } from '../../lib/auth.js';

export default async function handler(req, res) {
  await dbConnect();
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method === 'POST') {
    try {
      const { requestId, price, quantity, message } = req.body;
      
      const offer = await Offer.create({
        requestId,
        price: parseFloat(price) || 0,
        quantity,
        message,
        donorId: auth.id,
        donorName: auth.name,
        donorAvatar: auth.avatar
      });
      
      return res.status(201).json(offer);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'GET') {
    const { requestId, donorId } = req.query;
    const filter = {};
    if (requestId) filter.requestId = requestId;
    if (donorId) filter.donorId = donorId;
    
    const offers = await Offer.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(offers);
  }

  return res.status(405).end();
}
