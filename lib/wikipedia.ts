export interface WikiSummary {
  title: string;
  extract: string;
  thumbnail?: { source: string };
}

/** Strip common OpenTDB category prefixes before querying Wikipedia */
function cleanTopic(raw: string): string {
  return raw
    .replace(/^Entertainment:\s*/i, '')
    .replace(/^Science:\s*/i, '')
    .trim();
}

/**
 * Fetch a Wikipedia page summary for the given topic.
 * Returns null when the page is not found or the request fails.
 */
export async function fetchWikiSummary(topic: string): Promise<WikiSummary | null> {
  const cleaned = cleanTopic(topic);
  try {
    const encoded = encodeURIComponent(cleaned.replace(/ /g, '_'));
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.extract || data.type === 'disambiguation') return null;

    // Trim extract to a readable length without cutting mid-word
    const raw: string = data.extract;
    const extract =
      raw.length > 220 ? raw.slice(0, 220).replace(/\s\S*$/, '') + '…' : raw;

    return {
      title:     data.title as string,
      extract,
      thumbnail: data.thumbnail as { source: string } | undefined,
    };
  } catch {
    return null;
  }
}
