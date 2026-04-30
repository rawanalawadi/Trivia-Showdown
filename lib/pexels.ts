const KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY ?? '';

export interface PexelsPhoto {
  id: number;
  src: { medium: string; small: string };
  photographer: string;
  alt: string;
}

/**
 * Search Pexels for photos matching a query.
 * Returns an empty array when no API key is configured or the request fails.
 */
export async function searchPexels(query: string, perPage = 6): Promise<PexelsPhoto[]> {
  if (!KEY) return [];
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=square`,
      { headers: { Authorization: KEY } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.photos as PexelsPhoto[]) ?? [];
  } catch {
    return [];
  }
}
