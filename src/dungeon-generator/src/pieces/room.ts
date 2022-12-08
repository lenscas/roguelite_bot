import { DeepPartial } from '../generators/dungeon'
import { Vector2 } from '../utils'
import Piece, { getPieceDefaults, PieceOptions } from './piece'

export type RoomOptions = {
  symmetric:boolean
} & PieceOptions

export const getRoomDefaults = ():RoomOptions=>({
  ...getPieceDefaults(),
  symmetric: false,
})

export default class Room extends Piece {
  room_size:Vector2
  symmetric:boolean
  constructor (options:DeepPartial<RoomOptions> & {size:Vector2}) {
    
    options.size = [options.size[0] + 2, options.size[1] + 2]
    const defaults = getRoomDefaults()
    const a:RoomOptions = Object.assign(
      defaults,
      options
    )
    super(a)
    const room_size = a.size
    this.room_size = room_size
    this.symmetric = a.symmetric

    this.walls.set_square([1, 1], this.room_size, false, true)

    if (!this.symmetric) {
      // any point at any wall can be exit
      this.add_perimeter([1, 0], [this.options.size[0] - 2, 0], 180)
      this.add_perimeter([0, 1], [0, this.options.size[1] - 2], 90)
      this.add_perimeter(
        [1, this.options.size[1] - 1],
        [this.options.size[0] - 2, this.options.size[1] - 1],
        0
      )
      this.add_perimeter(
        [this.options.size[0] - 1, 1],
        [this.options.size[0] - 1, this.options.size[1] - 2],
        270
      )
    } else {
      // only middle of each wall can be exit
      const [w, h] = this.get_center_pos()

      this.perimeter = [
        [[w, 0], 180],
        [[this.options.size[0] - 1, h], 270],
        [[w, this.options.size[1] - 1], 0],
        [[0, h], 90]
      ]
    }
  }
}
