import React from "react";

interface RingLayoutProps {
  children: React.ReactNode;
  title: string;
}

const RingLayout: React.FC<RingLayoutProps> = ({ children, title }) => {
  // 스포트라이트 빔의 각도를 배열로 관리하여 여러 개를 쉽게 생성합니다.
  const spotlightAngles = [-50, -35, -20, 0, 20, 35, 50];

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* 여러 개의 스포트라이트 빔 효과 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* 전체적인 배경의 은은한 광원 효과 */}
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

      <div className="w-full max-w-2xl p-8 pt-12 space-y-6 bg-[#101010] rounded-lg shadow-2xl z-10 relative border-8 border-neutral-600">
        {/* Ring Ropes - Top (Red) */}
        <div className="absolute -top-4 left-0 w-full h-2 bg-red-500"></div>
        <div className="absolute -top-8 left-0 w-full h-2 bg-red-500"></div>

        {/* Ring Ropes - Bottom (Blue) */}
        <div className="absolute -bottom-4 left-0 w-full h-2 bg-blue-500"></div>
        <div className="absolute -bottom-8 left-0 w-full h-2 bg-blue-500"></div>

        {/* Ring Ropes - Left (Blue) */}
        <div className="absolute top-0 -left-4 w-2 h-full bg-blue-500"></div>
        <div className="absolute top-0 -left-8 w-2 h-full bg-blue-500"></div>

        {/* Ring Ropes - Right (Red) */}
        <div className="absolute top-0 -right-4 w-2 h-full bg-red-500"></div>
        <div className="absolute top-0 -right-8 w-2 h-full bg-red-500"></div>

        {/* Corner Posts */}
        <div className="absolute -top-8 -left-8 w-16 h-16 bg-white"></div>
        <div className="absolute -top-8 -right-8 w-16 h-16 bg-red-700"></div>
        <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-blue-700"></div>
        <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-white"></div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-center text-white tracking-wider mb-6">{title}</h1>
          {children}
        </div>
      </div>

      {/* 조명 효과를 위한 전역 스타일 */}
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
