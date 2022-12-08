import { FACING_TO_MOD } from '../const'

export type Vector2 = [number,number]

export function iter_adjacent ([x, y]:Vector2, cb:(neighbor:Vector2)=>void) {
  cb([x - 1, y])
  cb([x, y - 1])
  cb([x + 1, y])
  cb([x, y + 1])
}

export function iter_2d (size:Vector2, callback:(location:Vector2)=>void) {
  for (let y = 0; y < size[1]; y++) {
    for (let x = 0; x < size[0]; x++) {
      callback([x, y])
    }
  }
}

export function iter_range (from:Vector2, to:Vector2, callback:(location:Vector2)=>void) {
  let fx, fy, tx, ty
  if (from[0] < to[0]) {
    fx = from[0]
    tx = to[0]
  } else {
    fx = to[0]
    tx = from[0]
  }
  if (from[1] < to[1]) {
    fy = from[1]
    ty = to[1]
  } else {
    fy = to[1]
    ty = from[1]
  }
  for (var x = fx; x <= tx; x++) {
    for (var y = fy; y <= ty; y++) {
      callback([x, y])
    }
  }
}

export function intersects (pos_1:Vector2, size_1:Vector2, pos_2:Vector2, size_2:Vector2) {
  return (
    !(pos_2[0] > pos_1[0] + size_1[0] ||
    pos_2[0] + size_2[0] < pos_1[0] ||
    pos_2[1] > pos_1[1] + size_1[1] ||
    pos_2[1] + size_2[1] < size_1[1])
  )
}

export function array_test<T>(array:T[], test:(item:T)=>boolean) {
  for (let i = 0; i < array.length; i++) {
    if (test(array[i])) {
      return true
    }
  }
  return false
}

export function add (p1:Vector2, p2:Vector2):Vector2 {
  return [p1[0] + p2[0], p1[1] + p2[1]]
}

export function shift<T extends keyof typeof FACING_TO_MOD>(pos:Vector2, facing:T) {
  return add(pos, FACING_TO_MOD[facing])
}

export function shift_left<T extends keyof typeof FACING_TO_MOD>(pos:Vector2, facing:T) {
  return shift(pos, ((facing - 90 + 360) % 360) as T)
}

export function shift_right<T extends keyof typeof FACING_TO_MOD>(pos:Vector2, facing:T) {
  return shift(pos, ((facing + 90 + 360) % 360) as T)
}
