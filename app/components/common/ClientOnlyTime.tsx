'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ClientOnlyTimeProps {
  date: string;
}

const formatRelativeTime = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ko });
  } catch (error) {
    return dateString; // Return original string on error
  }
};

export default function ClientOnlyTime({ date }: ClientOnlyTimeProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // On the server and during initial client render, return a static or placeholder value
    // Returning null is also an option if you want nothing to show initially.
    return <time dateTime={date}>{new Date(date).toLocaleDateString()}</time>;
  }

  // After mounting on the client, render the relative time
  return <time dateTime={date}>{formatRelativeTime(date)}</time>;
}
