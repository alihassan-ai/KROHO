export interface PlatformSpec {
  width: number;
  height: number;
  name: string;
}

export interface PlatformSpecs {
  [format: string]: PlatformSpec;
}

export const PLATFORM_SPECS: Record<string, PlatformSpecs> = {
  meta: {
    feed_square:    { width: 1080, height: 1080, name: 'Feed Square' },
    feed_landscape: { width: 1200, height: 628,  name: 'Feed Landscape' },
    story:          { width: 1080, height: 1920, name: 'Story/Reel' },
    carousel:       { width: 1080, height: 1080, name: 'Carousel' },
  },
  tiktok: {
    feed:           { width: 1080, height: 1920, name: 'Feed' },
    spark_ad:       { width: 1080, height: 1920, name: 'Spark Ad' },
  },
  google: {
    responsive_sq:  { width: 1200, height: 1200, name: 'Responsive Square' },
    responsive_ls:  { width: 1200, height: 628,  name: 'Responsive Landscape' },
    responsive_pt:  { width: 960,  height: 1200, name: 'Responsive Portrait' },
  },
  linkedin: {
    sponsored:      { width: 1200, height: 627,  name: 'Sponsored Content' },
    message_ad:     { width: 300,  height: 250,  name: 'Message Ad' },
  },
  youtube: {
    thumbnail:      { width: 1280, height: 720,  name: 'Thumbnail' },
    bumper:         { width: 1920, height: 1080, name: 'Bumper Ad' },
  },
};

export const PLATFORM_LABELS: Record<string, string> = {
  meta:     'Meta (Facebook/Instagram)',
  tiktok:   'TikTok',
  google:   'Google',
  linkedin: 'LinkedIn',
  youtube:  'YouTube',
};

export const ALL_PLATFORMS = Object.keys(PLATFORM_SPECS);
