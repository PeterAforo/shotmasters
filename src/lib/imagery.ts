/** Local stylized billiard artwork (public/textures) — used as CMS-empty fallbacks. */
export const IMG = {
  hall: '/media/img-02.jpg',
  balls: '/media/img-05.jpg',
  room: '/media/img-03.jpg',
  crowd: '/media/img-04.jpg',
  bokeh: '/textures/bokeh.svg',
} as const

export const TABLE_FALLBACKS = [IMG.room, IMG.hall, IMG.balls]
export const GALLERY_FALLBACKS = [IMG.balls, IMG.hall, IMG.room, IMG.crowd]
