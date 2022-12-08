import { Vector2 } from "./utils"

export type Facing = 0 | 90 | 180 | 270

export const TOP:Facing = 0
export const RIGHT:Facing = 90
export const BOTTOM:Facing = 180
export const LEFT:Facing = 270

export const FACING:[Facing,Facing,Facing,Facing] = [TOP, RIGHT, BOTTOM, LEFT]

export const FACING_TO_STRING: Record<Facing,string> = {
  [TOP]: 'top',
  [RIGHT]: 'right',
  [BOTTOM]: 'bottom',
  [LEFT]: 'left'
}

export const FACING_TO_MOD:Record<Facing,Vector2> = {
  [TOP]: [0, -1] ,
  [RIGHT]: [1, 0] ,
  [BOTTOM]: [0, 1] ,
  [LEFT]: [-1, 0] 
}

export const FACING_INVERSE: Record<Facing,Facing>= {
  [TOP]: BOTTOM,
  [RIGHT]: LEFT,
  [BOTTOM]: TOP,
  [LEFT]: RIGHT
}

export const FACING_MOD_RIGHT:Record<Facing,Facing> = {
  [TOP]: RIGHT,
  [RIGHT]: BOTTOM,
  [BOTTOM]: LEFT,
  [LEFT]: TOP
}

export const FACING_MOD_LEFT:Record<Facing,Facing> = {
  [TOP]: LEFT,
  [RIGHT]: TOP,
  [BOTTOM]: RIGHT,
  [LEFT]: BOTTOM
}
