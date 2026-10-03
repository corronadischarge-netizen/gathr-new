// Image files, looked up by name (e.g. IMAGES_3D.discoball)
function byName(files) {
  var out = {};
  Object.keys(files).forEach((p) => {
    out[p.replace(/^.*\/|\.\w+$/g, '')] = files[p];
  });
  return out;
}

/* 3D nightlife icons */
export const IMAGES_3D = byName(
  import.meta.glob('./3d/*.webp', { eager: true, query: '?url', import: 'default' })
);

/* Photos on the first welcome screen */
export const WELCOME_PHOTOS = byName(
  import.meta.glob('./welcome/*.jpg', { eager: true, query: '?url', import: 'default' })
);
