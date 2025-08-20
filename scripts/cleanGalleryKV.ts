import { kv } from '@vercel/kv';

const GALLERY_KEY = 'snippix:gallery:artworks';

async function cleanGalleryKV() {
  const items = await kv.lrange(GALLERY_KEY, 0, -1);
  const cleaned = (items || []).map((item) =>
    typeof item === 'string' ? item : JSON.stringify(item)
  );
  // Overwrite the gallery key with cleaned data
  await kv.del(GALLERY_KEY);
  if (cleaned.length > 0) {
    await kv.rpush(GALLERY_KEY, ...cleaned);
  }
  console.log('Gallery KV cleaned!');
}

cleanGalleryKV();
