import Random from '../utils/random'
import Piece, { PieceOptions } from '../pieces/piece'
import Rectangle from '../utils/rectangle'
import { Facing, FACING_INVERSE } from '../const'
import { Vector2 } from '../utils'

export type GeneratorOptions = {seed:string} & PieceOptions

export default abstract class Generator extends Piece {
  random:Random
  seed:string
  minx:number
  maxx:number
  miny:number
  maxy:number
  constructor (options:GeneratorOptions) {
    super(options)
    this.seed = options.seed
    this.random = new Random(this.seed)

    this.start_pos = [0, 0]
    this.minx = this.options.size[0]
    this.maxx = 0
    this.miny = this.options.size[1]
    this.maxy = 0
  }

  add_piece (piece: Piece, position: Vector2 | undefined) {
    super.add_piece(piece, position)

    this.minx = Math.min(this.minx, piece.options.position[0])
    this.maxx = Math.max(this.maxx, piece.options.position[0] + piece.options.size[0])

    this.miny = Math.min(this.miny, piece.options.position[1])
    this.maxy = Math.max(this.maxy, piece.options.position[1] + piece.options.size[1])
  }

  trim () {
    this.options.size = [this.maxx - this.minx, this.maxy - this.miny]
    this.children.forEach((child) => {
      child.options.position = [
        child.options.position[0] - this.minx,
        child.options.position[1] - this.miny
      ]
    })

    this.start_pos = [
      (this.start_pos? this.start_pos[0] : 0)  - this.minx,
      (this.start_pos? this.start_pos[1] : 0) - this.miny
    ]
    this.walls = this.walls.get_square([this.minx, this.miny], this.options.size)

    this.minx = 0
    this.maxx = this.options.size[0]

    this.miny = 0
    this.maxy = this.options.size[1]
  }

  abstract generate ():void

  fits (piece: Piece, position: Vector2) {
    let p, x, y
    for (x = 0; x < piece.options.size[0]; x++) {
      for (y = 0; y < piece.options.size[1]; y++) {
        p = this.walls.get([position[0] + x, position[1] + y])
        if (p === false || p === null || p === undefined) {
          return false
        }
      }
    }
    return true
  }

  join_exits (piece1:Piece, piece1_exit:Vector2,piece2:Piece, piece2_exit:Vector2) {
    /*
        register an exit with each piece, remove intersecting perimeter tiles
        */

    piece1.add_exit(piece1_exit, piece2)
    piece2.add_exit(piece2_exit, piece1)

    const ic = piece1.rect.intersection(piece2.rect)
    if (ic) {
      piece1.remove_perimeter(
        new Rectangle(piece1.local_pos([ic.x, ic.y]), [ic.width, ic.height])
      )
      piece2.remove_perimeter(
        new Rectangle(piece2.local_pos([ic.x, ic.y]), [ic.width, ic.height])
      )
    }
  }

  join (piece1:Piece, piece2_exit:[Vector2,Facing], piece2:Piece, piece1_exit?:[Vector2,Facing]) {
    /*
        join piece 1 to piece2 provided at least one exit.
        piece1 should already be placed
        */

    if (!piece1_exit) {
      const v = piece2_exit[1];
      const x = FACING_INVERSE[v]
      piece1_exit = this.random.choose(
        piece1.get_perimeter_by_facing(x)
      )
    }

    // global piece2 exit pos
    const piece2_exit_pos = piece1.parent_pos(piece1_exit[0])

    // figure out piece2 position
    const piece2_pos:Vector2 = [
      piece2_exit_pos[0] - piece2_exit[0][0],
      piece2_exit_pos[1] - piece2_exit[0][1]
    ]

    if (!this.fits(piece2, piece2_pos)) {
      return false
    }

    this.join_exits(piece1, piece1_exit[0], piece2, piece2_exit[0])
    this.add_piece(piece2, piece2_pos)

    return true
  }

  get_open_pieces (pieces: Piece[]) {
    // filter out pieces
    return pieces.filter((piece) => {
      return piece.exits.length < piece.options.max_exits && piece.perimeter.length
    })
  }
}
