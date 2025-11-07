'use client';

import { useState, useEffect } from 'react';
import { formatRelativeTime } from '@/lib/utils'; // Import the correct function

interface ClientOnlyTimeProps {
  date: string;
}

export default function ClientOnlyTime({ date }: ClientOnlyTimeProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // To ensure the datetime attribute is a valid ISO string in KST
  const getKstIsoString = (utcString: string) => {
    try {
      const utcDate = new Date(utcString.includes('T') ? utcString : utcString.replace(' ', 'T') + 'Z');
      const kstDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000));
      return kstDate.toISOString();
    } catch {
      return utcString; // Fallback
    }
  };

  if (!isMounted) {
    // On the server, return a placeholder or null to avoid hydration mismatch
    return <time dateTime={getKstIsoString(date)}></time>;
  }

  // After mounting on the client, render the relative time
  return <time dateTime={getKstIsoString(date)}>{formatRelativeTime(date)}</time>;
}