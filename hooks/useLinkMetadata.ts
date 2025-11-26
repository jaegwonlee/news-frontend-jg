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
