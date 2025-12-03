'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getInquiryDetail, downloadInquiryAttachment } from '@/lib/api/inquiry';
import { Inquiry } from '@/lib/types/inquiry';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import ErrorMessage from '@/app/components/common/ErrorMessage';
import { Button } from '@/app/components/common/Button';
import { DownloadCloud, Loader2, MessageSquare, CornerDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InquiryDetailProps {
  inquiryId: number;
}

const StatusBadge = ({ status }: { status: Inquiry['status'] }) => {
    const statusMap = {
      SUBMITTED: { text: '답변 대기', className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
      ANSWERED: { text: '답변 완료', className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
      CLOSED: { text: '종료됨', className: 'bg-secondary text-muted-foreground' },
    };
    const currentStatus = statusMap[status] || statusMap.CLOSED;
    return (
      <span className={cn('px-2.5 py-1 text-xs font-semibold rounded-full', currentStatus.className)}>
        {currentStatus.text}
      </span>
    );
};

export default function InquiryDetail({ inquiryId }: InquiryDetailProps) {
  const { token, logout } = useAuth();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!token || !inquiryId) return;

    setIsLoading(true);
    setError(null);
    try {
      const fetchedDetail = await getInquiryDetail(token, inquiryId);
      setInquiry(fetchedDetail);
    } catch (err: any) {
      if (String(err.message).includes("401") || String(err.message).includes("Unauthorized")) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        logout();
      } else {
        setError(err.message || "문의 상세 정보를 불러오는데 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, inquiryId, logout]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

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
    } catch (err) {
      console.error("Download failed:", err);
      setError("파일 다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="p-8"><ErrorMessage message={error} /></div>;
  }

  if (!inquiry) {
    return <div className="p-8"><ErrorMessage message="문의 정보를 찾을 수 없습니다." /></div>;
  }

  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto">
      <header className="pb-4 mb-6 border-b border-border">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">{inquiry.subject}</h2>
            <StatusBadge status={inquiry.status} />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {new Date(inquiry.created_at).toLocaleString('ko-KR')}
        </p>
      </header>

      <div className="space-y-8">
        {/* User's Question */}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-lg">Q</div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground mb-2">내 문의 내용</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none bg-background p-4 border border-border rounded-lg">
                <p className="whitespace-pre-wrap">{inquiry.content}</p>
            </div>
            {inquiry.file_path && (
                <div className="mt-4">
                    <h4 className="font-semibold text-muted-foreground text-sm mb-2">첨부 파일</h4>
                    <Button onClick={handleDownload} disabled={isDownloading} variant="outline" size="sm">
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DownloadCloud className="mr-2 h-4 w-4" />}
                        {isDownloading ? '다운로드 중...' : (inquiry.file_originalname || '파일 다운로드')}
                    </Button>
                </div>
            )}
          </div>
        </div>

        {/* Admin's Answer */}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">A</div>
          <div className="flex-1">
             <h3 className="font-bold text-foreground mb-2">운영자 답변</h3>
            {inquiry.reply ? (
                <div className="prose prose-sm dark:prose-invert max-w-none bg-background p-4 border border-border rounded-lg">
                    <p className="whitespace-pre-wrap">{inquiry.reply.content}</p>
                    <p className="text-xs text-muted-foreground mt-4 text-right">
                        답변 일시: {new Date(inquiry.reply.created_at).toLocaleString('ko-KR')}
                    </p>
                </div>
            ) : (
                <div className="bg-background p-4 border-2 border-dashed border-border rounded-lg text-center">
                    <p className="text-muted-foreground">아직 답변이 등록되지 않았습니다.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

