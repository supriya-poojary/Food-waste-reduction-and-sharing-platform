import dbConnect from '../../lib/db.js';
import Request from '../../lib/models/Request.js';
import FoodItem from '../../lib/models/FoodItem.js';
import { getAuthUser } from '../../lib/auth.js';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const auth = getAuthUser(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const { status, pickupDetails } = req.body;
      const request = await Request.findById(id).populate('foodId');

      if (!request) return res.status(404).json({ message: 'Request not found' });

      // Logic: 
      // 1. Only donor can approve/reject
      // 2. Only requester can mark as 'completed'
      
      const isDonor = request.foodId && request.foodId.donorId.toString() === auth.id;
      const isRequester = request.requesterId.toString() === auth.id;

      if (status === 'approved' || status === 'rejected') {
        if (!isDonor) return res.status(403).json({ message: 'Only donor can approve/reject' });
        
        request.status = status;
        if (status === 'approved' && pickupDetails) {
          request.pickupDetails = pickupDetails;
          // If approved, maybe mark food as claimed
          await FoodItem.findByIdAndUpdate(request.foodId._id, { status: 'claimed' });
        } else if (status === 'rejected') {
          // If rejected, mark food back as available
          await FoodItem.findByIdAndUpdate(request.foodId._id, { status: 'available' });
        }
      } else if (status === 'completed') {
        if (!isRequester) return res.status(403).json({ message: 'Only requester can mark as completed' });
        request.status = 'completed';
      }

      await request.save();
      res.status(200).json(request);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
