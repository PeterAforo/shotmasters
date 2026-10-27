/** Local stylized billiard artwork (public/textures) — used as CMS-empty fallbacks. */
export const IMG = {
  hall: '/textures/hall.svg',
  balls: '/textures/balls.svg',
  table: '/textures/table.svg',
  bokeh: '/textures/bokeh.svg',
} as const

export const TABLE_FALLBACKS = [IMG.table, IMG.hall, IMG.balls]
export const GALLERY_FALLBACKS = [IMG.balls, IMG.table, IMG.hall, IMG.bokeh]
