"use client";

import { Button } from "@/app/components/common/Button";
import ErrorMessage from "@/app/components/common/ErrorMessage";
import { useAuth } from "@/app/context/AuthContext";
import { createInquiry } from "@/lib/api/inquiry";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileText, Loader2, UploadCloud, X } from "lucide-react";
import React, { useState } from "react";

interface InquiryFormProps {
  onSuccess: () => void;
}

const InquiryForm: React.FC<InquiryFormProps> = ({ onSuccess }) => {
  const { token } = useAuth();

  // Form state
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [privacyAgreement, setPrivacyAgreement] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // General state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false); // Local success state for animation

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("첨부 파일은 5MB를 초과할 수 없습니다.");
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    const fileInput = document.getElementById("attachment") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!privacyAgreement) {
      setError("개인정보 수집 및 이용에 동의해야 합니다.");
      return;
    }
    if (!subject.trim() || !content.trim()) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      if (!token) throw new Error("인증 토큰이 없습니다.");

      await createInquiry(token, subject, content, privacyAgreement, file);

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500); // Wait for success animation
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "문의 제출 중 오류가 발생했습니다.");
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-500 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mb-6 ring-4 ring-green-100 dark:ring-green-900/10">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black uppercase italic mb-2 tracking-tight">Registration Complete</h2>
        <p className="text-zinc-500 font-medium">
          링 위에 오를 준비가 완료되었습니다. <br /> 곧 담당 코치가 내용을 확인합니다.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-zinc-900 text-white p-8">
        <div className="absolute top-0 right-0 p-8 opacity-10 font-black text-8xl italic leading-none select-none pointer-events-none">
          VS
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <span className="text-red-600">NEW</span> CHALLENGE
          </h2>
          <p className="text-zinc-400 font-medium mt-1 max-w-md">
            정확한 사실 확인과 공정한 토론을 위한 문의를 등록해주세요.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
          {/* Subject */}
          <div className="space-y-3">
            <label htmlFor="inquirySubject" className="text-sm font-black uppercase tracking-wider text-zinc-400">
              Title / Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="inquirySubject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="문의 제목을 입력하세요 (ex. 토픽 주제 제안, 시스템 오류 제보)"
              className="w-full px-5 py-4 text-lg font-bold rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 focus:border-black dark:focus:border-white transition-all outline-none placeholder:text-zinc-400"
              required
              disabled={isLoading}
            />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <label htmlFor="inquiryContent" className="text-sm font-black uppercase tracking-wider text-zinc-400">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                id="inquiryContent"
                rows={10}
                className="w-full px-5 py-4 text-base font-medium rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 focus:border-black dark:focus:border-white transition-all resize-none outline-none leading-relaxed placeholder:text-zinc-400"
                placeholder="상세 내용을 작성해주세요."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={isLoading}
              ></textarea>
              <div className="absolute bottom-4 right-4 text-xs font-bold text-zinc-400 pointer-events-none bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                Markdown Supported
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <label className="text-sm font-black uppercase tracking-wider text-zinc-400">Evidence (Optional)</label>

            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  key="dropzone"
                >
                  <label
                    htmlFor="attachment"
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={cn(
                      "relative cursor-pointer group flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 transition-all duration-200 hover:border-black dark:hover:border-white hover:bg-zinc-50 dark:hover:bg-zinc-800",
                      isDragOver && "border-red-500 bg-red-50 dark:bg-red-900/10 scale-[1.01]"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-black dark:group-hover:text-white mb-2 transition-colors" />
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 font-bold">Click or Drag to Upload</p>
                      <p className="text-xs text-zinc-400 mt-1">Max 5MB</p>
                    </div>
                    <input
                      id="attachment"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                  </label>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key="file-preview"
                  className="flex items-center justify-between w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold truncate pr-4 text-zinc-900 dark:text-zinc-100">
                        {file.name}
                      </span>
                      <span className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    type="button"
                    disabled={isLoading}
                    className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Privacy Checkbox - Styled as Agreement */}
          <div className="pt-6 border-t border-dashed border-zinc-200 dark:border-zinc-700">
            <label className="flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
              <div className="relative flex items-center h-5 mt-0.5">
                <input
                  type="checkbox"
                  checked={privacyAgreement}
                  onChange={(e) => setPrivacyAgreement(e.target.checked)}
                  className="peer h-5 w-5 shrink-0 rounded border-2 border-zinc-300 dark:border-zinc-600 focus:ring-0 checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white transition-all appearance-none"
                  required
                />
                <CheckCircle2
                  className="pointer-events-none absolute h-3.5 w-3.5 top-[3px] left-[3px] text-white dark:text-black opacity-0 peer-checked:opacity-100 transition-opacity"
                  strokeWidth={3}
                />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                  개인정보 수집 및 이용 동의
                </span>
                <p className="text-xs text-zinc-500">
                  문의 처리를 위해 최소한의 정보를 수집합니다. 동의하지 않을 경우 서비스 이용이 제한될 수 있습니다.
                </p>
              </div>
            </label>
          </div>

          {/* Error & Actions */}
          <div className="space-y-4 pt-4">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <ErrorMessage message={error} />
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-black italic uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-600/20 transition-all active:scale-[0.98] rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Inquiry"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InquiryForm;
