export async function analyzeSite(url: string, apiKey: string): Promise<{ url: string; score: number | null; error: boolean }> {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.lighthouseResult || !data.lighthouseResult.categories) {
      console.error(`⚠️ Analyse échouée pour ${url} :`, data.error?.message || 'Pas de lighthouseResult');
      return { url, score: null, error: true };
    }

    const score = Math.round(data.lighthouseResult.categories.performance.score * 100);
    return { url, score, error: false };

  } catch (err) {
    console.error(`❌ Erreur réseau sur ${url} :`, err);
    return { url, score: null, error: true };
  }
}