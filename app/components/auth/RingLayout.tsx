// src/components/auth/RingLayout.tsx
import React from "react";

interface RingLayoutProps {
  children: React.ReactNode;
  title: string;
}

/**
 * 회원가입/로그인 페이지를 위한 "복싱 링" 스타일 레이아웃 컴포넌트
 * - 스포트라이트 배경 효과와 링 로프/코너 스타일을 적용합니다.
 */
const RingLayout: React.FC<RingLayoutProps> = ({ children, title }) => {
  // 스포트라이트 빔 각도 설정
  const spotlightAngles = [-50, -35, -20, 0, 20, 35, 50];

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* 스포트라이트 배경 효과 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-radial-glow from-[rgba(100,120,150,0.15)] to-transparent opacity-70"></div>
        {spotlightAngles.map((angle) => (
          <div
            key={angle}
            className="absolute top-0 left-1/2 w-48 h-[120%] bg-spotlight-beam"
            style={{
              transformOrigin: "top center",
              transform: `translateX(-50%) rotate(${angle}deg)`,
            }}
          />
        ))}
      </div>

      {/* 링 형태의 메인 컨테이너 */}
      <div className="w-full max-w-lg p-8 pt-12 space-y-6 bg-black rounded-lg shadow-2xl z-10 relative border-8 border-neutral-600">
        {/* 링 로프 (상단 빨강) */}
        <div className="absolute -top-4 left-0 w-full h-2 bg-red-500"></div>
        <div className="absolute -top-8 left-0 w-full h-2 bg-red-500"></div>
        {/* 링 로프 (하단 파랑) */}
        <div className="absolute -bottom-4 left-0 w-full h-2 bg-blue-500"></div>
        <div className="absolute -bottom-8 left-0 w-full h-2 bg-blue-500"></div>
        {/* 링 로프 (왼쪽 파랑) */}
        <div className="absolute top-0 -left-4 w-2 h-full bg-blue-500"></div>
        <div className="absolute top-0 -left-8 w-2 h-full bg-blue-500"></div>
        {/* 링 로프 (오른쪽 빨강) */}
        <div className="absolute top-0 -right-4 w-2 h-full bg-red-500"></div>
        <div className="absolute top-0 -right-8 w-2 h-full bg-red-500"></div>
        {/* 코너 포스트 (스크린샷 색상 기준) */}
        <div className="absolute -top-8 -left-8 w-16 h-16 bg-white"></div> {/* 좌상단 흰색 */}
        <div className="absolute -top-8 -right-8 w-16 h-16 bg-red-700"></div> {/* 우상단 빨강 */}
        <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-blue-700"></div> {/* 좌하단 파랑 */}
        <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-white"></div> {/* 우하단 흰색 */}
        {/* 내부 컨텐츠 영역 */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-center text-white tracking-wider mb-6">{title}</h1>
          {children} {/* 여기에 FormField 등이 포함된 form이 들어옵니다. */}
        </div>
      </div>

      {/* 조명 효과를 위한 전역 스타일 (Tailwind CSS로 처리하기 어려운 부분) */}
      <style jsx global>{`
        .bg-radial-glow {
          background-image: radial-gradient(ellipse 50% 40% at 50% 0%, var(--tw-gradient-stops));
        }
        .bg-spotlight-beam {
          background: linear-gradient(to bottom, rgba(200, 220, 255, 0.12), transparent 60%);
          filter: blur(8px);
        }
      `}</style>
    </div>
  );
};

export default RingLayout;
