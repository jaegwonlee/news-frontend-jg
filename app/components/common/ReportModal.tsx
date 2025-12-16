"use client";

import { useAuth } from "@/app/context/AuthContext";
import { reportComment } from "@/lib/api/comments";
import { reportChatMessage } from "@/lib/api/topics";
import { cn } from "@/lib/utils"; // Ensure cn is available or use clsx/tailwind-merge
import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: "comment" | "chat";
  targetId: number;
  onReportSuccess: (message: string, reportedId: number) => void;
}

const reportReasons = [
  { value: "SPAM", label: "스팸 / 홍보" },
  { value: "FLOODING", label: "도배성 콘텐츠" },
  { value: "PRIVACY_DEFAMATION", label: "명예훼손 / 사생활 침해" },
  { value: "ABUSIVE", label: "욕설 / 비하 발언" }, // Added common reason
  { value: "ETC", label: "기타" },
];

export default function ReportModal({ isOpen, onClose, reportType, targetId, onReportSuccess }: ReportModalProps) {
  const { token } = useAuth();
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimateIn(true);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    } else {
      setAnimateIn(false);
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedReason || !token) return;

    setIsSubmitting(true);
    try {
      let response;
      if (reportType === "comment") {
        response = await reportComment(targetId, selectedReason, token);
      } else {
        response = await reportChatMessage(targetId, selectedReason, token);
      }

      onReportSuccess(response.message, targetId);
      onClose();
    } catch (error) {
      console.error(`Failed to report ${reportType}:`, error);
      onReportSuccess(`신고 처리 중 오류가 발생했습니다.`, targetId); // Simplified error message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          animateIn ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 border border-zinc-200 dark:border-zinc-800",
          animateIn ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
            <AlertTriangle className="w-5 h-5 fill-red-100 dark:fill-red-900/30" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">신고하기</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 font-medium">
            신고 사유를 선택해주세요. 허위 신고 시 제재를 받을 수 있습니다.
          </p>

          <div className="space-y-2 mb-6">
            {reportReasons.map((reason) => (
              <label
                key={reason.value}
                className={cn(
                  "flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-200 group relative overflow-hidden",
                  selectedReason === reason.value
                    ? "border-red-500 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 shadow-sm ring-1 ring-red-500/20"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-red-200 dark:hover:border-red-900/50"
                )}
              >
                <input
                  type="radio"
                  name="reportReason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="sr-only" // Hide default radio
                />

                {/* Custom Radio Circle */}
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center transition-colors",
                    selectedReason === reason.value
                      ? "border-red-500"
                      : "border-zinc-300 dark:border-zinc-600 group-hover:border-red-300"
                  )}
                >
                  {selectedReason === reason.value && <div className="w-2 h-2 rounded-full bg-red-500" />}
                </div>

                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    selectedReason === reason.value
                      ? "text-red-700 dark:text-red-400"
                      : "text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"
                  )}
                >
                  {reason.label}
                </span>

                {selectedReason === reason.value && (
                  <CheckCircle2 className="w-4 h-4 text-red-500 ml-auto animate-in fade-in zoom-in duration-200" />
                )}
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className={cn(
                "flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-xl transition-all shadow-md shadow-red-500/20 flex items-center justify-center",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              )}
              disabled={!selectedReason || isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "신고하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
