// Precomputed dominant-hue + aspect-type + content-hash per Work image (offline
// scan of every preview image). getWork uses this to sort the whole preview into
// a rainbow, keep same-type screens from clustering, and drop exact duplicates.
// Re-run the scratchpad scan and regenerate when the Work set changes.
export type WorkType = 'mobile' | 'web' | 'other'

export const WORK_META: Record<string, { hue: number; type: WorkType; hash: string }> = {
  'canvas-stickynote.mp4': { hue: 295, type: 'web', hash: '73b4c2f7f16b' },
  'property-listing-02.png': { hue: 15, type: 'mobile', hash: '7bf31ce6105f' },
  'mortgage-upload-01.png': { hue: 25, type: 'mobile', hash: 'c27f9328b8ba' },
  'home-dashboard-03.png': { hue: 25, type: 'mobile', hash: '34b40f4617e6' },
  'fact-card-01.png': { hue: -1, type: 'mobile', hash: 'ca35aa326a7c' },
  'game-result-01.png': { hue: 215, type: 'mobile', hash: '00bd20372baa' },
  'game-over-01.png': { hue: 165, type: 'mobile', hash: '8ecc788cb06f' },
  'property-dashboard-01.png': { hue: 195, type: 'other', hash: '5667b0a75538' },
  'media-player-01.png': { hue: 25, type: 'web', hash: 'bf48dc433a2c' },
  'maintenance-plan-01.png': { hue: 195, type: 'mobile', hash: '21ac44aef196' },
  'home-value-cards-01.png': { hue: 75, type: 'web', hash: 'c2ae204d09bf' },
  'ftue-onboarding-04.png': { hue: 75, type: 'web', hash: 'c2ae204d09bf' },
  'onboarding-flow-01.png': { hue: 25, type: 'web', hash: 'f3a1234e6956' },
  'upload-progress-01.png': { hue: 215, type: 'web', hash: '7a826e9bbbe8' },
  'claude-usage.png': { hue: 215, type: 'other', hash: '5084c1b57260' },
  'tactile-deck.mp4': { hue: 345, type: 'other', hash: 'e4d67f85b6a5' },
  'cassi-fundraising-deck.mp4': { hue: 20, type: 'web', hash: '32214a83340d' },
  'cassi-carousel.mp4': { hue: 350, type: 'web', hash: '9663d900dcd0' },
  '13c06a52226574bf93030a47cecb1de00eec3c3a.mp4': { hue: 5, type: 'web', hash: '75cc50ff8899' },
  'painting-christmas-window.jpg': { hue: 30, type: 'other', hash: '03c4902814b6' },
  'painting-pomegranate.jpg': { hue: 0, type: 'other', hash: 'be86c6f8c8b1' },
  'painting-home-alone.jpg': { hue: 220, type: 'other', hash: '77d6193fb428' },
  'notes-palette.png': { hue: 250, type: 'other', hash: 'ac4466827fa9' },
  'books-2024.png': { hue: 50, type: 'other', hash: 'dd1e5090b536' },
  'c23c525edf1f0b3540ea0949dbd5055e740e9051-619x512.png': { hue: 355, type: 'web', hash: 'b2d9150f1a23' },
  'e19ef81f4a903bcb852d059bd626507cff8a1f96-619x530.png': { hue: 25, type: 'other', hash: 'bb7f9fb66e9a' },
  '8d7b7a5f5fe367ef046a37a53704a2d248b37b9b-1600x1200.png': { hue: 165, type: 'web', hash: '8114aec53750' },
  'c69c48730b9aa548c100fb67abff65593631a723-1600x1200.png': { hue: 355, type: 'web', hash: '5230d1c4e504' },
  '40a7cf22dd5d3d193808bb85995966759e156480-1600x1200.png': { hue: 5, type: 'web', hash: '847957dd03d4' },
  '6db2a2bb880db9f0c289466f6026a17bbb915f20-1654x862.png': { hue: 165, type: 'web', hash: '015ad39a8ab8' },
  'ce1d5a7a91466672d01eb5a624a8d500bef8b421-3588x2691.jpg': { hue: 265, type: 'web', hash: 'c0273c00ea4f' },
  '77860b1008c9000567d1e816035c6f7b3354b273-1920x1200.png': { hue: 215, type: 'web', hash: '71c46090504c' },
  'bf0ed67c38cf669b355a43d1acff792a9dcb8773-4539x3405.jpg': { hue: 155, type: 'web', hash: '5d2575cb261e' },
  'd9a0487d244e530a90cea8b88b6001ec24aa3fb1-3588x2691.jpg': { hue: 155, type: 'web', hash: 'dc1983d8cd5b' },
  'c7706e0406c9c38b744a4efd191105a428b02ab1-2967x2226.jpg': { hue: 215, type: 'web', hash: '7acd78fdec83' },
  'e4c153a46a8629b4bb2f4857d1a18dcdd1748f20-1710x1284.jpg': { hue: 215, type: 'web', hash: 'efba82721e81' },
  'ecfee3613b465884c8748e32d86936ceae604872-1555x1148.png': { hue: 235, type: 'web', hash: '7714bec8cb57' },
  '9597a37ba94932ed6ff01020674f19bd3078cdd2-1315x1092.png': { hue: 195, type: 'web', hash: '37a9af01b663' },
  '971476cea5640af74b5eedf11d9a719af274fbc6-640x813.png': { hue: 155, type: 'other', hash: '452ec91b230f' },
  '8ac3066476ce26f880ec29b70d21872ccedf0077-640x753.png': { hue: 155, type: 'other', hash: '31dfccb48c91' },
  '47498dbcf4ec237d03ef1bc1c55ba3c1960fa914-4000x4000.png': { hue: 225, type: 'other', hash: 'e17356e63f10' },
  '9cf7a07ac435ac70d1fa54cfd5c0002219f305bc-1600x1200.png': { hue: 225, type: 'web', hash: '02c0396a1154' },
  '3d5cc95970afbcce845ea42b1460469b102853d0-2058x1544.png': { hue: 265, type: 'web', hash: '9604abc0f800' },
  'a3bba9628b7131f2cecb98c38a477e2aec1c80b0-2967x2226.jpg': { hue: 155, type: 'web', hash: 'e5bafe36d4ed' },
  '65e1f609c1ee3df69605542a51eb3e4ef220edc0-4569x3426.jpg': { hue: 175, type: 'web', hash: 'd3283abffc24' },
  'ff5323ccdc1f53b07e731cacdc5cbed012fe0d0d-1600x1200.png': { hue: 105, type: 'web', hash: '8291d8131017' },
  '2d679f29576573a9ae456fbd4797acd755dec630-1600x1200.png': { hue: 65, type: 'web', hash: '4f3e4dc7503d' },
  '26956a15eb692a3378d5ffc5cd8628322e54f5f2-1600x1200.png': { hue: 135, type: 'web', hash: 'b213602579a6' },
  'c6bd6c294a9c728a77d2fb7ca66f1293fa6f6fde-1840x1000.png': { hue: 255, type: 'web', hash: '2ca4b173c889' },
  '42c318e4e3e01132b1472f7ef56a3a96ba5da253-1840x1000.png': { hue: 155, type: 'web', hash: '1705539a3396' },
  '9fea1259bd47c7c73aa9dcd564340e8f43b06f86-1280x568.png': { hue: 235, type: 'web', hash: '7c323c0b2149' },
  '52fea9e5df569f33954637a87f8da833e34826be-1920x1200.png': { hue: 215, type: 'web', hash: 'c3a4a4227aab' },
  '7d7fb44c3b7243052b407cc751e2e3497df17490-640x498.png': { hue: 265, type: 'web', hash: '60df29d4c4ce' },
  'c6d70989d9b47432bca4f2c6ee8c712392ccc949-1769x1326.png': { hue: 235, type: 'web', hash: 'd7ef1029f8cc' },
  '1c1ccbb1a16f8994c36c90838a496c49d1cb8f99.mp4': { hue: 35, type: 'web', hash: '31ffccc69190' },
  '2bc3d726b69b603e16a87ff0e20d5316d5407e9d-1929x1653.png': { hue: 25, type: 'other', hash: '024a16da1d93' },
  '4d2027a7bf3523823a884fb859da762c5041bcb0-1929x939.png': { hue: 55, type: 'web', hash: '21b8b699a7eb' },
  '574310b7cec0a7709455629df96fb81dab904c24-1929x1597.png': { hue: 355, type: 'web', hash: '38c0cd9c9275' },
  '415d743552571723b4eb276fd05417a8acc089c1-1929x1444.png': { hue: 55, type: 'web', hash: 'e34e037e8130' },
  'ebcbe3e8d21b64ecc3e4a3aec005fe0f32cfe1e2-1929x1444.png': { hue: 45, type: 'web', hash: '308af2c46302' },
  'f835ab854689260af49cdc29fb9d34aa1a2a274e-1824x1822.png': { hue: 265, type: 'other', hash: '5efbd0c680e4' },
  '11af0c9cd13f04e65feca8149963374fa4c16470-1824x2719.png': { hue: 265, type: 'other', hash: '043c0456d928' },
  '1dba04ef8696b6385de4005988f61a73dba9e54e-2457x1407.png': { hue: 235, type: 'web', hash: '274bfac87e4a' },
  'b69f71df224fa490ade5309709bf25dffe36ccdd-2457x1989.png': { hue: 225, type: 'web', hash: '4bc2e2f06078' },
  '6c3293fa2ea4d08c34d286423348a3a8083cd217-2457x1477.png': { hue: 225, type: 'web', hash: '62aa5d7e27a4' },
  '961f6a54c82e76db8fce8dbcb4ec89648edd1095-2457x1509.png': { hue: 145, type: 'web', hash: '93b1275bd0f1' },
  '2b92ccb1a684f606d4e32c4eac32e1592cde9c48-2457x1842.png': { hue: 235, type: 'web', hash: '9e5b1836492b' },
  'def2f904068bf508129457fa6b1f1bf152a06e98-1824x1365.png': { hue: 235, type: 'web', hash: 'b52856902536' },
}

