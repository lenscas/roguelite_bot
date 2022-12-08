import Array2d from '../utils/array2d'
import Rectangle from '../utils/rectangle'
import {
  iter_adjacent,
  intersects,
  array_test,
  iter_2d,
  iter_range,
  Vector2
} from '../utils'
import { Facing } from '../const'
import { DeepPartial } from '../generators/dungeon'

let next_piece_id = 0

export type PieceOptions = {
  size: Vector2,
  position:Vector2,
  parent: Piece | null,
  max_exits:number,
  tag:string
}

export const getPieceDefaults = ():PieceOptions=>({
  size: [1, 1],
  position: [0, 0],
  parent: null,
  max_exits: 10,
  tag: ''
})

// base dungeon piece class, to be extended
export default class Piece {
  options:PieceOptions
  id:number
  walls:Array2d<boolean>
  perimeter:Array<[Vector2,Facing]>
  exits:Array<[Vector2,Piece]>
  children:Array<Piece>
  parent: Piece | undefined
  start_pos:Vector2 | undefined
  constructor (options: DeepPartial<PieceOptions>) {
    const defaults:PieceOptions = getPieceDefaults()

    const a = Object.assign(
      defaults,
      options
    )

    //Object.assign(this, options)

    this.options = a
    this.id = next_piece_id++
    this.walls = new Array2d(this.options.size, true)
    this.perimeter = []
    this.exits = []
    this.children = []
  }

  get rect () {
    return new Rectangle(
      this.options.position[0],
      this.options.position[1],
      this.options.size[0],
      this.options.size[1]
    )
  }

  is_exit ([x, y]:Vector2) {
    return (
      this.exits.filter(([[exit_x, exit_y], ...rest]) => {
        return exit_x === x && exit_y === y
      }).length !== 0
    )
  }

  get_non_wall_tiles () {
    const retv:Array<Vector2> = []
    this.walls.iter((pos, is_wall) => {
      if (!is_wall) {
        retv.push(pos)
      }
    })
    return retv
  }

  get_perimeter_by_facing (facing:Facing) {
    return this.perimeter.filter(([[x, y], f]) => {
      return facing === f
    })
  }

  get_inner_perimeter () {
    // returns array of tiles in the piece that are adjacent to a wall,
    // but not an exit;

    const retv:Array<Vector2> = []
    let haswall:boolean | null
    let exit_adjacent:boolean

    this.walls.iter((pos, is_wall) => {
      if (!is_wall && !this.is_exit(pos)) {
        haswall = false
        exit_adjacent = false
        iter_adjacent(pos, (p) => {
          haswall = haswall || this.walls.get(p)
          exit_adjacent = exit_adjacent || this.is_exit(p)
        })
        if (haswall && !exit_adjacent) {
          retv.push(pos)
        }
      }
    })

    return retv
  }

  // local position to parent position
  parent_pos ([x, y]:Vector2):Vector2 {
    return [this.options.position[0] + x, this.options.position[1] + y]
  }

  // local position to global position
  global_pos (pos:Vector2) {
    pos = this.parent_pos(pos)
    if (this.parent) {
      pos = this.parent.global_pos(pos)
    }
    return pos
  }

  // parent position to local position
  local_pos (pos:Vector2):Vector2 {
    return [pos[0] - this.options.position[0], pos[1] - this.options.position[1]]
  }

  // get (roughly) center tile position for the piece
  // @TODO consider if should use Math.floor instead of Math.round
  get_center_pos ():Vector2 {
    return [Math.floor(this.options.size[0] / 2), Math.floor(this.options.size[1] / 2)]
  }

  add_perimeter (p_from: Vector2, p_to: Vector2, facing: Facing) {
    iter_range(p_from, p_to, (pos) => {
      this.perimeter.push([pos, facing])
    })
  }

  remove_perimeter (rect: { contains: (arg0: number, arg1: number, arg2: number, arg3: number) => any } ) {
    this.perimeter = this.perimeter.filter(([[x, y], facing]) => {
      return !rect.contains(x, y, 1, 1)
    })
  }

  intersects (piece: { position: Vector2; size: Vector2 }) {
    return intersects(this.options.position, this.options.size, piece.position, piece.size)
  }

  add_piece (piece: Piece, position:Vector2 | null = null) {
    if (array_test(this.children, (c) => c.id === piece.id)) {
      return
    }
    piece.parent = this
    if (position) {
      piece.options.position = position
    }
    this.children.push(piece)
    this.paste_in(piece)
  }

  paste_in (piece: Piece) {
    iter_2d(piece.options.size, (pos) => {
      const is_wall = piece.walls.get(pos)
      if (!is_wall) {
        this.walls.set(piece.parent_pos(pos), false)
      }
    })
  }

  add_exit (exit: Vector2, room: Piece) {
    this.walls.set(exit, false)
    if (this.parent) {
      this.parent.paste_in(this)
    }
    this.exits.push([exit, room])
  }

  print () {
    for (let y = 0; y < this.options.size[1]; y++) {
      let row = ''
      for (let x = 0; x < this.options.size[0]; x++) {
        if (
          this.start_pos &&
          this.start_pos[0] === x &&
          this.start_pos[1] === y
        ) {
          row += 's'
        } else {
          row += this.walls.get([x, y]) ? 'x' : ' '
        }
      }
      console.log(row)
    }
  }
}
