"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getInquiryDetail, Inquiry } from '@/lib/api/inquiry';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import ErrorMessage from '@/app/components/common/ErrorMessage';

interface InquiryDetailProps {
  inquiryId: number;
  onBack: () => void;
}

export default function InquiryDetail({ inquiryId, onBack }: InquiryDetailProps) {
  const { token, logout } = useAuth();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

      <div className="bg-zinc-800 p-4 rounded-lg shadow border border-zinc-700">
        <p className="text-zinc-400 text-sm mb-1">주제</p>
        <p className="text-white text-lg font-semibold mb-4">{inquiry.subject}</p>

        <p className="text-zinc-400 text-sm mb-1">내용</p>
        <p className="text-white mb-4 whitespace-pre-wrap">{inquiry.content}</p>

        {inquiry.file_path && ( // Use file_path from API
          <div className="mb-4">
            <p className="text-zinc-400 text-sm mb-1">첨부 파일</p>
            <a
              href={inquiry.file_path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {inquiry.file_originalname || '첨부 파일 보기'} {/* Display original name if available */}
            </a>
          </div>
        )}

        <p className="text-zinc-400 text-sm mb-1">상태</p>
        <span className={`text-lg font-medium ${
          inquiry.status === 'SUBMITTED' ? 'text-yellow-500' :
          inquiry.status === 'ANSWERED' ? 'text-green-500' :
          'text-zinc-500'
        }`}>
          {inquiry.status === 'SUBMITTED' ? '접수됨' :
           inquiry.status === 'ANSWERED' ? '답변 완료' :
           '종료됨'}
        </span>

        {inquiry.reply && ( // Use inquiry.reply from API
          <div className="mt-4 pt-4 border-t border-zinc-600">
            <p className="text-zinc-400 text-sm mb-1">답변</p>
            <p className="text-white whitespace-pre-wrap">{inquiry.reply.content}</p>
            <p className="text-zinc-400 text-xs mt-2">답변일: {new Date(inquiry.reply.created_at).toLocaleString()}</p>
          </div>
        )}

        <p className="text-zinc-400 text-xs mt-4">제출일: {new Date(inquiry.created_at).toLocaleString()}</p>
        {inquiry.updated_at && inquiry.created_at !== inquiry.updated_at && (
          <p className="text-zinc-400 text-xs">최종 업데이트: {new Date(inquiry.updated_at).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}
