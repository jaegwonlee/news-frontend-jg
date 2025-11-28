"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const keywordsData = [
  { text: '#윤석열', size: 'text-lg', color: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  { text: '#이재명', size: 'text-base', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  { text: '#탄핵', size: 'text-xl', color: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' },
  { text: '#의대증원', size: 'text-lg', color: 'bg-green-500/10 text-green-400 border border-green-500/20' },
  { text: '#총선', size: 'text-base', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
  { text: '#국민의힘', size: 'text-sm', color: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  { text: '#더불어민주당', size: 'text-sm', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  { text: '#제3지대', size: 'text-base', color: 'bg-muted/10 text-muted-foreground border border-border/20' },
  { text: '#금리인하', size: 'text-lg', color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' },
  { text: '#부동산', size: 'text-base', color: 'bg-teal-500/10 text-teal-400 border border-teal-500/20' },
];

interface KeywordState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  data: typeof keywordsData[0];
}

export default function FloatingKeywords() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [keywords, setKeywords] = useState<KeywordState[]>([]);
  const keywordRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initialKeywords: KeywordState[] = keywordsData.map((data, i) => {
      const el = keywordRefs.current[i];
      const width = el?.offsetWidth || 100;
      const height = el?.offsetHeight || 40;
      return {
        id: i,
        x: Math.random() * (container.clientWidth - width),
        y: Math.random() * (container.clientHeight - height),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        width,
        height,
        data,
      };
    });
    setKeywords(initialKeywords);
  }, []);

  useEffect(() => {
    const animationFrameId = requestAnimationFrame(animate);

    function animate() {
      const container = containerRef.current;
      if (!container) return;

      setKeywords(prevKeywords => 
        prevKeywords.map(kw => {
          let { x, y, vx, vy, width, height } = kw;

          x += vx;
          y += vy;
          
          if (x <= 0 || x + width >= container.clientWidth) {
            vx *= -1;
            x = Math.max(0, Math.min(x, container.clientWidth - width));
          }
          if (y <= 0 || y + height >= container.clientHeight) {
            vy *= -1;
            y = Math.max(0, Math.min(y, container.clientHeight - height));
          }

          return { ...kw, x, y, vx, vy };
        })
      );

      requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // First render to measure elements, subsequent renders to animate
  if (keywords.length === 0) {
    return (
      <div className="w-full h-full flex flex-col">
        <h3 className="text-xl font-bold text-foreground mb-4">주요 키워드</h3>
        <div ref={containerRef} className="relative flex-1 w-full overflow-hidden opacity-0">
          {keywordsData.map((keyword, index) => (
            <Link
              href="#"
              key={index}
              ref={el => { keywordRefs.current[index] = el; }}
              className={`absolute whitespace-nowrap px-4 py-2 rounded-full font-semibold ${keyword.size} ${keyword.color}`}
            >
              {keyword.text}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-xl font-bold text-foreground mb-4">주요 키워드</h3>
      <div ref={containerRef} className="relative flex-1 w-full overflow-hidden">
        {keywords.map(kw => (
          <Link
            href={`/keyword/${encodeURIComponent(kw.data.text.substring(1))}`}
            key={kw.id}
            className={`absolute whitespace-nowrap px-4 py-2 rounded-full font-semibold transition-shadow duration-300 hover:shadow-lg ${kw.data.size} ${kw.data.color}`}
            style={{
              transform: `translate(${kw.x}px, ${kw.y}px)`,
              willChange: 'transform',
            }}
          >
            {kw.data.text}
          </Link>
        ))}
      </div>
    </div>
  );
}