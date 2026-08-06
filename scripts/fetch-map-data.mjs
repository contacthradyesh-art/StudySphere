// One-time script to fetch verified geographic data for Map Practice.
// Run with: node scripts/fetch-map-data.mjs
import { writeFileSync } from 'fs';
import { mkdirSync } from 'fs';

const COMMIT = 'ef25ebc';
const BASE = `https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@${COMMIT}/geojson/states`;

// slug -> display name, matching src/lib/mission-ias/map-schema.ts exactly
const INDIA_UNITS = {
  'andhra-pradesh': 'Andhra Pradesh',
  'arunachal-pradesh': 'Arunachal Pradesh',
  'assam': 'Assam',
  'bihar': 'Bihar',
  'chhattisgarh': 'Chhattisgarh',
  'goa': 'Goa',
  'gujarat': 'Gujarat',
  'haryana': 'Haryana',
  'himachal-pradesh': 'Himachal Pradesh',
  'jharkhand': 'Jharkhand',
  'karnataka': 'Karnataka',
  'kerala': 'Kerala',
  'madhya-pradesh': 'Madhya Pradesh',
  'maharashtra': 'Maharashtra',
  'manipur': 'Manipur',
  'meghalaya': 'Meghalaya',
  'mizoram': 'Mizoram',
  'nagaland': 'Nagaland',
  'odisha': 'Odisha',
  'punjab': 'Punjab',
  'rajasthan': 'Rajasthan',
  'sikkim': 'Sikkim',
  'tamil-nadu': 'Tamil Nadu',
  'telangana': 'Telangana',
  'tripura': 'Tripura',
  'uttarakhand': 'Uttarakhand',
  'uttar-pradesh': 'Uttar Pradesh',
  'west-bengal': 'West Bengal',
  'andaman-and-nicobar-islands': 'Andaman and Nicobar Islands',
  'chandigarh': 'Chandigarh',
  'dnh-and-dd': 'Dadra and Nagar Haveli and Daman and Diu',
  'delhi': 'Delhi',
  'jammu-and-kashmir': 'Jammu and Kashmir',
  'ladakh': 'Ladakh',
  'lakshadweep': 'Lakshadweep',
  'puducherry': 'Puducherry'
};

async function main() {
  mkdirSync('public/data', { recursive: true });

  // --- India: fetch each state/UT file, merge into one FeatureCollection ---
  console.log(`Fetching ${Object.keys(INDIA_UNITS).length} India state/UT files...`);
  const indiaFeatures = [];
  for (const [slug, name] of Object.entries(INDIA_UNITS)) {
    const url = `${BASE}/${slug}.geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${name} (${url}): ${res.status}`);
    const data = await res.json();
    const features = data.type === 'FeatureCollection' ? data.features : [data];
    for (const f of features) {
      indiaFeatures.push({ ...f, properties: { ...f.properties, name } });
    }
    console.log(`  \u2713 ${name}`);
  }
  writeFileSync(
    'public/data/india-states.geojson',
    JSON.stringify({ type: 'FeatureCollection', features: indiaFeatures })
  );
  console.log(`Saved public/data/india-states.geojson (${indiaFeatures.length} features)`);

  // --- World: single verified file (Natural Earth data, public domain) ---
  console.log('Fetching world countries...');
  const worldRes = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/main/data/countries.geojson');
  if (!worldRes.ok) throw new Error(`Failed to fetch world data: ${worldRes.status}`);
  const worldText = await worldRes.text();
  writeFileSync('public/data/world-countries.geojson', worldText);
  console.log('Saved public/data/world-countries.geojson');

  console.log('\nDone. Both files are ready in public/data/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});