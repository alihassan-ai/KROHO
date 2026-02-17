import sharp from 'sharp';

export interface ResizeOption {
    name: string;
    width: number;
    height: number;
}

export const PLATFORM_SPECS: Record<string, ResizeOption[]> = {
    meta: [
        { name: 'Meta_Square', width: 1080, height: 1080 },
        { name: 'Meta_Landscape', width: 1200, height: 628 },
        { name: 'Meta_Reel', width: 1080, height: 1920 },
    ],
    tiktok: [
        { name: 'TikTok_Vertical', width: 1080, height: 1920 },
    ],
    google: [
        { name: 'Google_Display', width: 1200, height: 628 },
    ]
};

export async function resizeImage(imageBuffer: Buffer, width: number, height: number): Promise<Buffer> {
    return await sharp(imageBuffer)
        .resize(width, height, {
            fit: 'cover',
            position: 'center'
        })
        .png()
        .toBuffer();
}

export async function fetchImageAsBuffer(input: string): Promise<Buffer> {
    if (input.startsWith('http')) {
        const res = await fetch(input);
        if (!res.ok) throw new Error(`Failed to fetch image from ${input}`);
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } else {
        // Assume base64
        const base64Data = input.replace(/^data:image\/\w+;base64,/, "");
        return Buffer.from(base64Data, 'base64');
    }
}
