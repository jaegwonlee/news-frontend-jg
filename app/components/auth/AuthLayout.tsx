// app/components/auth/AuthLayout.tsx

import React from 'react';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  variant?: 'default' | 'gloves';
}

/**
 * A simplified layout for authentication pages.
 * The original 'punching bag' style has been replaced with a standard card layout
 * to ensure consistency with the new semantic color system.
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, variant = 'default' }) => {
  return (
    <div className="h-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Optional: Decorative elements can be added back here using theme-friendly colors */}
      {variant === 'gloves' && (
        <>
          <div className="absolute top-[50%] -translate-y-1/2 left-0 opacity-20 -translate-x-1/4">
            <Image src="/avatars/blue--glove.svg" alt="Blue Glove" width={300} height={300} />
          </div>
          <div className="absolute top-[50%] -translate-y-1/2 right-0 opacity-20 translate-x-1/4">
            <Image src="/avatars/red--glove.svg" alt="Red Glove" width={300} height={300} />
          </div>
        </>
      )}

      <div className="relative z-10 w-full max-w-sm">
        {/* Main Content Card */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-xl p-8 space-y-6">
            <h1 className="text-3xl font-bold text-center text-foreground tracking-wider">
              {title}
            </h1>
            {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;