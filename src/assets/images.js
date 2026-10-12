// Image files, looked up by name (e.g. IMAGES_3D.discoball)
function byName(files) {
  var out = {};
  Object.keys(files).forEach((p) => {
    out[p.replace(/^.*\/|\.\w+$/g, '')] = files[p];
  });
  return out;
}

/* 3D objects: the design system's stickers (gathr-design/assets/Stickers), the only objects the app uses */
const STICKERS = byName(
  import.meta.glob('../../gathr-design/assets/Stickers/*.png', { eager: true, query: '?url', import: 'default' })
);

/* the app's older names, and objects the design system doesn't have, mapped to the closest sticker */
const ALIAS = {
  discoball: 'disco-ball',
  pass: 'lanyard-pass',
  memories: 'camera',
  cd: 'vinyl',
  megaphone: 'speaker',
  heart: 'disco-ball',
  water: 'shaker'
};

export const IMAGES_3D = Object.assign(
  {},
  STICKERS,
  Object.fromEntries(Object.keys(ALIAS).map((k) => [k, STICKERS[ALIAS[k]]]))
);

/* Photos on the first welcome screen */
export const WELCOME_PHOTOS = byName(
  import.meta.glob('./welcome/*.jpg', { eager: true, query: '?url', import: 'default' })
);
