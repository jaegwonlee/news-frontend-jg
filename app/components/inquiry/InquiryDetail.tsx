'use client';

import React, { useState, useEffect } from 'react';
import { DownloadCloud, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { getInquiryDetail } from '@/lib/api/inquiry';
import { InquiryDetail as InquiryDetailType, InquiryStatus } from '@/lib/types/inquiry';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import ErrorMessage from '@/app/components/common/ErrorMessage';
import { Button } from '@/app/components/common/Button';

import { cn } from '@/lib/utils';

interface InquiryDetailProps {
  inquiryId: number;
  onBack: () => void;
}

const StatusBadge = ({ status }: { status: InquiryStatus }) => {
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

export default function InquiryDetail({ inquiryId, onBack }: InquiryDetailProps) {
  const { token, logout } = useAuth();
  const [inquiry, setInquiry] = useState<InquiryDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!token || !inquiryId) return;

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
    // Simply open the URL in a new tab.
    window.open(inquiry.attachment_url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-48"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="p-8"><ErrorMessage message={error} /></div>;
  }

  if (!inquiry) {
    return <div className="p-8"><ErrorMessage message="문의 정보를 찾을 수 없습니다." /></div>;
  }

  return (
    <div className="p-6 sm:p-8 h-full">
      <header className="pb-4 mb-6 border-b border-border relative">
        <Button onClick={onBack} variant="ghost" size="icon" className="absolute -top-2 -left-2">
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pt-8 sm:pt-0 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-foreground flex-1">{inquiry.subject}</h2>
            <StatusBadge status={inquiry.status} />
        </div>
        <p className="text-sm text-muted-foreground mt-2 text-center sm:text-left">
          {new Date(inquiry.created_at).toLocaleString('ko-KR')}
        </p>
      </header>

      <div className="space-y-8">
        {/* User's Question */}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-lg flex-shrink-0">Q</div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground mb-2">내 문의 내용</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none bg-background p-4 border border-border rounded-lg">
                <p className="whitespace-pre-wrap">{inquiry.content}</p>
            </div>
            {inquiry.attachment_url && (
                <div className="mt-4">
                    <h4 className="font-semibold text-muted-foreground text-sm mb-2">첨부 파일</h4>
                    <Button onClick={handleDownload} variant="outline" size="sm">
                        <DownloadCloud className="mr-2 h-4 w-4" />
                        파일 다운로드
                    </Button>
                </div>
            )}
          </div>
        </div>

        {/* Admin's Answer */}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">A</div>
          <div className="flex-1">
             <h3 className="font-bold text-foreground mb-2">운영자 답변</h3>
            {inquiry.answer ? (
                <div className="prose prose-sm dark:prose-invert max-w-none bg-background p-4 border border-border rounded-lg">
                    <p className="whitespace-pre-wrap">{inquiry.answer.content}</p>
                    <p className="text-xs text-muted-foreground mt-4 text-right">
                        답변 일시: {new Date(inquiry.answer.created_at).toLocaleString('ko-KR')}
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

