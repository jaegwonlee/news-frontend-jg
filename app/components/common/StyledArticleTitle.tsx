'use client';

import React from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

interface StyledArticleTitleProps {
  title: string;
  className?: string;
}

/**
 * 기사 제목에 [속보], [단독]이 있을 경우 색상을 적용하는 컴포넌트
 */
const StyledArticleTitle: React.FC<StyledArticleTitleProps> = ({ title, className }) => {
  const renderStyledTitle = () => {
    if (title.startsWith('[속보]')) {
      return (
        <>
          {/* [속보]는 빨간색으로 표시 */}
          <span className="text-red-500 font-bold">[속보]</span>
          <span>{title.substring(4)}</span>
        </>
      );
    }
    if (title.startsWith('[단독]')) {
      return (
        <>
          {/* [단독]은 파란색으로 표시 */}
          <span className="text-blue-500 font-bold">[단독]</span>
          <span>{title.substring(4)}</span>
        </>
      );
    }
    return title;
  };

  return (
    <div 
      className={className}
      data-tooltip-id="article-title-tooltip"
      data-tooltip-content={title}
    >
      <Tooltip id="article-title-tooltip" />
      {renderStyledTitle()}
    </div>
  );
};

export default StyledArticleTitle;