import { User } from "@/types";

export interface MockInquiry {
    id: number;
    subject: string;
    content: string;
    status: 'SUBMITTED' | 'ANSWERED' | 'CLOSED';
    created_at: string;
    updated_at: string;
    user_id: number; // Added user_id
    replies: MockInquiryReply[];
}

export interface MockInquiryReply {
    id: number;
    author: 'ADMIN' | 'USER';
    content: string;
    created_at: string;
}

export const mockInquiries: MockInquiry[] = [
    {
        id: 1,
        user_id: 123, // Dummy user_id
        subject: "로그인 관련 문의입니다.",
        content: "로그인이 되지 않아 불편합니다. 백엔드 문제라고 하는데 해결 가능한가요?",
        status: 'SUBMITTED', // Changed from PENDING
        created_at: "2025-11-20T10:00:00Z",
        updated_at: "2025-11-20T10:00:00Z",
        replies: []
    },
    {
        id: 2,
        user_id: 123, // Dummy user_id
        subject: "새로운 기능 제안합니다.",
        content: "채팅방에 이모지 기능을 추가하면 좋을 것 같습니다.",
        status: 'ANSWERED', // Changed from RESOLVED
        created_at: "2025-11-18T14:30:00Z",
        updated_at: "2025-11-19T09:00:00Z",
        replies: [
            {
                id: 101,
                author: 'ADMIN',
                content: "좋은 의견 감사합니다. 내부적으로 검토 후 반영 여부를 결정하겠습니다.",
                created_at: "2025-11-19T09:00:00Z",
            }
        ]
    },
    {
        id: 3,
        user_id: 123, // Dummy user_id
        subject: "오류 보고: 게시글 이미지 로드 안 됨",
        content: "특정 게시글의 이미지가 로드되지 않고 있습니다. 확인 부탁드립니다.",
        status: 'CLOSED',
        created_at: "2025-11-15T16:00:00Z",
        updated_at: "2025-11-16T11:00:00Z",
        replies: [
            {
                id: 102,
                author: 'ADMIN',
                content: "오류 확인 후 수정 완료되었습니다. 다시 확인 부탁드립니다.",
                created_at: "2025-11-16T11:00:00Z",
            },
            {
                id: 103,
                author: 'USER',
                content: "네, 잘 됩니다. 감사합니다!",
                created_at: "2025-11-16T14:00:00Z",
            }
        ]
    },
];
