// Seeds the database with demo food items that include lat/lng for Bangalore
import dbConnect from '../../lib/db.js';
import FoodItem from '../../lib/models/FoodItem.js';
import User from '../../lib/models/User.js';
import bcrypt from 'bcryptjs';

const SEED_FOOD = [
  { title: 'Fresh Organic Vegetables Pack', description: 'A variety of seasonal organic vegetables including carrots, spinach, tomatoes, and bell peppers. All freshly harvested from my garden.', category: 'vegetables', quantity: '5 kg', expiryHours: 48, location: 'Koramangala, Bangalore', lat: 12.9352, lng: 77.6245, donorName: 'Priya Sharma', donorAvatar: 'PS', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80', tags: ['organic', 'fresh', 'vegan'], servings: 10, isVeg: true },
  { title: 'Home-cooked Biryani', description: 'Made too much biryani for a family gathering. Aromatic basmati rice with spices, available for pickup tonight.', category: 'cooked', quantity: '3 portions', expiryHours: 8, location: 'HSR Layout, Bangalore', lat: 12.9116, lng: 77.6370, donorName: 'Rahul Mehta', donorAvatar: 'RM', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80', tags: ['cooked', 'spicy', 'vegetarian'], servings: 3, isVeg: true },
  { title: 'Bakery Bread & Pastries', description: 'End of day surplus from our bakery. Fresh sourdough loaves, croissants, and Danish pastries. Best consumed today.', category: 'bakery', quantity: '12 pieces', expiryHours: 3, location: 'Indiranagar, Bangalore', lat: 12.9784, lng: 77.6408, donorName: 'Anita Bakery', donorAvatar: 'AB', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', tags: ['bakery', 'fresh', 'surplus'], servings: 12, isVeg: true },
  { title: 'Mixed Fruit Basket', description: 'Assorted seasonal fruits: mangoes, bananas, apples, and oranges. Perfect for a family. Bought too many for the week.', category: 'fruits', quantity: '4 kg', expiryHours: 96, location: 'Whitefield, Bangalore', lat: 12.9698, lng: 77.7499, donorName: 'Vikram Nair', donorAvatar: 'VN', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80', tags: ['fruits', 'fresh', 'healthy'], servings: 8, isVeg: true },
  { title: 'Restaurant Leftover Meals', description: 'Our restaurant prepared extra portions of paneer butter masala, dal tadka, and rice. Packed hygienically in containers.', category: 'cooked', quantity: '8 meals', expiryHours: 5, location: 'MG Road, Bangalore', lat: 12.9756, lng: 77.6097, donorName: 'Spice Garden Restaurant', donorAvatar: 'SG', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80', tags: ['restaurant', 'cooked', 'Indian'], servings: 8, isVeg: true },
  { title: 'Dairy Products Bundle', description: 'Surplus dairy: 2L fresh milk, 500g paneer, and 1kg curd from our farm. All within expiry date. Pickup only.', category: 'dairy', quantity: 'Bundle', expiryHours: 1.5, location: 'Yelahanka, Bangalore', lat: 13.1007, lng: 77.5963, donorName: 'Green Farm Co.', donorAvatar: 'GF', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80', tags: ['dairy', 'farm-fresh', 'organic'], servings: 6, isVeg: true },
  { title: 'Party Food Surplus', description: 'Birthday party leftovers: sandwiches, pasta salad, mini quiches, and assorted snacks. All freshly made this morning.', category: 'snacks', quantity: 'Large quantity', expiryHours: 10, location: 'JP Nagar, Bangalore', lat: 12.9079, lng: 77.5922, donorName: 'Meera Krishnan', donorAvatar: 'MK', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&q=80', tags: ['party', 'snacks', 'assorted'], servings: 15, isVeg: false },
  { title: 'Canned Goods & Non-perishables', description: 'Cleaning out my pantry: canned beans, chickpeas, tomatoes, pasta, rice packets. All within expiry dates.', category: 'grocery', quantity: '20 items', expiryHours: 2160, location: 'BTM Layout, Bangalore', lat: 12.9166, lng: 77.6101, donorName: 'Suresh Patel', donorAvatar: 'SP', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80', tags: ['canned', 'pantry', 'non-perishable'], servings: 20, isVeg: true },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  // Only allow in dev
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ message: 'Forbidden in production' });

  await dbConnect();

  try {
    // Create demo user if not exists
    let demoUser = await User.findOne({ email: 'alex@foodshare.com' });
    if (!demoUser) {
      const hashed = await bcrypt.hash('password123', 12);
      demoUser = await User.create({
        name: 'Alex Johnson', email: 'alex@foodshare.com', password: hashed,
        avatar: 'AJ', bio: 'Food enthusiast and sustainability advocate.',
        location: 'Koramangala, Bangalore', phone: '+91 98765 43210',
        donationsCount: 12, requestsCount: 3, rating: 4.8,
        badges: ['Top Donor', 'Community Hero'],
      });
    }

    // Clear and re-seed food items
    await FoodItem.deleteMany({});
    const now = Date.now();
    const items = SEED_FOOD.map((f) => ({
      ...f,
      donorId: demoUser._id,
      expiryDate: new Date(now + f.expiryHours * 60 * 60 * 1000),
      postedAt: new Date(now - Math.random() * 8 * 60 * 60 * 1000),
      status: 'available',
    }));

    const created = await FoodItem.insertMany(items);
    res.status(200).json({ message: `Seeded ${created.length} food items`, userId: demoUser._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
