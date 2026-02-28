/**
 * Returns the Next.js basePath prefix for static assets.
 * In production (GitHub Pages), assets live under /Mockup-ps/.
 * In development, no prefix is needed.
 */
const basePath = process.env.NODE_ENV === 'production' ? '/Mockup-ps' : '';

export default basePath;

/** Prefix a public asset path with the basePath */
export function assetUrl(path: string): string {
  return `${basePath}${path}`;
}
