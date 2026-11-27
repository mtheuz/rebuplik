import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('public/images', { recursive: true });
const images = {
  'room-1': 'photo-1616486338812-3dadae4b4ace',
  'room-2': 'photo-1505693416388-ac5ce068fe85',
  'room-3': 'photo-1522708323590-d24dbb6b0267',
  'room-4': 'photo-1600210492486-724fe5c67fb0',
  'room-5': 'photo-1513694203232-719a280e022f',
  'room-6': 'photo-1540518614846-7eded433c457',
  'room-7': 'photo-1615874959474-d609969a20ed',
  'room-8': 'photo-1616046229478-9901c5536a45',
  'item-1': 'photo-1518455027359-f3f8164ba6bd',
  'item-2': 'photo-1571175443880-49e1d25b2bc5',
  'item-3': 'photo-1527443224154-c4a3942d3acf',
  'item-4': 'photo-1517912172058-994f5e342dca',
  'item-5': 'photo-1585659722983-3a675dabf23d',
  'item-6': 'photo-1485965120184-e220f721d03e',
  'item-7': 'photo-1517668808822-9ebb02f2a0e6',
  'item-8': 'photo-1594620302200-9a762244a156',
};
await Promise.all(Object.entries(images).map(async ([name, photo]) => {
  const response = await fetch(`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1000&q=85`, { signal: AbortSignal.timeout(30000) });
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`${name}: ${response.status}`);
  await writeFile(`public/images/${name}.jpg`, Buffer.from(await response.arrayBuffer()));
  console.log(`Downloaded ${name}`);
}));
await mkdir('public/fonts', { recursive: true });
let css = await (await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Rosario:wght@400;500;600;700')).text();
const urls = [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)\s]+/g) || [])];
for (let i = 0; i < urls.length; i++) {
  const response = await fetch(urls[i]);
  if (!response.ok) throw new Error(`Font: ${response.status}`);
  const name = `font-${i}.${urls[i].endsWith('.woff2') ? 'woff2' : 'ttf'}`;
  await writeFile(`public/fonts/${name}`, Buffer.from(await response.arrayBuffer()));
  css = css.replaceAll(urls[i], `/fonts/${name}`);
}
await writeFile('public/fonts/fonts.css', css);
console.log('Fonts downloaded');
