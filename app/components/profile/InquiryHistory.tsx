"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getInquiries, Inquiry } from '@/lib/api/inquiry';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import ErrorMessage from '@/app/components/common/ErrorMessage';
import InquiryDetail from './InquiryDetail'; // Will create this component

export default function InquiryHistory() {
  const { token, logout } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);

  const fetchInquiries = useCallback(async () => {
    if (!token) {
      setError("로그인이 필요합니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const fetchedInquiries = await getInquiries(token);
      setInquiries(fetchedInquiries);
    } catch (err: any) {
      console.error("Failed to fetch inquiries:", err);
      if (String(err.message).includes("401") || String(err.message).includes("Unauthorized")) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        logout();
        // router.push("/login"); // No router here, handled by useAuth context or parent
      } else {
        setError(err.message || "문의 내역을 불러오는데 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

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

  if (selectedInquiryId) {
    return <InquiryDetail inquiryId={selectedInquiryId} onBack={() => setSelectedInquiryId(null)} />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-4">문의 내역</h2>
      {inquiries.length === 0 ? (
        <p className="text-zinc-400">제출된 문의가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {inquiries.map((inquiry) => (
            <li
              key={inquiry.id}
              className="bg-zinc-800 p-4 rounded-lg shadow border border-zinc-700 cursor-pointer hover:bg-zinc-700 transition-colors"
              onClick={() => setSelectedInquiryId(inquiry.id)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-lg font-semibold text-white">{inquiry.subject}</span>
                <span className={`text-sm font-medium ${
                  inquiry.status === 'SUBMITTED' ? 'text-yellow-500' :
                  inquiry.status === 'ANSWERED' ? 'text-green-500' :
                  'text-zinc-500'
                }`}>
                  {inquiry.status === 'SUBMITTED' ? '접수됨' :
                   inquiry.status === 'ANSWERED' ? '답변 완료' :
                   '종료됨'}
                </span>
              </div>
              <p className="text-sm text-zinc-400">제출일: {new Date(inquiry.created_at).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
