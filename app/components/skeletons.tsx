export function ArticleCardSkeleton({
  variant = "standard",
}: {
  variant?: "hero" | "standard" | "horizontal" | "compact" | "overlay";
}) {
  if (variant === "hero") {
    return (
      <div className="w-full animate-pulse">
        <div className="w-full aspect-video bg-muted rounded-xl mb-4" />
        <div className="flex flex-col gap-2">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="flex justify-between items-center mt-2">
            <div className="h-3 bg-muted rounded w-20" />
            <div className="h-3 bg-muted rounded w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div className="flex gap-4 w-full animate-pulse">
        <div className="w-24 h-24 md:w-32 md:h-24 bg-muted rounded-lg flex-shrink-0" />
        <div className="flex flex-col flex-grow justify-between h-24 py-1">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
          <div className="flex justify-between items-center">
            <div className="h-3 bg-muted rounded w-16" />
            <div className="h-3 bg-muted rounded w-12" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="w-full py-2 border-b border-border animate-pulse">
        <div className="h-4 bg-muted rounded w-full mb-2" />
        <div className="h-3 bg-muted rounded w-20" />
      </div>
    );
  }

  // Standard & Overlay
  return (
    <div className="w-full h-full flex flex-col animate-pulse">
      <div className="w-full aspect-video bg-muted rounded-xl mb-4" />
      <div className="flex flex-col gap-2 flex-grow">
        <div className="h-6 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="h-3 bg-muted rounded w-20" />
        <div className="h-3 bg-muted rounded w-16" />
      </div>
    </div>
  );
}

export function SectionGridSkeleton({ variant = "3-col" }: { variant?: "1+4" | "3-col" | "4-col" | "1+2" | "list" }) {
  return (
    <div className="w-full">
      <div className="h-8 bg-muted rounded w-32 mb-6" />

      {variant === "1+4" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <ArticleCardSkeleton variant="hero" />
          </div>
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <ArticleCardSkeleton key={i} variant="horizontal" />
            ))}
          </div>
        </div>
      )}

      {variant === "1+2" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div>
            <ArticleCardSkeleton variant="hero" />
          </div>
          <div className="flex flex-col gap-6">
            {[1, 2].map((i) => (
              <ArticleCardSkeleton key={i} variant="horizontal" />
            ))}
          </div>
        </div>
      )}

      {variant === "3-col" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ArticleCardSkeleton key={i} variant="standard" />
          ))}
        </div>
      )}

      {variant === "4-col" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <ArticleCardSkeleton key={i} variant="standard" />
          ))}
        </div>
      )}
    </div>
  );
}
