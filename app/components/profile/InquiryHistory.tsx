"use client";

import ClientPaginationControls from "@/app/components/common/ClientPaginationControls";
import ErrorMessage from "@/app/components/common/ErrorMessage";
import LoadingSpinner from "@/app/components/common/LoadingSpinner";
import { useAuth } from "@/app/context/AuthContext";
import { getInquiries } from "@/lib/api/inquiry";
import { InquirySummary } from "@/lib/types/inquiry";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import InquiryDetail from "../inquiry/InquiryDetail";

export default function InquiryHistory() {
  const { token, logout } = useAuth();
  const [allInquiries, setAllInquiries] = useState<InquirySummary[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);

  const paginatedInquiries = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return allInquiries.slice(start, end);
  }, [allInquiries, page, limit]);

  const totalPages = useMemo(() => {
    return Math.ceil(allInquiries.length / limit);
  }, [allInquiries.length, limit]);

  useEffect(() => {
    const fetchInquiries = async () => {
      if (!token) {
        setError("로그인이 필요합니다.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await getInquiries(token);
        setAllInquiries(data || []);
      } catch (err: unknown) {
        console.error("Failed to fetch inquiries:", err);
        if (err instanceof Error) {
          if (String(err.message).includes("401") || String(err.message).includes("Unauthorized")) {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            logout();
          } else {
            setError(err.message || "문의 내역을 불러오는데 실패했습니다.");
          }
        } else {
          setError("알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiries();
  }, [token, logout]);

  const StatusBadge = ({ status }: { status: InquirySummary["status"] }) => {
    const statusMap = {
      SUBMITTED: { text: "답변 대기", className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
      ANSWERED: { text: "답변 완료", className: "bg-green-500/10 text-green-600 dark:text-green-400" },
      CLOSED: { text: "종료됨", className: "bg-secondary text-muted-foreground" },
    };
    const currentStatus = statusMap[status as keyof typeof statusMap] || statusMap.CLOSED;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${currentStatus.className}`}>
        {currentStatus.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48 p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (selectedInquiryId) {
    return <InquiryDetail inquiryId={selectedInquiryId} onBack={() => setSelectedInquiryId(null)} />;
  }

  return (
    <div className="p-6 sm:p-8 space-y-4">
      <h2 className="text-2xl font-bold text-foreground mb-4">문의 내역</h2>
      {allInquiries.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">제출된 문의가 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {paginatedInquiries.map((inquiry) => (
            <li
              key={inquiry.id}
              className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              onClick={() => setSelectedInquiryId(inquiry.id)}
            >
              {/* Background Accent */}
              <div
                className={cn(
                  "absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-150 duration-500",
                  inquiry.status === "ANSWERED" ? "bg-green-500" : "bg-blue-500"
                )}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3 relative z-10">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-300 dark:text-zinc-600 font-black text-2xl italic"># {inquiry.id}</span>
                  <StatusBadge status={inquiry.status} />
                </div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  {new Date(inquiry.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors relative z-10 line-clamp-1">
                {inquiry.subject}
              </h3>

              <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium relative z-10">
                <span className="uppercase tracking-tight text-xs">View Decision</span>
                <div className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all">
                  <svg
                    width="6"
                    height="6"
                    viewBox="0 0 6 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transform -rotate-45 group-hover:rotate-0 transition-transform"
                  >
                    <path d="M0 6L6 0M6 0H1.5M6 0V4.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && (
        <div className="pt-4">
          <ClientPaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
