/**
 * DGSCI / CBMPA - Geocodificação precisa por endereço (rua + número + bairro)
 *
 * Lê as abas da planilha usando o MESMO parser do dashboard (js/sheets-sync.js),
 * consulta a Mapbox Geocoding API v6 para cada endereço único e grava o resultado em
 * geocoded_addresses.json (cache incremental: só consulta endereços novos).
 *
 * Uso:  node tools/geocode-addresses.js            (só endereços novos)
 *       node tools/geocode-addresses.js --force    (refaz tudo)
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'geocoded_addresses.json');
const TOKEN = process.env.MAPBOX_TOKEN || Buffer.from('cGsuZXlKMUlqb2laR2x2WjI5c2IySmhkRzhpTENKaElqb2lZMjExZDNwaGRIaG1NRE5pZHpKNmNUUjBhV0pqTm1oek15SjkuZmJURk9RY2h4VTh1ZUZlRFVDVWdqdw==', 'base64').toString('utf8');
const FORCE = process.argv.includes('--force');
const CONCURRENCY = 6;
// Belém + RMB (inclui Mosqueiro, Outeiro, Icoaraci, Ananindeua, Marituba, Benevides)
const BBOX = '-48.65,-1.56,-48.15,-1.0';
const MAX_DIST_FROM_BAIRRO_KM = 3.0;

// ---------------------------------------------------------------------------
// Carrega os scripts do front-end num sandbox para reaproveitar o parser oficial
// ---------------------------------------------------------------------------
const sandbox = {
  console, fetch, AbortController, setTimeout, clearTimeout, URL,
  localStorage: { setItem() {}, getItem() { return null; } }
};
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const f of ['js/cbmpa-divisions.js', 'js/sheets-sync.js', 'js/geo-map-keys.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
}
const { buildAddressKey, buildGeocodeQuery, BAIRRO_CENTROIDS, normalizeText } = sandbox.DGSCI_GEO_KEYS;

function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371, toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function geocode(query, bairroCentroid) {
  const proximity = bairroCentroid ? `${bairroCentroid[1]},${bairroCentroid[0]}` : '-48.48,-1.45';
  const url = 'https://api.mapbox.com/search/geocode/v6/forward'
    + `?q=${encodeURIComponent(query)}&country=br&language=pt&limit=1`
    + `&types=address,street&bbox=${BBOX}&proximity=${proximity}&access_token=${TOKEN}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) { await new Promise(r => setTimeout(r, 2000 * (attempt + 1))); continue; }
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const json = await res.json();
    const f = json.features && json.features[0];
    if (!f) return { error: 'sem resultado' };
    const [lng, lat] = f.geometry.coordinates;
    return {
      lat, lng,
      type: f.properties.feature_type,              // 'address' (com número) ou 'street'
      confidence: (f.properties.match_code || {}).confidence || 'unknown',
      full: f.properties.full_address || f.properties.name
    };
  }
  return { error: 'rate limit' };
}

async function main() {
  console.log('📥 Baixando planilha (mesmo parser do dashboard)...');
  const data = await sandbox.sheetsSyncManager.syncFromGoogleSheets('', () => {});
  console.log(`   ${data.companies.length} estabelecimentos carregados.`);

  const cache = (!FORCE && fs.existsSync(OUT_FILE)) ? JSON.parse(fs.readFileSync(OUT_FILE, 'utf8')) : {};

  // Endereços únicos
  const jobs = new Map();
  for (const c of data.companies) {
    const key = buildAddressKey(c.endereco, c.bairro);
    if (!key || cache[key] || jobs.has(key)) continue;
    const query = buildGeocodeQuery(c.endereco, c.numeroImovel, c.bairro);
    if (!query) continue;
    jobs.set(key, { query, bairro: c.bairro });
  }
  console.log(`🔎 ${jobs.size} endereços novos para geocodificar (${Object.keys(cache).length} já em cache).`);

  const entries = [...jobs.entries()];
  let done = 0, ok = 0, rejected = 0;
  async function worker() {
    while (entries.length) {
      const [key, job] = entries.shift();
      const centroid = BAIRRO_CENTROIDS[normalizeText(job.bairro)] || null;
      const r = await geocode(job.query, centroid);
      if (!r.error && centroid && distKm(r.lat, r.lng, centroid[0], centroid[1]) > MAX_DIST_FROM_BAIRRO_KM) {
        r.rejected = `longe do bairro (${distKm(r.lat, r.lng, centroid[0], centroid[1]).toFixed(1)} km)`;
      }
      if (r.error || r.rejected) rejected++; else ok++;
      cache[key] = { q: job.query, ...r };
      if (++done % 100 === 0) {
        console.log(`   ${done}/${jobs.size}...`);
        fs.writeFileSync(OUT_FILE, JSON.stringify(cache));
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  fs.writeFileSync(OUT_FILE, JSON.stringify(cache));

  const all = Object.values(cache);
  const good = all.filter(v => !v.error && !v.rejected);
  console.log('\n✅ Concluído');
  console.log(`   Nesta execução: ${ok} aceitos, ${rejected} rejeitados/sem resultado`);
  console.log(`   Total no cache: ${all.length} | precisos (com número): ${good.filter(v => v.type === 'address').length}`
    + ` | só rua: ${good.filter(v => v.type === 'street').length} | rejeitados: ${all.length - good.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
