/**
 * Avatar thumbnailing.
 *
 * Supabase embeds user_metadata inside the JWT, and that JWT is sent as an
 * Authorization header on every request. A full-size base64 image there
 * produced a 140KB header, which servers reject with a bare "Failed to
 * fetch" - the account becomes unusable while still appearing signed in.
 *
 * So an avatar is shrunk to a thumbnail and hard-capped. Storing images in a
 * token is the wrong shape long term; a Supabase Storage bucket holding the
 * file and a URL in metadata is the real fix. Until that bucket and its RLS
 * policies exist, the cap is what keeps auth working.
 */

// Leaves room for the rest of the JWT claims well inside the usual 8KB
// header limit.
export const MAX_AVATAR_CHARS = 6000;

const SIZE = 96;
const QUALITIES = [0.7, 0.55, 0.4, 0.3];

export function isTooLarge(dataUri) {
  return typeof dataUri === 'string' && dataUri.length > MAX_AVATAR_CHARS;
}

/**
 * Square-crop and downscale an image file, returning a JPEG data URI that is
 * guaranteed to be under MAX_AVATAR_CHARS. Throws if the image cannot be
 * squeezed small enough.
 */
export function makeAvatarThumbnail(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Could not read that image file.'));
    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error('That file is not a readable image.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');

        // Center-crop to a square so portraits are not squashed.
        const edge = Math.min(img.width, img.height);
        const sx = (img.width - edge) / 2;
        const sy = (img.height - edge) / 2;
        ctx.drawImage(img, sx, sy, edge, edge, 0, 0, SIZE, SIZE);

        for (const quality of QUALITIES) {
          const uri = canvas.toDataURL('image/jpeg', quality);
          if (uri.length <= MAX_AVATAR_CHARS) {
            resolve(uri);
            return;
          }
        }

        reject(
          new Error(
            'That image is too detailed to use as an avatar. Please try a simpler or smaller picture.'
          )
        );
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}
