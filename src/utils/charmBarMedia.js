export const MAX_CHARM_VIDEOS = 3;
export const MAX_CHARM_IMAGES = 8;

// Solo enlaces https. Acepta que se pegue sin "https://" y devuelve null para
// cualquier otra cosa (por ejemplo "javascript:...").
export function safeExternalUrl(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return null;

  const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(withProtocol);
    return url.protocol === "https:" && url.hostname.includes(".")
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function isInstagramUrl(input) {
  try {
    const host = new URL(input).hostname.toLowerCase();
    return host === "instagram.com" || host.endsWith(".instagram.com");
  } catch {
    return false;
  }
}

const INSTAGRAM_PATH = /^\/(?:[A-Za-z0-9._]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]{5,40})\/?$/;

// De un enlace de Instagram saca el tipo y el código, y arma las direcciones
// limpias (sin ?rpxt=... ni otros rastreadores). Devuelve null si no es un
// reel o una publicación.
export function parseInstagramUrl(input) {
  const safe = safeExternalUrl(input);
  if (!safe || !isInstagramUrl(safe)) return null;

  const match = new URL(safe).pathname.match(INSTAGRAM_PATH);
  if (!match) return null;

  const kind = match[1] === "reels" ? "reel" : match[1];
  const code = match[2];

  return {
    kind,
    code,
    pageUrl: `https://www.instagram.com/${kind}/${code}/`,
    embedUrl: `https://www.instagram.com/${kind}/${code}/embed/`,
  };
}

// Enlace de una imagen: https válido; si es un reel o publicación de
// Instagram, además se limpia. Devuelve null si no es válido.
export function cleanLink(input) {
  const safe = safeExternalUrl(input);
  if (!safe) return null;
  return parseInstagramUrl(safe)?.pageUrl ?? safe;
}

// Solo fotos subidas desde el panel (base64), enlaces https o rutas propias.
const isSafeImageSrc = (src) =>
  typeof src === "string" &&
  /^(?:data:image\/(?:jpeg|png|webp);base64,|https:\/\/|\/(?!\/))/i.test(src);

// Deja solo lo válido de lo que esté guardado, sin importar cómo llegue.
export function normalizeCharmMedia(saved) {
  const videos = [];
  for (const item of Array.isArray(saved?.videos) ? saved.videos : []) {
    const parsed = parseInstagramUrl(item?.url);
    if (!parsed) continue;
    videos.push({
      url: parsed.pageUrl,
      cover: isSafeImageSrc(item?.cover) ? item.cover : "",
    });
    if (videos.length === MAX_CHARM_VIDEOS) break;
  }

  const images = [];
  for (const item of Array.isArray(saved?.images) ? saved.images : []) {
    if (!isSafeImageSrc(item?.image)) continue;
    images.push({ image: item.image, link: cleanLink(item?.link) || "" });
    if (images.length === MAX_CHARM_IMAGES) break;
  }

  return { videos, images };
}