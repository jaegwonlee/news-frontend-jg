'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getInquiries } from '@/lib/api/inquiry';
import { InquirySummary } from '@/lib/types/inquiry';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import ErrorMessage from '@/app/components/common/ErrorMessage';
import { useRouter, useSearchParams } from 'next/navigation';
import InquirySidebar from '@/app/components/inquiry/InquirySidebar';
import InquiryDetail from '@/app/components/inquiry/InquiryDetail';
import InquiryForm from '@/app/components/inquiry/InquiryForm';


export default function InquiryClientPage() {
    const { token, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Component State
    const [allInquiries, setAllInquiries] = useState<InquirySummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // View State
    const [view, setView] = useState<'DETAIL' | 'NEW' | 'LIST'>('LIST'); // Added 'LIST' view
    const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
    
    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10; // Inquiries per page

    const paginatedInquiries = useMemo(() => {
        const start = (page - 1) * limit;
        const end = start + limit;
        return allInquiries.slice(start, end);
    }, [allInquiries, page, limit]);

    const fetchInquiries = useCallback(async () => {
        if (!token) return;
        setIsLoading(true); // Set loading to true for initial fetch and refresh
        setError(null);
        try {
            const fetchedInquiries = await getInquiries(token);
            setAllInquiries(fetchedInquiries);
            // After fetching, if no ID is selected and not creating new, select first inquiry
            if (!selectedInquiryId && fetchedInquiries.length > 0 && view !== 'NEW') {
                router.replace(`/inquiry?id=${fetchedInquiries[0].id}`);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '문의 내역을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [token, router, selectedInquiryId, view]);

    useEffect(() => {
        if (!authLoading) { // authLoading becoming false indicates initialization is complete
            if (token) {
                fetchInquiries();
            } else {
                router.push('/login');
            }
        }
    }, [authLoading, token, router, fetchInquiries]);

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
            } else { // Handle invalid ID in URL
                setView('LIST');
                setSelectedInquiryId(null);
            }
        } else {
            setView('LIST'); // Default to list view if no 'id' param
            setSelectedInquiryId(null);
        }
    }, [searchParams]); // removed inquiries from dependency array to avoid loop

    const handleSelectInquiry = (id: number) => {
        router.push(`/inquiry?id=${id}`);
    };

    const handleNewInquiry = () => {
        router.push('/inquiry?id=new');
    };

    const handleInquirySubmitted = () => {
        setPage(1); 
        fetchInquiries().then(() => { // Refetch after submission
            router.push('/inquiry'); // Go back to list/first item
        });
    };
    
    if (authLoading || isLoading) {
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
            return <InquiryDetail inquiryId={selectedInquiryId} onBack={() => router.push('/inquiry')} />;
        }
        // If no inquiry is selected and not in NEW view, display a message or default to first
        if (view === 'LIST' && allInquiries.length > 0 && selectedInquiryId === null) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center bg-card">
                    <div className="p-8">
                        <h2 className="text-xl font-semibold text-foreground">문의 내역을 확인하세요</h2>
                        <p className="text-muted-foreground mt-2">왼쪽 목록에서 문의를 선택하세요.</p>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex flex-col items-center justify-center h-full text-center bg-card">
                <div className="p-8">
                    <h2 className="text-xl font-semibold text-foreground">환영합니다!</h2>
                    <p className="text-muted-foreground mt-2">새로운 문의를 작성하거나 왼쪽 목록에서 기존 문의를 확인하세요.</p>
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
                        inquiries={paginatedInquiries}
                        total={allInquiries.length} // Pass total length for pagination
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