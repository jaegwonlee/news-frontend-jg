"use client";

import { cn } from "@/lib/utils";
import { Bell, Bookmark, BookOpen, Lock, MessageSquare, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const tabs = [
  { id: "profile", label: "프로필", icon: User },
  { id: "saved", label: "저장된 기사", icon: Bookmark },
  { id: "notifications", label: "알림 설정", icon: Bell },
  { id: "inquiry", label: "문의하기", icon: MessageSquare },
  { id: "inquiryHistory", label: "문의 내역", icon: BookOpen },
  { id: "changePassword", label: "비밀번호 변경", icon: Lock },
  { id: "deleteAccount", label: "계정 삭제", icon: Trash2 },
];

export default function ProfileSidebar() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  return (
    <aside className="md:w-72 flex-shrink-0">
      <div className="sticky top-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl">
        <div className="mb-8 px-2">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">
            <span className="text-red-600">MY</span> CORNER
          </h2>
          <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">Fighter Management</p>
        </div>

        <nav className="flex flex-col space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/profile?tab=${tab.id}`}
                className={cn(
                  "group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-lg transform scale-[1.02]"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white"
                )}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />}
                <Icon
                  className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-red-500")}
                  strokeWidth={isActive ? 3 : 2}
                />
                <span className="font-bold text-sm tracking-tight">{tab.label}</span>
                {isActive && <div className="absolute right-4 w-2 h-2 rounded-full bg-red-600" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-dashed border-zinc-200 dark:border-zinc-800 px-2">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 text-center">
            <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Current Season</p>
            <p className="text-lg font-black italic text-zinc-900 dark:text-white">ROUND 2</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
