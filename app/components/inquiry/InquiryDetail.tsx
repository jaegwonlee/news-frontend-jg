"use client";

import { Button } from "@/app/components/common/Button";
import ErrorMessage from "@/app/components/common/ErrorMessage";
import LoadingSpinner from "@/app/components/common/LoadingSpinner";
import { useAuth } from "@/app/context/AuthContext";
import { getInquiryDetail } from "@/lib/api/inquiry";
import { InquiryDetail as InquiryDetailType } from "@/lib/types/inquiry";
import { cn } from "@/lib/utils";
import { ArrowLeft, Calendar, DownloadCloud, User } from "lucide-react";
import { useEffect, useState } from "react";

interface InquiryDetailProps {
  inquiryId: number;
  onBack: () => void;
}

export default function InquiryDetail({ inquiryId, onBack }: InquiryDetailProps) {
  const { token, logout } = useAuth();
  const [inquiry, setInquiry] = useState<InquiryDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!token || !inquiryId || isNaN(inquiryId)) return;

      setIsLoading(true);
      setError(null);
      try {
        const fetchedDetail = await getInquiryDetail(token, inquiryId);
        setInquiry(fetchedDetail);
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (String(err.message).includes("401") || String(err.message).includes("Unauthorized")) {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            logout();
          } else {
            setError(err.message || "문의 상세 정보를 불러오는데 실패했습니다.");
          }
        } else {
          setError("알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [token, inquiryId, logout]);

  const handleDownload = () => {
    if (!inquiry?.attachment_url) return;
    window.open(inquiry.attachment_url, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center h-full min-h-[400px]">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!inquiry) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 min-h-[600px] overflow-y-auto custom-scrollbar">
      {/* Navigation */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 group text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold uppercase tracking-wide">Back to Ring</span>
        </button>

        <div className="text-right">
          <div className="text-xs font-black uppercase text-zinc-400 tracking-widest mb-0.5">Fight Record</div>
          <div className="text-lg font-black italic text-zinc-900 dark:text-white">#{inquiry.id}</div>
        </div>
      </div>

      <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-12">
        {/* BLUE CORNER: Challenger (User) */}
        <div className="relative group">
          {/* Corner Label */}
          <div className="absolute -top-3 left-8 px-4 py-1 bg-blue-600 text-white text-xs font-black uppercase tracking-wider skew-x-[-10deg] shadow-lg z-10">
            Blue Corner (Challenger)
          </div>

          <div className="border-4 border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10 rounded-3xl p-6 md:p-10 relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b-2 border-dashed border-blue-200 dark:border-blue-800/50">
              <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white leading-tight break-keep">
                {inquiry.subject}
              </h1>
              <div className="flex items-center gap-3 shrink-0 text-sm font-bold text-blue-600 dark:text-blue-400">
                <span className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800">
                  <User className="w-4 h-4" />
                  User Info
                </span>
                <span className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800">
                  <Calendar className="w-4 h-4" />
                  {new Date(inquiry.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-zinc dark:prose-invert max-w-none mb-8">
              <p className="whitespace-pre-wrap leading-loose text-lg font-medium text-zinc-800 dark:text-zinc-200">
                {inquiry.content}
              </p>
            </div>

            {/* Attachments */}
            {inquiry.attachment_url && (
              <div className="bg-white dark:bg-zinc-900 border-2 border-blue-100 dark:border-blue-800/50 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <DownloadCloud className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm">Attached Evidence</span>
                </div>
                <Button
                  onClick={handleDownload}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 font-bold"
                >
                  Download
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* VS Separator */}
        <div className="relative h-12 flex items-center justify-center">
          <div className="absolute inset-x-0 h-px bg-zinc-200 dark:bg-zinc-800" />
          <div className="relative z-10 bg-white dark:bg-zinc-900 px-6 py-2">
            <span className="text-4xl font-black italic text-zinc-200 dark:text-zinc-800 select-none">VS</span>
          </div>
        </div>

        {/* RED CORNER: Champion (Admin) */}
        <div className="relative">
          {/* Corner Label */}
          <div className="absolute -top-3 right-8 px-4 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-wider skew-x-[10deg] shadow-lg z-10">
            Red Corner (Official)
          </div>

          <div
            className={cn(
              "border-4 rounded-3xl p-6 md:p-10 relative overflow-hidden transition-all",
              inquiry.answer
                ? "border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10"
                : "border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 opacity-60"
            )}
          >
            {inquiry.answer ? (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/20">
                    <span className="font-black text-xl italic">A</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic text-zinc-900 dark:text-white uppercase">
                      Official Decision
                    </h3>
                    <p className="text-xs font-bold text-red-500 uppercase">
                      Replied on {new Date(inquiry.answer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="prose prose-zinc dark:prose-invert max-w-none">
                  <div className="relative pl-6 border-l-4 border-red-200 dark:border-red-900/50">
                    <p className="whitespace-pre-wrap leading-loose text-lg font-medium text-zinc-800 dark:text-zinc-200">
                      {inquiry.answer.content}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-red-100 dark:border-red-900/20 text-center">
                  <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Case Closed</p>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-3xl grayscale opacity-30">
                  ⏱️
                </div>
                <h3 className="text-xl font-black text-zinc-400 uppercase mb-2">Waiting for Official Review</h3>
                <p className="text-zinc-500 max-w-xs mx-auto">
                  심판진(관리자)이 내용을 확인하고 있습니다. <br />
                  판정이 나올 때까지 잠시만 기다려주세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
