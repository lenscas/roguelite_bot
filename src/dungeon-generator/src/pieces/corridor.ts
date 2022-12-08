import { Facing } from '../const'
import { DeepPartial } from '../generators/dungeon'
import Room, { getRoomDefaults } from './room'
import { RoomOptions } from './room'

type CorridorOptions = {
  facing:Facing
  length:number
} & RoomOptions

export const getCorridorDefaults = ():CorridorOptions=>({
  ...getRoomDefaults(),
  length: 2,
  facing: 0,
  max_exits: 4,
}

)

export default class Corridor extends Room {
  facing: Facing
  constructor (options:DeepPartial<CorridorOptions>) {
    const a = Object.assign(
      getCorridorDefaults(),
      options
    )

    a.size =
      a.facing === 0 || a.facing === 180
        ? [1, a.length]
        : [a.length, 1]

    super(a)
    this.facing= a.facing
    var w = this.options.size[0] - 1
    var h = this.options.size[1] - 1

    // special perimeter: allow only 4 exit points, to keep this corridor corridor-like..
    if (this.facing === 180) {
      this.perimeter = [
        [[1, h], 0],
        [[0, 1], 90],
        [[2, 1], 270],
        [[1, 0], 180]
      ]
    } else if (this.facing === 270) {
      this.perimeter = [
        [[0, 1], 90],
        [[w - 1, 0], 180],
        [[w - 1, 2], 0],
        [[w, 1], 270]
      ]
    } else if (this.facing === 0) {
      this.perimeter = [
        [[1, 0], 180],
        [[2, h - 1], 270],
        [[0, h - 1], 90],
        [[1, h], 0]
      ]
    } else if (this.facing === 90) {
      this.perimeter = [
        [[w, 1], 270],
        [[1, 2], 0],
        [[1, 0], 180],
        [[0, 1], 90]
      ]
    }
  }
}
