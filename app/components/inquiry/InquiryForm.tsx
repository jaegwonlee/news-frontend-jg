'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getPresignedUrl, uploadFileToS3, submitInquiry } from '@/lib/api/inquiry';
import ErrorMessage from '@/app/components/common/ErrorMessage';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { Button } from '@/app/components/common/Button';
import { Paperclip, X, Loader2 } from 'lucide-react';

interface InquiryFormProps {
  onSuccess: () => void;
}

const InquiryForm: React.FC<InquiryFormProps> = ({ onSuccess }) => {
  const { token } = useAuth();
  
  // Form state
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [privacyAgreement, setPrivacyAgreement] = useState(false);
  
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // General state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('첨부 파일은 10MB를 초과할 수 없습니다.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (!token) throw new Error('인증 토큰이 없습니다.');

      const { url, filePath } = await getPresignedUrl(token, selectedFile.name, selectedFile.type);
      
      // Using XMLHttpRequest to monitor progress, as fetch doesn't support it directly
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', selectedFile.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadedFilePath(filePath);
        } else {
          throw new Error(`파일 업로드 실패: ${xhr.statusText}`);
        }
        setIsUploading(false);
      };

      xhr.onerror = () => {
        setError('파일 업로드 중 네트워크 오류가 발생했습니다.');
        setIsUploading(false);
      };

      xhr.send(selectedFile);

    } catch (err: any) {
      setError(err.message || '파일 업로드 준비 중 오류가 발생했습니다.');
      setIsUploading(false);
      setFile(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadedFilePath(null);
    setUploadProgress(0);
    setIsUploading(false);
    // Reset file input
    const fileInput = document.getElementById('attachment') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!privacyAgreement) {
      setError('개인정보 수집 및 이용에 동의해야 합니다.');
      return;
    }
    if (!subject.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      if (!token) throw new Error('인증 토큰이 없습니다.');
      
      await submitInquiry(
        token,
        subject,
        content,
        privacyAgreement,
        uploadedFilePath
      );
      
      // Reset form on success
      setSubject('');
      setContent('');
      setPrivacyAgreement(false);
      handleRemoveFile();

      onSuccess(); // Notify parent component
    } catch (err: any) {
      setError(err.message || '문의 제출 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-foreground mb-6">새 문의 작성</h2>
      <form onSubmit={handleSubmit} className="space-y-6 flex-grow flex flex-col">
        <div className="space-y-4 flex-grow">
          <div>
            <label htmlFor="inquirySubject" className="block text-sm font-medium text-muted-foreground">제목</label>
            <input
              id="inquirySubject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full rounded-md border-border bg-input text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="inquiryContent" className="block text-sm font-medium text-muted-foreground">내용</label>
            <textarea
              id="inquiryContent"
              rows={8}
              className="mt-1 w-full p-3 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">첨부 파일 (선택, 최대 10MB)</label>
            {!file && (
              <label htmlFor="attachment" className="relative cursor-pointer bg-input border-2 border-dashed border-border rounded-lg p-6 flex flex-col justify-center items-center hover:border-primary transition-colors">
                <Paperclip className="w-8 h-8 text-muted-foreground"/>
                <span className="mt-2 text-sm text-muted-foreground">파일을 끌어다 놓거나 클릭하여 업로드</span>
                <input
                  id="attachment"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            )}
            {file && (
              <div className="w-full bg-input border border-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Paperclip className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{file.name}</span>
                  </div>
                  <button onClick={handleRemoveFile} type="button" disabled={isUploading} className="p-1 rounded-full hover:bg-muted disabled:opacity-50">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {isUploading && (
                  <div className="mt-2">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="privacyAgreement"
              checked={privacyAgreement}
              onChange={(e) => setPrivacyAgreement(e.target.checked)}
              className="h-4 w-4 text-primary rounded border-border bg-input focus:ring-primary"
              required
            />
            <label htmlFor="privacyAgreement" className="ml-2 block text-sm text-muted-foreground">
              <span className="text-primary cursor-pointer hover:underline">개인정보 수집 및 이용</span>에 동의합니다.
            </label>
          </div>

          {error && <ErrorMessage message={error} />}
          
          <Button type="submit" disabled={isLoading || isUploading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? '제출 중...' : (isUploading ? '파일 업로드 중...' : '문의 제출')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InquiryForm;