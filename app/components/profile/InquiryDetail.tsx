'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getInquiryDetail, downloadInquiryAttachment, Inquiry } from '@/lib/api/inquiry';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import ErrorMessage from '@/app/components/common/ErrorMessage';
import { DownloadCloud, Loader2 } from 'lucide-react';

interface InquiryDetailProps {
  inquiryId: number;
  onBack: () => void;
}

export default function InquiryDetail({ inquiryId, onBack }: InquiryDetailProps) {
  const { token, logout } = useAuth();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!token) {
        setError("로그인이 필요합니다.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const fetchedDetail = await getInquiryDetail(token, inquiryId);
        setInquiry(fetchedDetail);
      } catch (err: any) {
        console.error("Failed to fetch inquiry detail:", err);
        if (String(err.message).includes("401") || String(err.message).includes("Unauthorized")) {
          alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          logout();
        } else {
          setError(err.message || "문의 상세 정보를 불러오는데 실패했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [token, inquiryId, logout]);

  const handleDownload = async () => {
    if (!inquiry?.file_path || !token) return;

    setIsDownloading(true);
    try {
      const blob = await downloadInquiryAttachment(token, inquiry.file_path);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', inquiry.file_originalname || 'download');
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Download failed:", error);
      alert("파일 다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  const StatusBadge = ({ status }: { status: Inquiry['status'] }) => {
    const statusMap = {
      SUBMITTED: { text: '답변 대기중', className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
      ANSWERED: { text: '답변 완료', className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
      CLOSED: { text: '종료됨', className: 'bg-secondary text-muted-foreground' },
    };
    const currentStatus = statusMap[status] || statusMap.CLOSED;
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${currentStatus.className}`}>
        {currentStatus.text}
      </span>
    );
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!inquiry) {
    return <ErrorMessage message="문의 정보를 찾을 수 없습니다." />;
  }

  return (
    <div className="space-y-6">
        <div className="bg-background p-6 rounded-lg border border-border">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 pb-4 border-b border-border">
                <h3 className="text-xl font-semibold text-foreground">{inquiry.subject}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <StatusBadge status={inquiry.status} />
                    <span>{new Date(inquiry.created_at).toLocaleString()}</span>
                </div>
            </div>
            <div className="text-foreground/90 whitespace-pre-wrap mb-6 min-h-[100px]">
              {inquiry.content}
            </div>

            {inquiry.file_path && (
            <div className="mt-4">
                <h4 className="font-semibold text-muted-foreground mb-2">첨부 파일</h4>
                <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                {isDownloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <DownloadCloud className="w-4 h-4" />
                )}
                {isDownloading ? '다운로드 중...' : (inquiry.file_originalname || '파일 다운로드')}
                </button>
            </div>
            )}
        </div>

        {inquiry.reply && (
            <div className="bg-accent/50 p-6 rounded-lg border border-border">
                <h4 className="text-lg font-semibold text-foreground mb-3">운영자 답변</h4>
                <div className="text-foreground/90 whitespace-pre-wrap">
                {inquiry.reply.content}
                </div>
                {inquiry.reply.created_at && (
                <p className="text-xs text-muted-foreground mt-3 text-right">
                    {new Date(inquiry.reply.created_at).toLocaleString()}
                </p>
                )}
            </div>
        )}
    </div>
  );
}

