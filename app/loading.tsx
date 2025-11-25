import { SectionGridSkeleton } from "./components/skeletons";

export default function Loading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 lg:pt-10 pb-20">
      <div className="flex flex-col gap-12 lg:gap-16">
        <SectionGridSkeleton variant="1+4" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 h-[600px]">
          <div className="md:col-span-1 xl:col-span-2 bg-muted rounded-2xl animate-pulse" />
          <div className="xl:col-span-1 bg-muted rounded-xl animate-pulse" />
        </div>
        <SectionGridSkeleton variant="1+4" />
        <SectionGridSkeleton variant="4-col" />
      </div>
    </div>
  );
}
