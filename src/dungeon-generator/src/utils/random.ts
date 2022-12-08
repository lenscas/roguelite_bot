import rng from 'random-seed'
import { Vector2 } from '.'

export default class Random {
  private rng: rng.RandomSeed
  constructor (seed:string | undefined) {
    this.rng = rng.create(seed)
  }

  int(min:number, max:number) {
    return this.rng.intBetween(min, max)
  }

  float (min = 0, max = 1) {
    return this.rng.floatBetween(min, max)
  }

  vec (min:Vector2, max:Vector2):Vector2 {
    // min and max are vectors [int, int];
    // returns [min[0]<=x<=max[0], min[1]<=y<=max[1]]
    return [this.int(min[0], max[0]), this.int(min[1], max[1])]
  }

  choose<T>(items:Array<T>, remove = false) {
    const idx = this.rng.intBetween(0, items.length - 1)
    if (remove) {
      return items.splice(idx, 1)[0]
    } else {
      return items[idx]
    }
  }

  maybe (probability:number) {
    return this.float() <= probability
  }
}
