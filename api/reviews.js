// Reseñas de Google en vivo para la portada.
// Variables en Vercel: GOOGLE_PLACES_API_KEY (obligatoria) y GOOGLE_PLACE_ID (opcional).
// La respuesta se guarda un día en la CDN de Vercel, así Google recibe muy pocas consultas.

const SEARCH = 'IL Beauty Academy, 5065 Deer Valley Rd Suite 205, Antioch, CA 94531';
let cachedPlaceId = process.env.GOOGLE_PLACE_ID || '';

async function findPlaceId(key) {
  if (cachedPlaceId) return cachedPlaceId;
  // Solo pedimos el id: esta búsqueda es gratis en Google.
  const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.id' },
    body: JSON.stringify({ textQuery: SEARCH })
  });
  if (!r.ok) throw new Error('search ' + r.status);
  const d = await r.json();
  cachedPlaceId = (d.places && d.places[0] && d.places[0].id) || '';
  if (!cachedPlaceId) throw new Error('place not found');
  return cachedPlaceId;
}

module.exports = async (req, res) => {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const lang = (req.query && req.query.lang) === 'en' ? 'en' : 'es';
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!key) {
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 503;
    return res.end(JSON.stringify({ error: 'missing GOOGLE_PLACES_API_KEY' }));
  }
  try {
    const id = await findPlaceId(key);
    const r = await fetch('https://places.googleapis.com/v1/places/' + encodeURIComponent(id) + '?languageCode=' + lang, {
      headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'rating,userRatingCount,reviews,googleMapsUri,googleMapsLinks' }
    });
    if (!r.ok) throw new Error('details ' + r.status);
    const p = await r.json();
    const reviews = (p.reviews || []).map(v => ({
      author: (v.authorAttribution && v.authorAttribution.displayName) || '',
      authorUrl: (v.authorAttribution && v.authorAttribution.uri) || '',
      rating: v.rating || 0,
      text: (v.originalText && v.originalText.text) || (v.text && v.text.text) || '',
      time: v.relativePublishTimeDescription || ''
    })).filter(v => v.text);
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.statusCode = 200;
    res.end(JSON.stringify({
      rating: p.rating || 0,
      count: p.userRatingCount || 0,
      url: p.googleMapsUri || '',
      writeUrl: (p.googleMapsLinks && p.googleMapsLinks.writeAReviewUri) || '',
      reviews
    }));
  } catch (e) {
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    res.statusCode = 502;
    res.end(JSON.stringify({ error: String(e.message || e) }));
  }
};
