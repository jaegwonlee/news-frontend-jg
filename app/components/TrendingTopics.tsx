import { formatRelativeTime } from "@/lib/utils";
import { Topic } from "@/types";
import { ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TrendingTopicsProps {
  topics: Topic[];
  displayMode: "popular" | "latest";
}

export default function TrendingTopics({ topics, displayMode }: TrendingTopicsProps) {
  return (
    <div className="h-full overflow-y-auto pr-1">
      {topics.length === 0 ? (
        <p className="text-muted-foreground text-center pt-10">표시할 토픽이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {topics.map((topic, index) => {
            const rank = index + 1;
            const isPopular = displayMode === "popular";
            const isTopThree = isPopular && rank <= 3;

            const rankClasses = [
              // Rank 1
              {
                gradient: "bg-gradient-gold",
                border: "border-yellow-400/50 hover:border-yellow-400",
                shadow: "hover:shadow-lg hover:shadow-yellow-500/10",
                rankText: "text-yellow-400",
              },
              // Rank 2
              {
                gradient: "bg-gradient-silver",
                border: "border-slate-400/50 hover:border-slate-300",
                shadow: "hover:shadow-lg hover:shadow-slate-500/10",
                rankText: "text-slate-300",
              },
              // Rank 3
              {
                gradient: "bg-gradient-bronze",
                border: "border-amber-600/50 hover:border-amber-500",
                shadow: "hover:shadow-lg hover:shadow-amber-600/10",
                rankText: "text-amber-600",
              },
            ];

            const cardClasses = cn(
              "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ease-in-out transform hover:-translate-y-1",
              "bg-card/50 backdrop-blur-sm",
              isTopThree
                ? `${rankClasses[rank - 1].gradient} ${rankClasses[rank - 1].border} ${rankClasses[rank - 1].shadow}`
                : "border-border hover:border-primary/50 hover:bg-accent"
            );

            const rankTextClasses = cn(
              "text-xl font-black transition-colors",
              isTopThree ? rankClasses[rank - 1].rankText : "text-muted-foreground group-hover:text-primary"
            );

            return (
              <Link href={`/debate/${topic.id}`} key={topic.id} className="outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
                <div className={cardClasses}>
                  <div className="w-8 flex-shrink-0 text-center">
                    <span className={rankTextClasses}>{isPopular ? rank : "•"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{topic.display_name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{formatRelativeTime(topic.published_at)}</span>
                      <div className="flex items-center gap-1">
                        <Eye size={12} />
                        <span>{topic.view_count.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="transform transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                    <ArrowRight size={20} className="text-muted-foreground group-hover:text-primary" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
