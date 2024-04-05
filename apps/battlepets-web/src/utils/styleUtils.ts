const BASE_FONT_SIZE = 16 // px
const REM_PX_FACTOR = 10
export const BASE_REM_SIZE = BASE_FONT_SIZE / REM_PX_FACTOR

export const remToPixels = (remSize: number) => remSize * REM_PX_FACTOR
