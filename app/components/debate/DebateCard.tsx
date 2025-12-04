"use client";

import { Topic } from "@/lib/types/topic";
import Link from "next/link";
import { Users, Crown, Swords, Vote, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface DebateCardProps {
  topic: Topic;
  status: 'ongoing' | 'past';
  isFeatured?: boolean;
}

// --- Sub-components for the new design ---

const VoteBar = ({ pro, con, isFeatured }: { pro: number; con: number; isFeatured?: boolean }) => {
    const total = pro + con;
    if (total === 0) return <div className="h-3 w-full bg-muted rounded-full" />;
    
    const proPercent = (pro / total) * 100;
    const conPercent = 100 - proPercent;

    return (
        <div className={cn("w-full flex rounded-full text-white text-sm font-extrabold overflow-hidden", isFeatured ? "h-4" : "h-3")}>
            <div className="bg-blue-500 flex items-center justify-center pl-2 transition-all duration-300" style={{ width: `${proPercent}%` }}>
                {proPercent > 10 && <span>{Math.round(proPercent)}%</span>}
            </div>
            <div className="bg-red-500 flex items-center justify-center pr-2 transition-all duration-300" style={{ width: `${conPercent}%` }}>
                {conPercent > 10 && <span>{Math.round(conPercent)}%</span>}
            </div>
        </div>
    );
};

const ParticipantAvatars = ({ side, count }: { side: 'pro' | 'con'; count: number }) => (
    <div className="flex flex-col items-center gap-2">
        <h4 className={cn("font-bold text-lg", side === 'pro' ? 'text-blue-400' : 'text-red-400')}>{side === 'pro' ? '찬성' : '반대'}</h4>
        <div className="flex -space-x-3">
            {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-primary ring-2 ring-primary/20 bg-primary-foreground/10 flex items-center justify-center text-sm font-bold text-primary">
                     U{i+1}
                 </div>
            ))}
        </div>
        <p className="text-sm font-medium">{count.toLocaleString()} 명</p>
    </div>
);

const Countdown = ({ dateString }: { dateString: string }) => {
    const [remaining, setRemaining] = useState({ days: 0, hours: 0 });
    useEffect(() => {
        const interval = setInterval(() => {
            const endDate = new Date(dateString);
            endDate.setDate(endDate.getDate() + 7);
            const now = new Date();
            const diffTime = endDate.getTime() - now.getTime();
            if (diffTime <= 0) {
                setRemaining({ days: 0, hours: 0 });
                clearInterval(interval);
                return;
            }
            const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            setRemaining({ days, hours });
        }, 1000);
        return () => clearInterval(interval);
    }, [dateString]);

    return (
        <div className="text-center">
            <p className="text-muted-foreground text-sm">남은 시간</p>
            <p className="text-2xl font-bold">{`${remaining.days}일 ${remaining.hours}시간`}</p>
        </div>
    );
};


// --- Main Card Component ---

export default function DebateCard({ topic, status, isFeatured = false }: DebateCardProps) {
  // Helper to calculate remaining days, now local to DebateCard
  const getRemainingDays = (dateString: string) => {
      const endDate = new Date(dateString);
      endDate.setDate(endDate.getDate() + 7); // Assume a debate lasts for 7 days
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
  };
  
  const proVotes = topic.pro_votes || 0;
  const conVotes = topic.con_votes || 0;
  const totalVotes = proVotes + conVotes;
  const winner: 'pro' | 'con' | 'tie' = proVotes > conVotes ? 'pro' : conVotes > proVotes ? 'con' : 'tie';

  // === Featured Card Variant ===
  if (isFeatured) {
    return (
      <Link href={`/debate/${topic.id}`} className="block group">
        <div className="bg-card/50 border border-border rounded-2xl p-8 backdrop-blur-sm shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all duration-300 group-hover:border-blue-500 group-hover:scale-102">
          <div className="text-center mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">{topic.category}</span>
            <h3 className="text-4xl font-extrabold mt-3 line-clamp-2">{topic.display_name}</h3>
          </div>
          <div className="flex justify-around items-center my-8">
            <ParticipantAvatars side="pro" count={proVotes} />
            <div className="text-center">
                <Swords size={60} className="text-white mb-2 mx-auto" />
                <div className="text-5xl font-extrabold text-white">{totalVotes.toLocaleString()}</div>
                <div className="text-md text-gray-300 mt-1">총 참여자</div>
            </div>
            <ParticipantAvatars side="con" count={conVotes} />
          </div>
          <VoteBar pro={proVotes} con={conVotes} isFeatured={true} />
          <div className="flex justify-center items-center mt-8">
            <Countdown dateString={topic.published_at} />
          </div>
        </div>
      </Link>
    );
  }

  // === Standard & Past Card Variants ===
  return (
    <Link href={`/debate/${topic.id}`} className="block h-full group">
      <div className="h-full bg-card border border-border rounded-lg p-5 flex flex-col transition-all duration-300 group-hover:border-blue-500 group-hover:shadow-lg group-hover:-translate-y-1">
        <div className="flex justify-between items-start mb-3">
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-600/20 text-gray-300">{topic.category}</span>
          {status === 'ongoing' ? (
            <span className="text-xs font-bold px-2 py-1 bg-red-900/50 text-red-400 rounded-full">진행중</span>
          ) : (
            <span className="text-xs font-bold px-2 py-1 bg-muted text-muted-foreground rounded-full">종료</span>
          )}
        </div>

        <h3 className="font-extrabold text-foreground text-lg flex-grow line-clamp-2 mb-3">{topic.display_name}</h3>
        
        {status === 'ongoing' ? (
            <VoteBar pro={proVotes} con={conVotes} />
        ) : (
            <div className="my-4 text-center">
                <Crown size={20} className={cn("mx-auto mb-1", winner === 'pro' ? 'text-blue-400' : winner === 'con' ? 'text-red-400' : 'text-muted-foreground')} />
                <p className="text-sm font-bold">{winner === 'pro' ? '찬성 승리' : winner === 'con' ? '반대 승리' : '무승부'}</p>
            </div>
        )}

        <div className="flex justify-between items-center mt-auto text-sm text-muted-foreground pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-400" />
                <span>{totalVotes.toLocaleString()} 참여</span>
            </div>
            <div className="flex items-center gap-2">
                {status === 'ongoing' ? <Clock size={16} className="text-green-400" /> : <Crown size={16} className="text-yellow-400" />}
                <span>
                    {status === 'ongoing' 
                        ? `${Math.max(0, getRemainingDays(topic.published_at))}일 남음`
                        : `${(topic.view_count % 100).toLocaleString()} 의견`
                    }
                </span>
            </div>
        </div>
      </div>
    </Link>
  );
}
