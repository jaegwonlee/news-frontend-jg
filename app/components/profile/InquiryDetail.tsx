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
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 text-sm font-semibold text-white bg-zinc-600 rounded-md hover:bg-zinc-700 transition-colors"
      >
        ← 목록으로 돌아가기
      </button>
      <h2 className="text-2xl font-bold text-white">문의 상세</h2>

      <div className="bg-zinc-800 p-6 rounded-lg shadow-inner border border-zinc-700">
        <h3 className="text-xl font-semibold text-white mb-2">{inquiry.subject}</h3>
        <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              inquiry.status === 'SUBMITTED' ? 'bg-yellow-600/30 text-yellow-300' :
              inquiry.status === 'ANSWERED' ? 'bg-green-600/30 text-green-300' :
              'bg-zinc-600/30 text-zinc-300'
            }`}>
            {inquiry.status === 'SUBMITTED' ? '답변 대기중' : inquiry.status === 'ANSWERED' ? '답변 완료' : '종료됨'}
          </span>
          <span>{new Date(inquiry.created_at).toLocaleString()}</span>
        </div>
        <div className="prose prose-invert prose-zinc max-w-none text-zinc-300 whitespace-pre-wrap mb-6">
          {inquiry.content}
        </div>

        {inquiry.file_path && (
          <div className="mt-4">
            <h4 className="font-semibold text-zinc-300 mb-2">첨부 파일</h4>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-zinc-500"
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

        {inquiry.reply && (
          <div className="mt-6 pt-6 border-t border-zinc-700">
            <h4 className="text-lg font-semibold text-red-400 mb-3">운영자 답변</h4>
            <div className="prose prose-invert prose-zinc max-w-none text-zinc-200 whitespace-pre-wrap">
              {inquiry.reply.content}
            </div>
            {inquiry.reply.created_at && (
              <p className="text-xs text-zinc-500 mt-3 text-right">
                {new Date(inquiry.reply.created_at).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