export function workKey(src: string): string {
  const path = src.split('?')[0]
  return path.substring(path.lastIndexOf('/') + 1)
}

// Drop exact-duplicate images (same content hash), then rainbow sort (by hue;
// neutrals/unknowns last), then a de-cluster pass that breaks runs of 3+ of the
// same type by pulling up a nearby, hue-compatible (±45°) different-type item.
export function orderWork<T extends { src: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  const arr: { it: T; hue: number; type: WorkType }[] = []
  for (const it of items) {
    const k = workKey(it.src)
    const m = WORK_META[k]
    const hash = m?.hash ?? k
    if (seen.has(hash)) continue
    seen.add(hash)
    arr.push({ it, hue: m && m.hue >= 0 ? m.hue : 400, type: (m?.type ?? 'other') as WorkType })
  }
  arr.sort((a, b) => a.hue - b.hue)
  for (let i = 2; i < arr.length; i++) {
    if (arr[i].type === arr[i - 1].type && arr[i].type === arr[i - 2].type) {
      for (let j = i + 1; j < Math.min(arr.length, i + 8); j++) {
        if (arr[j].type !== arr[i].type && Math.abs(arr[j].hue - arr[i].hue) <= 45) {
          const [moved] = arr.splice(j, 1)
          arr.splice(i, 0, moved)
          break
        }
      }
    }
  }
  return arr.map((w) => w.it)
}
