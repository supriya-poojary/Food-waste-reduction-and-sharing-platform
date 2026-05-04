import dbConnect from '../../lib/mongodb';
import Offer from '../../lib/models/Offer';
import Request from '../../lib/models/Request';
import Order from '../../lib/models/Order';
import { authenticate } from '../../lib/auth';

export default async function handler(req, res) {
  await dbConnect();
  const auth = authenticate(req);
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { status } = req.body;
      const offer = await Offer.findById(id);
      if (!offer) return res.status(404).json({ message: 'Offer not found' });

      if (status === 'accepted') {
        // Find the linked request
        const request = await Request.findById(offer.requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        // Update all other offers for this request to rejected
        await Offer.updateMany(
          { requestId: offer.requestId, _id: { $ne: id } },
          { status: 'rejected' }
        );

        // Update current offer and request status
        offer.status = 'accepted';
        await offer.save();

        request.status = 'closed';
        await request.save();

        // Create Order
        const order = await Order.create({
          requestId: request._id,
          offerId: offer._id,
          requesterId: request.requesterId,
          donorId: offer.donorId,
          amount: offer.price,
          paymentStatus: offer.price > 0 ? 'pending' : 'none',
          orderStatus: 'accepted'
        });

        return res.status(200).json({ offer, order });
      }

      offer.status = status;
      await offer.save();
      return res.status(200).json(offer);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  return res.status(405).end();
}
