/**
 * Skeleton loaders for various content shapes.
 */

export function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="skeleton w-full h-48" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="flex gap-2 mt-3">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 glass-card">
      <div className="skeleton w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
      </div>
      <div className="skeleton h-8 w-20 rounded-xl" />
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="skeleton w-24 h-24 rounded-full" />
        <div className="space-y-3 flex-1">
          <div className="skeleton h-6 w-48 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-4 w-40 rounded" />
        </div>
      </div>
      {[1,2,3,4].map(i => (
        <div key={i} className="space-y-2">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-12 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4 rounded"
          style={{ width: `${Math.random() * 30 + 60}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
