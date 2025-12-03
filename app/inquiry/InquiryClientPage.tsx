'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getInquiries } from '@/lib/api/inquiry';
import { Inquiry } from '@/lib/types/inquiry';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import ErrorMessage from '@/app/components/common/ErrorMessage';
import { useRouter, useSearchParams } from 'next/navigation';
import InquirySidebar from '@/app/components/inquiry/InquirySidebar';
import InquiryDetail from '@/app/components/inquiry/InquiryDetail';
import InquiryForm from '@/app/components/inquiry/InquiryForm';


export default function InquiryClientPage() {
    const { token, isInitialized } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Component State
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [totalInquiries, setTotalInquiries] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // View State
    const [view, setView] = useState<'DETAIL' | 'NEW'>('DETAIL');
    const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
    
    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10; // Inquiries per page

    const fetchInquiries = useCallback(async () => {
        if (!token) return;
        // Don't set loading to true here to avoid flashing on refetch
        // setIsLoading(true); 
        setError(null);
        try {
            const { inquiries: fetchedInquiries, total } = await getInquiries(token, page, limit);
            setInquiries(fetchedInquiries);
            setTotalInquiries(total);
        } catch (err: any) {
            setError(err.message || '문의 내역을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [token, page, limit]);

    useEffect(() => {
        if (isInitialized) {
            if (token) {
                setIsLoading(true);
                fetchInquiries();
            } else {
                router.push('/login');
            }
        }
    }, [isInitialized, token, router]); // remove fetchInquiries from deps

    useEffect(() => {
        fetchInquiries();
    }, [page, fetchInquiries]);
    
    useEffect(() => {
        const idFromParams = searchParams.get('id');
        if (idFromParams === 'new') {
            setView('NEW');
            setSelectedInquiryId(null);
        } else if (idFromParams) {
            const numericId = parseInt(idFromParams, 10);
            if (!isNaN(numericId)) {
                setView('DETAIL');
                setSelectedInquiryId(numericId);
            }
        } else if (inquiries.length > 0 && view !== 'NEW') {
             // Default to showing the first inquiry if none is selected via URL
            if (!selectedInquiryId && inquiries[0]) {
                router.replace(`/inquiry?id=${inquiries[0].id}`);
            }
        }
    }, [searchParams, inquiries, router, view, selectedInquiryId]);


    const handleSelectInquiry = (id: number) => {
        router.push(`/inquiry?id=${id}`);
    };

    const handleNewInquiry = () => {
        router.push('/inquiry?id=new');
    };

    const handleInquirySubmitted = () => {
        setPage(1); 
        setIsLoading(true);
        fetchInquiries().then(() => {
            router.push('/inquiry');
        });
    };
    
    if (!isInitialized || isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    const renderMainPanel = () => {
        if (view === 'NEW') {
            return <InquiryForm onSuccess={handleInquirySubmitted} />;
        }
        if (view === 'DETAIL' && selectedInquiryId) {
            return <InquiryDetail inquiryId={selectedInquiryId} />;
        }
        return (
            <div className="hidden md:flex flex-col items-center justify-center h-full text-center bg-card">
                <div className="p-8">
                    <h2 className="text-xl font-semibold text-foreground">문의 내역을 확인하세요</h2>
                    <p className="text-muted-foreground mt-2">왼쪽 목록에서 문의를 선택하거나 새 문의를 작성하세요.</p>
                </div>
            </div>
        );
    };

    return (
        <main className="container mx-auto my-8 max-w-7xl">
            <h1 className="text-3xl font-bold mb-8">고객 문의</h1>
            <div className="flex flex-col md:flex-row border border-border rounded-lg bg-card shadow-sm h-[calc(100vh-250px)]">
                <aside className="w-full md:w-1/3 xl:w-1/4">
                    <InquirySidebar
                        inquiries={inquiries}
                        total={totalInquiries}
                        page={page}
                        setPage={setPage}
                        limit={limit}
                        selectedId={selectedInquiryId}
                        onSelect={handleSelectInquiry}
                        onNew={handleNewInquiry}
                    />
                </aside>
                <section className="flex-1 bg-card">
                    {renderMainPanel()}
                </section>
            </div>
        </main>
    );
}