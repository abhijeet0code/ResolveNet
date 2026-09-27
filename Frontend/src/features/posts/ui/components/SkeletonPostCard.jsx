
export function SkeletonPostCard() {
  return <div className="aspect-square animate-pulse rounded-lg bg-border" />;
}

// Used in the results list (active-query state)
export function SkeletonSearchRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-border" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 animate-pulse rounded bg-border" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-border" />
      </div>
    </div>
  );
}