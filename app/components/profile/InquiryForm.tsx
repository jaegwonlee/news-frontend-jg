"use client";

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { submitInquiry } from '@/lib/api'; // This function will be created
import FormField from '@/app/components/auth/FormField'; // Reusing existing FormField

const InquiryForm: React.FC = () => {
  const { token } = useAuth();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [privacyAgreement, setPrivacyAgreement] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);

    if (!privacyAgreement) {
      setMessage('개인정보 수집 및 동의에 동의해야 합니다.');
      setIsError(true);
      return;
    }
    if (!subject.trim() || !content.trim()) {
      setMessage('주제와 내용을 입력해주세요.');
      setIsError(true);
      return;
    }

    setIsLoading(true);
    try {
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 로그인해주세요.');
      }
      
      const response = await submitInquiry(
        token,
        subject,
        content,
        privacyAgreement,
        attachment
      );
      setMessage(response.message || '문의가 성공적으로 제출되었습니다.');
      setSubject('');
      setContent('');
      setPrivacyAgreement(false);
      setAttachment(null);
      (document.getElementById('attachment') as HTMLInputElement).value = ''; // Clear file input
    } catch (err: any) {
      setIsError(true);
      setMessage(err.message || '문의 제출 중 오류가 발생했습니다.');
      console.error('Inquiry submission failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage('첨부 파일은 5MB를 초과할 수 없습니다.');
        setIsError(true);
        setAttachment(null);
        e.target.value = ''; // Clear selected file
        return;
      }
      setAttachment(file);
      setIsError(false);
    } else {
      setAttachment(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">문의하기</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          id="inquirySubject"
          label="주제"
          type="text"
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <div>
          <label htmlFor="inquiryContent" className="block text-sm font-medium text-zinc-400 mb-2">내용</label>
          <textarea
            id="inquiryContent"
            rows={5}
            className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="attachment" className="block text-sm font-medium text-zinc-400 mb-2">첨부 파일 (선택 사항, 최대 5MB)</label>
          <input
            id="attachment"
            type="file"
            className="w-full text-zinc-400 border border-zinc-700 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="privacyAgreement"
            checked={privacyAgreement}
            onChange={(e) => setPrivacyAgreement(e.target.checked)}
            className="form-checkbox h-4 w-4 text-red-500 rounded border-zinc-600 focus:ring-red-500 bg-zinc-800"
            required
          />
          <label htmlFor="privacyAgreement" className="ml-2 text-sm text-zinc-400">
            개인정보 수집 및 이용에 동의합니다.
          </label>
        </div>
        {message && (
          <div className={`p-3 rounded-md ${isError ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
            {message}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-neutral-600 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? '제출 중...' : '문의 제출'}
        </button>
      </form>
    </div>
  );
};

export default InquiryForm;