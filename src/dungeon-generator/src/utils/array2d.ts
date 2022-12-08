import { Vector2 } from "."

export default class Array2d<T> {
  private rows:Array<Array<T | null>>
  private size: Array<number>
  constructor (size = [0, 0], default_value:T | null = null) {
    this.rows = []
    this.size = []

    for (let y = 0; y < size[1]; y++) {
      const row = []
      for (let x = 0; x < size[0]; x++) {
        row.push(default_value)
      }
      this.rows.push(row)
    }
  }

  iter (callback:(location:Vector2, item:T | null)=>void, context?:any) {
    for (let y = 0; y < this.size[1]; y++) {
      for (let x = 0; x < this.size[0]; x++) {
        callback.apply(context, [[x, y], this.get([x, y])])
      }
    }
  }

  get ([x, y]:Vector2) {
    if (this.rows[y] === undefined) {
      return null
    }
    return this.rows[y][x]
  }

  set ([x, y]:Vector2, val:T) {
    if(!this.rows[y]){
      this.rows[y] = []
    }
    this.rows[y][x] = val
  }

  set_horizontal_line ([start_x, start_y]:Vector2, delta_x:number, val:T) {
    const c = Math.abs(delta_x)
    const mod = delta_x < 0 ? -1 : 1

    for (let x = 0; x <= c; x++) {
      this.set([start_x + x * mod, start_y], val)
    }
  }

  set_vertical_line ([start_x, start_y]:Vector2, delta_y:number, val:T) {
    const c = Math.abs(delta_y)
    const mod = delta_y < 0 ? -1 : 1

    for (let y = 0; y <= c; y++) {
      this.set([start_x, start_y + y * mod], val)
    }
  }

  get_square ([x, y]:Vector2, [size_x, size_y]:Vector2):Array2d<T> {
    const retv = new Array2d<T>([size_x, size_y])
    for (let dx = 0; dx < size_x; dx++) {
      for (let dy = 0; dy < size_y; dy++) {
        const v = this.get([x + dx, y + dy])
        if(v === null){
          throw new RangeError("Tried to get a value outside the current range")
        }
        retv.set([dx, dy], v)
      }
    }
    return retv
  }

  set_square ([x, y]:Vector2, [size_x, size_y]:Vector2, val:T, fill = false) {
    if (!fill) {
      this.set_horizontal_line([x, y], size_x - 1, val)
      this.set_horizontal_line([x, y + size_y - 1], size_x - 1, val)
      this.set_vertical_line([x, y], size_y - 1, val)
      this.set_vertical_line([x + size_x - 1, y], size_y - 1, val)
    } else {
      for (let dx = 0; dx < size_x; dx++) {
        for (let dy = 0; dy < size_y; dy++) {
          this.set([x + dx, y + dy], val)
        }
      }
    }
  }
}
