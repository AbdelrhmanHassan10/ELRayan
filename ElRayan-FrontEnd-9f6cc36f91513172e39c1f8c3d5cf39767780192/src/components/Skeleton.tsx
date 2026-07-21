export function ProductSkeleton() {
  return (
    <div className="card">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-3 skeleton rounded w-1/2" />
        <div className="h-4 skeleton rounded w-full" />
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-5 skeleton rounded w-1/3" />
        <div className="h-9 skeleton rounded-lg" />
      </div>
    </div>
  )
}

export function OrderSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-4 skeleton rounded w-24" />
        <div className="h-4 skeleton rounded w-16" />
      </div>
      <div className="h-3 skeleton rounded w-32" />
      <div className="flex gap-2">
        <div className="w-12 h-12 skeleton rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 skeleton rounded w-3/4" />
          <div className="h-3 skeleton rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}
