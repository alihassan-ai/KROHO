import * as cheerio from 'cheerio';

export async function scrapeWebsite(url: string): Promise<string> {
    try {
        const response = await fetch(url);
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
