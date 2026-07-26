/** Skeleton shown while the dashboard data resolves. */
export default function DashboardLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="glass h-32 animate-pulse rounded-2xl" />
      ))}
    </div>
  );
}
