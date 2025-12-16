"use client";

import ClientPaginationControls from "@/app/components/common/ClientPaginationControls";
import ErrorMessage from "@/app/components/common/ErrorMessage";
import LoadingSpinner from "@/app/components/common/LoadingSpinner";
import InquiryDetail from "@/app/components/inquiry/InquiryDetail";
import InquiryForm from "@/app/components/inquiry/InquiryForm";
import { useAuth } from "@/app/context/AuthContext";
import { getInquiries } from "@/lib/api/inquiry";
import { InquirySummary } from "@/lib/types/inquiry";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock, Plus, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function InquiryClientPage() {
  const { token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Data State
  const [allInquiries, setAllInquiries] = useState<InquirySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & UI State
  const [filter, setFilter] = useState<"ALL" | "ANSWERED" | "SUBMITTED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 9; // Grid friendly number

  const fetchInquiries = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedInquiries = await getInquiries(token);
      setAllInquiries(fetchedInquiries);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "문의 내역을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      if (token) {
        fetchInquiries();
      } else {
        router.push("/login");
      }
    }
  }, [authLoading, token, router, fetchInquiries]);

  useEffect(() => {
    const idFromParams = searchParams.get("id");
    if (idFromParams === "new") {
      setIsCreating(true);
      setSelectedInquiryId(null);
    } else if (idFromParams) {
      const numericId = parseInt(idFromParams, 10);
      if (!isNaN(numericId)) {
        setSelectedInquiryId(numericId);
        setIsCreating(false);
      } else {
        setSelectedInquiryId(null);
        setIsCreating(false);
      }
    } else {
      setSelectedInquiryId(null);
      setIsCreating(false);
    }
  }, [searchParams]);

  const filteredInquiries = useMemo(() => {
    return allInquiries.filter((item) => {
      const matchesSearch = item.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === "ALL" || item.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [allInquiries, searchQuery, filter]);

  const paginatedInquiries = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredInquiries.slice(start, end);
  }, [filteredInquiries, page, limit]);

  // Handlers
  const handleCardClick = (id: number) => router.push(`/inquiry?id=${id}`);
  const handleCreateClick = () => router.push("/inquiry?id=new");
  const handleBack = () => router.push("/inquiry");
  const handleSuccess = () => {
    fetchInquiries().then(() => router.push("/inquiry"));
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  // --- Render: Main List View ---
  const renderList = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
      {/* Header Area */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-red-600 via-zinc-900 to-zinc-950 pointer-events-none" />

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase flex items-center gap-3 justify-center md:justify-start">
              <span className="text-red-500">RING</span> SIDE
              <span className="text-zinc-600 dark:text-zinc-700 text-2xl not-italic font-bold tracking-normal align-middle">
                Inquiry Center
              </span>
            </h1>
            <p className="text-zinc-400 font-medium max-w-lg mx-auto md:mx-0">
              링 위에서 펼쳐지는 치열한 승부처럼, 당신의 궁금증을 확실하게 해결해 드립니다.
              <br className="hidden md:block" />
              <span className="text-red-500 font-bold">ROUND 2</span> 공식 팩트체크 및 지원 센터
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
            <div className="flex items-center gap-4 bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50 backdrop-blur-sm">
              <div className="text-center px-4 border-r border-zinc-700">
                <div className="text-2xl font-black text-white">{filteredInquiries.length}</div>
                <div className="text-xs text-zinc-500 font-bold uppercase">Total Matches</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-black text-blue-500">
                  {allInquiries.filter((i) => i.status === "SUBMITTED").length}
                </div>
                <div className="text-xs text-zinc-500 font-bold uppercase">Waiting</div>
              </div>
              <div className="text-center px-4 border-l border-zinc-700">
                <div className="text-2xl font-black text-red-500">
                  {allInquiries.filter((i) => i.status === "ANSWERED").length}
                </div>
                <div className="text-xs text-zinc-500 font-bold uppercase">Complete</div>
              </div>
            </div>

            <button
              onClick={handleCreateClick}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black italic uppercase text-lg tracking-wider rounded-xl shadow-lg shadow-red-600/20 hover:shadow-red-500/40 transition-all transform hover:-translate-y-1 active:translate-y-0 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Plus className="w-6 h-6" strokeWidth={3} />
                Start New Round
              </span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
            </button>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-20 bg-background/80 backdrop-blur-xl p-4 rounded-2xl border border-border/50 shadow-sm">
        {/* Filter Tabs - Pill Style */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
          {(["ALL", "SUBMITTED", "ANSWERED"] as const).map((key) => {
            const label = key === "ALL" ? "ALL MATCHES" : key === "SUBMITTED" ? "ROUND 1 (대기)" : "DECISION (완료)";
            const isActive = filter === key;

            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all duration-300",
                  isActive
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-md transform scale-105"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative group w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
          <input
            type="text"
            placeholder="Search Fight Cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl focus:border-red-500 focus:ring-0 transition-all outline-none font-medium placeholder:text-zinc-400 dark:text-white"
          />
        </div>
      </div>

      {/* Content Grid/List */}
      {paginatedInquiries.length === 0 ? (
        <div className="border-4 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-20 text-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl grayscale opacity-50">
            🥊
          </div>
          <h3 className="text-2xl font-black italic text-zinc-900 dark:text-white mb-2 uppercase">No Matches Found</h3>
          <p className="text-zinc-500 font-medium">새로운 문의를 등록하여 첫 번째 라운드를 시작하세요!</p>
        </div>
      ) : (
        <div className={cn("grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3")}>
          {paginatedInquiries.map((inquiry, index) => {
            const isAnswered = inquiry.status === "ANSWERED";
            return (
              <motion.div
                key={inquiry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleCardClick(inquiry.id)}
                className="group relative cursor-pointer"
              >
                <div
                  className={cn(
                    "relative overflow-hidden rounded-2xl border-2 transition-all duration-300 h-full flex flex-col",
                    "bg-white dark:bg-zinc-900",
                    isAnswered
                      ? "border-red-500/20 hover:border-red-500 dark:border-red-900/30 dark:hover:border-red-600 hover:shadow-xl hover:shadow-red-500/10"
                      : "border-blue-500/20 hover:border-blue-500 dark:border-blue-900/30 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10"
                  )}
                >
                  {/* Card Header Status */}
                  <div
                    className={cn(
                      "px-5 py-3 flex items-center justify-between border-b-2",
                      isAnswered
                        ? "bg-red-50/50 dark:bg-red-950/20 border-red-500/10"
                        : "bg-blue-50/50 dark:bg-blue-950/20 border-blue-500/10"
                    )}
                  >
                    <span className="font-black italic text-lg text-zinc-300 dark:text-zinc-700 select-none">
                      #{inquiry.id}
                    </span>
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border",
                        isAnswered
                          ? "bg-red-500 text-white border-red-600 shadow-sm"
                          : "bg-blue-500 text-white border-blue-600 shadow-sm"
                      )}
                    >
                      {isAnswered ? "DECISION" : "ROUND 1"}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:underline decoration-2 underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700">
                      {inquiry.subject}
                    </h3>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </div>
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                          isAnswered
                            ? "bg-red-100 dark:bg-red-900/20 text-red-600"
                            : "bg-blue-100 dark:bg-blue-900/20 text-blue-600"
                        )}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filteredInquiries.length > limit && (
        <div className="flex justify-center pt-8 pb-12">
          <ClientPaginationControls
            currentPage={page}
            totalPages={Math.ceil(filteredInquiries.length / limit)}
            onPageChange={setPage}
          />
        </div>
      )}
    </motion.div>
  );

  return (
    <main className="container mx-auto max-w-7xl min-h-[calc(100vh-6rem)] p-4 md:p-8">
      <AnimatePresence mode="wait">
        {selectedInquiryId ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="h-full"
          >
            <InquiryDetail inquiryId={selectedInquiryId} onBack={handleBack} />
          </motion.div>
        ) : isCreating ? (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="max-w-4xl mx-auto"
          >
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" /> Back to Ring
              </button>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800 mx-4" />
              <span className="text-xs font-black uppercase text-zinc-300 dark:text-zinc-700">New Challenger</span>
            </div>
            <InquiryForm onSuccess={handleSuccess} />
          </motion.div>
        ) : (
          renderList()
        )}
      </AnimatePresence>
    </main>
  );
}
