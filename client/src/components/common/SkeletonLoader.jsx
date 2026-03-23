export default function SkeletonLoader({ className = '', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-navy-100 dark:bg-navy-600 rounded-lg ${className}`}
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-4 bg-navy-100 dark:bg-navy-600 rounded w-3/4 mb-4" />
      <div className="h-8 bg-navy-100 dark:bg-navy-600 rounded w-1/2 mb-3" />
      <div className="h-3 bg-navy-100 dark:bg-navy-600 rounded w-full mb-2" />
      <div className="h-3 bg-navy-100 dark:bg-navy-600 rounded w-5/6" />
    </div>
  );
}
