import { useEffect, useState } from "react";
import { LinkMetadata } from "@/types";
import { getLinkMetadata } from "@/lib/api";

interface UseLinkMetadataResult {
  metadata: LinkMetadata | null;
  isLoading: boolean;
  error: Error | null;
}

export function useLinkMetadata(url: string | undefined): UseLinkMetadataResult {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!url) {
      setMetadata(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Prevent fetching metadata for localhost URLs
    try {
      const parsedUrl = new URL(url);
      if (['localhost', '127.0.0.1'].includes(parsedUrl.hostname) || parsedUrl.hostname.endsWith('vercel.app')) {
        setError(new Error("Cannot fetch metadata for internal URLs."));
        setMetadata(null);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      // If URL is invalid, let it fail in getLinkMetadata
    }

    const fetchMetadata = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getLinkMetadata(url);
        setMetadata(data);
      } catch (err) {
        setError(err as Error);
        setMetadata(null); // Clear metadata on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [url]);

  return { metadata, isLoading, error };
}
