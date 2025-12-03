'use client';

import React from 'react';
import { Inquiry } from '@/lib/types/inquiry';
import { Button } from '@/app/components/common/Button';
import { PlusCircle, Inbox } from 'lucide-react';
import ClientPaginationControls from '@/app/components/common/ClientPaginationControls';
import { cn } from '@/lib/utils';

interface InquirySidebarProps {
  inquiries: Inquiry[];
  total: number;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
}

const StatusBadge = ({ status }: { status: Inquiry['status'] }) => {
  const statusMap = {
    SUBMITTED: { text: '답변 대기', className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
    ANSWERED: { text: '답변 완료', className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
    CLOSED: { text: '종료됨', className: 'bg-secondary text-muted-foreground' },
  };
  const currentStatus = statusMap[status] || statusMap.CLOSED;
  return (
    <span className={cn('px-2 py-0.5 text-xs font-semibold rounded-full', currentStatus.className)}>
      {currentStatus.text}
    </span>
  );
};

export default function InquirySidebar({
  inquiries,
  total,
  page,
  setPage,
  limit,
  selectedId,
  onSelect,
  onNew,
}: InquirySidebarProps) {

  return (
    <div className="bg-card h-full flex flex-col border-r border-border">
      <div className="p-4 border-b border-border">
        <Button onClick={onNew} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          새 문의 작성
        </Button>
      </div>

      {inquiries.length === 0 ? (
         <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
            <Inbox className="w-16 h-16 text-muted-foreground/30" />
            <p className="mt-4 font-semibold">문의 내역이 없습니다</p>
            <p className="text-sm text-muted-foreground">새로운 문의를 작성해보세요.</p>
         </div>
      ) : (
        <div className="flex-grow overflow-y-auto">
          <ul className="divide-y divide-border">
            {inquiries.map((inquiry) => (
              <li
                key={inquiry.id}
                className={cn(
                  'p-4 cursor-pointer hover:bg-accent transition-colors',
                  selectedId === inquiry.id && 'bg-accent'
                )}
                onClick={() => onSelect(inquiry.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-foreground pr-2 truncate">{inquiry.subject}</h3>
                  <StatusBadge status={inquiry.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(inquiry.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {total > limit && (
        <div className="p-4 border-t border-border">
          <ClientPaginationControls
            currentPage={page}
            totalPages={Math.ceil(total / limit)}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}