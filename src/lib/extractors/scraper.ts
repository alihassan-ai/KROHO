import * as cheerio from 'cheerio';

/** Try to find the best logo/icon for a brand's website.
 *  Priority: OG image → apple-touch-icon → <link rel="icon"> → Google favicon service
 */
export async function extractLogoUrl(url: string): Promise<string | null> {
    try {
        const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        const domain = new URL(normalized).hostname;

        const response = await fetch(normalized, { signal: AbortSignal.timeout(8000) });
        const html = await response.text();
        const $ = cheerio.load(html);

        // 1. OG image (usually best quality brand image)
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage) return ogImage.startsWith('http') ? ogImage : new URL(ogImage, normalized).href;

        // 2. Apple touch icon (high-res favicon)
        const appleIcon = $('link[rel="apple-touch-icon"]').attr('href') ||
                          $('link[rel="apple-touch-icon-precomposed"]').attr('href');
        if (appleIcon) return appleIcon.startsWith('http') ? appleIcon : new URL(appleIcon, normalized).href;

        // 3. Standard favicon
        const favicon = $('link[rel="icon"], link[rel="shortcut icon"]').last().attr('href');
        if (favicon) return favicon.startsWith('http') ? favicon : new URL(favicon, normalized).href;

        // 4. Google favicon service as reliable fallback
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
        return null;
    }
}

export async function scrapeWebsite(url: string): Promise<string> {
    try {
        const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        const response = await fetch(normalized);
        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove scripts, styles, and extra whitespace
        $('script, style, nav, footer, iframe').remove();

        const text = $('body')
            .text()
            .replace(/\s+/g, ' ')
            .trim();

        return text;
    } catch (error) {
        console.error(`Error scraping website ${url}:`, error);
        throw new Error('Failed to scrape website');
    }
}
