const KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY ?? '';

/**
 * Fetch a single random GIF URL for the given search tag.
 * Returns null when no API key is configured or the request fails.
 */
export async function fetchRandomGif(tag: string): Promise<string | null> {
  if (!KEY) return null;
  try {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/random?api_key=${KEY}&tag=${encodeURIComponent(tag)}&rating=g`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.data?.images?.fixed_height?.url as string) ?? null;
  } catch {
    return null;
  }
}
