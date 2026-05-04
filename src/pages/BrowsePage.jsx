import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X, Leaf, RefreshCw } from 'lucide-react';
import { api } from '../data/storage';
import FoodCard from '../components/food/FoodCard';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

const CATEGORIES = [
  { value: 'all', label: 'All Food' },
  { value: 'vegetables', label: '🥦 Vegetables' },
  { value: 'fruits', label: '🍎 Fruits' },
  { value: 'cooked', label: '🍲 Cooked' },
  { value: 'bakery', label: '🥖 Bakery' },
  { value: 'dairy', label: '🥛 Dairy' },
  { value: 'snacks', label: '🍿 Snacks' },
  { value: 'grocery', label: '🛒 Grocery' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'servings', label: 'Most Servings' },
];

export default function BrowsePage() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [vegOnly, setVegOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [status, setStatus] = useState('all');

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, search, category, sortBy, vegOnly, status]);

  async function loadItems() {
    setLoading(true);
    const data = await api.getFoodItems();
    setItems(data);
    setLoading(false);
  }

  const applyFilters = useCallback(async () => {
    if (!items.length) return;
    setFilterLoading(true);
    await new Promise(r => setTimeout(r, 300));

    let result = [...items];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (category !== 'all') {
      result = result.filter(i => i.category === category);
    }
    if (vegOnly) {
      result = result.filter(i => i.isVeg);
    }
    if (status !== 'all') {
      result = result.filter(i => i.status === status);
    }

    // Sort
    if (sortBy === 'expiring') {
      result.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    } else if (sortBy === 'servings') {
      result.sort((a, b) => b.servings - a.servings);
    } else {
      result.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
    }

    setFiltered(result);
    setFilterLoading(false);
  }, [items, search, category, sortBy, vegOnly, status]);

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setSortBy('recent');
    setVegOnly(false);
    setStatus('all');
  };

  const hasActiveFilters = search || category !== 'all' || vegOnly || status !== 'all' || sortBy !== 'recent';

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display font-black text-4xl text-white mb-2">Browse Food</h1>
          <p className="text-white/50">
            {loading ? 'Loading...' : `${filtered.length} items available in your area`}
          </p>
        </div>

        {/* Search & Filter bar */}
        <div className="glass-card p-4 mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-64 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                id="browse-search"
                type="text"
                placeholder="Search by name, location, or tag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-glass pl-9 w-full"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              id="browse-sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input-glass w-auto min-w-40 cursor-pointer"
              style={{ WebkitAppearance: 'none' }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value} style={{ background: '#0f172a' }}>{o.label}</option>
              ))}
            </select>

            {/* Filter toggle */}
            <Button
              id="browse-filter-btn"
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              icon={<SlidersHorizontal size={16} />}
              className={showFilters ? 'border-green-400/50 text-green-400' : ''}
            >
              Filters {hasActiveFilters && <span className="w-2 h-2 bg-green-400 rounded-full ml-1" />}
            </Button>

            {/* Refresh */}
            <Button
              id="browse-refresh-btn"
              variant="ghost"
              onClick={loadItems}
              icon={<RefreshCw size={16} />}
            >
              Refresh
            </Button>
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-white/50 text-sm">Status:</span>
                {['all', 'available', 'requested'].map(s => (
                  <button
                    key={s}
                    id={`browse-status-${s}`}
                    onClick={() => setStatus(s)}
                    className={`filter-chip capitalize ${status === s ? 'active' : ''}`}
                  >
                    {s === 'all' ? 'All' : s}
                  </button>
                ))}
                <div className="w-px h-6 bg-white/15 mx-1" />
                <button
                  id="browse-veg-toggle"
                  onClick={() => setVegOnly(!vegOnly)}
                  className={`filter-chip flex items-center gap-1.5 ${vegOnly ? 'active' : ''}`}
                >
                  <Leaf size={12} /> Veg Only
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                  >
                    <X size={14} /> Clear all
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide animate-fade-up" style={{ animationDelay: '150ms' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              id={`browse-cat-${cat.value}`}
              onClick={() => setCategory(cat.value)}
              className={`filter-chip whitespace-nowrap flex-shrink-0 ${category === cat.value ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : filterLoading ? (
          <div className="relative">
            <div className="opacity-40 pointer-events-none">
              <SkeletonGrid count={6} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="glass-card p-6 flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-white/70 text-sm">Filtering results...</span>
              </div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 animate-fade-up">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="font-display font-bold text-2xl text-white mb-3">No Results Found</h3>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              We couldn't find any food matching your filters. Try adjusting your search criteria.
            </p>
            <Button id="browse-clear-filters-btn" variant="primary" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, i) => (
                <FoodCard key={item.id} item={item} animationDelay={i * 60} />
              ))}
            </div>
            <p className="text-center text-white/30 text-sm mt-8">
              Showing {filtered.length} of {items.length} items
            </p>
          </>
        )}
      </div>
    </div>
  );
}
