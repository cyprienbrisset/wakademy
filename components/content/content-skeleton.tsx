export default function ContentSkeleton({ type }: { type: string }) {
  return (
    <div className="space-y-4 animate-pulse">
      {type === "video" && <div className="aspect-video bg-muted rounded-lg"></div>}

      {type === "podcast" && (
        <div className="p-4 bg-card rounded-lg">
          <div className="flex gap-4">
            <div className="w-32 h-32 bg-muted rounded-md"></div>
            <div className="flex-grow space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-2 bg-muted rounded w-full"></div>
              <div className="flex justify-between">
                <div className="h-10 w-32 bg-muted rounded-full"></div>
                <div className="h-10 w-32 bg-muted rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {type === "document" && <div className="h-[70vh] bg-muted rounded-lg"></div>}

      <div className="h-12 bg-muted rounded"></div>
      <div className="h-32 bg-muted rounded"></div>
      <div className="h-48 bg-muted rounded"></div>
    </div>
  )
}
