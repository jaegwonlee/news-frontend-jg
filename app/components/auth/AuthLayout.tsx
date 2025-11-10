// app/components/auth/AuthLayout.tsx

import React from 'react';
import Image from 'next/image';


interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  variant?: 'default' | 'gloves';
}

/**
 * 로그인 페이지를 위한 "펀칭백" 스타일 레이아웃
 * - variant="gloves"일 때 복싱 글러브 애니메이션을 포함합니다.
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, variant = 'default' }) => {
  return (
    <div className="min-h-screen bg-black text-white flex items-start justify-center p-4 pt-10 relative overflow-hidden">
      {/* Spotlight Effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-radial-gradient-t from-neutral-900 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-full h-full bg-radial-gradient-b from-transparent to-neutral-900 opacity-50"></div>

      {variant === 'gloves' && (
        <>
          <div className="absolute top-[45%] md:top-[35%] -translate-y-1/2 left-0 animate-clash-left">
            <Image src="/avatars/blue--glove.svg" alt="Blue Glove" width={200} height={200} className="md:w-[300px] md:h-[300px]" />
          </div>
          <div className="absolute top-[45%] md:top-[35%] -translate-y-1/2 right-0 animate-clash-right">
            <Image src="/avatars/red--glove.svg" alt="Red Glove" width={200} height={200} className="md:w-[300px] md:h-[300px]" />
          </div>
        </>
      )}

      <div className="relative z-10 mt-20 md:mt-40">
        {/* Punching Bag Straps */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full flex gap-4">
            <div className="punching-bag-strap w-4 h-20 rounded-t-lg"></div>
            <div className="punching-bag-strap w-4 h-24 rounded-t-lg"></div>
            <div className="punching-bag-strap w-4 h-20 rounded-t-lg"></div>
        </div>

        {/* Main Bag Body */}
        <div className="relative w-full max-w-[240px] md:max-w-[320px] lg:max-w-[360px]">
            {/* Surface and Caps */}
            <div className="absolute inset-0 punching-bag-surface rounded-[4rem] shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-20 bg-black/20 rounded-t-[4rem] border-b-2 border-black/40"></div>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/20 rounded-b-[4rem] border-t-2 border-black/40"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 py-10 space-y-4">
                <h1 className="text-3xl font-bold text-center text-white tracking-wider drop-shadow-lg">
                  {title}
                </h1>
                {children}
            </div>
        </div>
      </div>

      {/* 스타일은 globals.css에 추가하거나 여기에 <style jsx global>을 유지합니다. */}
      <style jsx global>{`
        @keyframes clash-left {
          0%, 100% { transform: translateX(-25vw) rotate(-25deg); opacity: 0; }
          30% { transform: translateX(26vw) rotate(10deg); opacity: 1; }
          45% { transform: translateX(24vw) rotate(5deg); }
          60% { transform: translateX(26vw) rotate(10deg); }
        }
        @keyframes clash-right {
          0%, 100% { transform: translateX(25vw) rotate(25deg); opacity: 0; }
          30% { transform: translateX(-26vw) rotate(-10deg); opacity: 1; }
          45% { transform: translateX(-24vw) rotate(-5deg); }
          60% { transform: translateX(-26vw) rotate(-10deg); }
        }
        .animate-clash-left {
          animation: clash-left 4s ease-in-out infinite;
        }
        .animate-clash-right {
          animation: clash-right 4s ease-in-out infinite;
          animation-delay: 0.1s;
        }
        .bg-radial-gradient-t {
            background-image: radial-gradient(at top, var(--tw-gradient-stops));
        }
        .bg-radial-gradient-b {
            background-image: radial-gradient(at bottom, var(--tw-gradient-stops));
        }
        .punching-bag-surface {
            background:
                radial-gradient(ellipse at top, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%),
                linear-gradient(to right, #181818 0%, #333 50%, #181818 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.7), inset 0 0 15px rgba(0,0,0,0.5);
        }
        .punching-bag-strap {
            background: linear-gradient(to right, #4a4a4a, #6a6a6a, #4a4a4a);
            border: 1px solid #333;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;