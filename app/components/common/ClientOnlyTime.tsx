'use client';

import { useState, useEffect } from 'react';
import { formatRelativeTime } from '@/lib/utils'; // Import the correct function
import { format } from 'date-fns'; // Import date-fns format

interface ClientOnlyTimeProps {
  date: string;
  format?: string; // Add optional format prop
}

export default function ClientOnlyTime({ date, format: formatStr }: ClientOnlyTimeProps) {
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

  const dateObj = new Date(date);
  const displayTime = formatStr ? format(dateObj, formatStr) : formatRelativeTime(date);

  // After mounting on the client, render the relative time or formatted time
  return <time dateTime={getKstIsoString(date)}>{displayTime}</time>;
}