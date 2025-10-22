'use client';

import React from 'react';

interface StyledArticleTitleProps {
  title: string;
  className?: string;
}

const StyledArticleTitle: React.FC<StyledArticleTitleProps> = ({ title, className }) => {
  const renderStyledTitle = () => {
    if (title.startsWith('[속보]')) {
      return (
        <>
          <span className="text-red-500 font-bold">[속보]</span>
          <span>{title.substring(4)}</span>
        </>
      );
    }
    if (title.startsWith('[단독]')) {
      return (
        <>
          <span className="text-blue-500 font-bold">[단독]</span>
          <span>{title.substring(4)}</span>
        </>
      );
    }
    return title;
  };

  return <div className={className}>{renderStyledTitle()}</div>;
};

export default StyledArticleTitle;
