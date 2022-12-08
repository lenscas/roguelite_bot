import Generator, { GeneratorOptions } from './generator'
import Corridor from '../pieces/corridor'
import Room from '../pieces/room'
import { Facing, FACING } from '../const'
import { shift_left, shift_right, shift, Vector2 } from '../utils'
import Piece, { PieceOptions } from '../pieces/piece'

export type RoomDefinition = {
  min_size: Vector2;
  max_size: Vector2;
  max_exits: number;
  position?: Vector2; //OPTIONAL pos of initial room
};
export type RoomTagBase = 'any' | 'initial';
export type DungeonParameters<T extends string> = {
  size: [number, number];
  rooms: Record<T,RoomDefinition> & Record<RoomTagBase, RoomDefinition>;
  max_corridor_length: number;
  min_corridor_length: number;
  corridor_density: number; //corridors per room
  symmetric_rooms: false; // exits must be in the center of a wall if true
  interconnects: number; //extra corridors to connect rooms and make circular paths. not 100% guaranteed
  max_interconnect_length: number;
  room_count: number;
  max_iterations:number
} & GeneratorOptions;
export type Exit = {
  x: number;
  y: number;
  dest_piece: Piece;
};

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

function makeid(length:number) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const getDefaults= <T extends string>():DungeonParameters<T>=>{
  const rooms : Record<RoomTagBase,RoomDefinition> = {
    initial: {
      min_size: [3, 3],
      max_size: [3, 3],
      max_exits: 1
    },
    any: {
      min_size: [2, 2],
      max_size: [5, 5],
      max_exits: 4
    }
  }
  const v:DungeonParameters<T | RoomTagBase> = {
    max_exits:2,
    parent:null,
    position:[0,0],
    seed:makeid(5),
    tag:makeid(3),
    max_iterations: 100,
    size: [150, 150],
    rooms: rooms as DungeonParameters<T>["rooms"],
    max_corridor_length: 8,
    min_corridor_length: 4,
    corridor_density: 0.5, // corridors per room
    symmetric_rooms: false, // exits must be in the middle of walls
    interconnects: 2, // extra corridors to connect rooms and make circular paths. not guaranteed
    max_interconnect_length: 10,
    room_count: 10
  }
  return v
}

export default class Dungeon2<T extends string> extends Generator {
  room_tags:Array<RoomTagBase | T>
  rooms:Array<unknown>
  corridors:Array<unknown>
  options: DungeonParameters<T>
  initial_room?: Room 
  constructor (options:DeepPartial<DungeonParameters<T>>) {
    const defaults = getDefaults<T>()
    const a:DungeonParameters<T> = Object.assign(
      {},
      defaults,
      options
    )

    super(a)
    this.options = a
    this.room_tags = Object.keys(a.rooms).filter(
      (tag) => tag !== 'any' && tag !== 'initial'
    ).map(x=>x as T)

    for (let i = this.room_tags.length; i < a.room_count; i++) {
      this.room_tags.push('any')
    }

    this.rooms = []
    this.corridors = []
  }

  add_room (room: Piece, exit?: [Vector2, Facing] | null | undefined, add_to_room:Corridor | null = null) {
    // add a new piece, exit is local perimeter pos for that exit;
    let choices, old_room
    // pick a placed room to connect this piece to
    if (add_to_room) {
      old_room = add_to_room
      add_to_room = null
    } else {
      choices = this.get_open_pieces(this.children)
      if (choices && choices.length) {
        old_room = this.random.choose(choices)
      } else {
        console.log('ran out of choices connecting')
        return false
      }
    }

    // if exit is specified, try joining  to this specific exit
    if (exit) {
      // try joining the rooms
      if (this.join(old_room, exit, room)) {
        return true
      }
      // else try all perims to see
    } else {
      const perim = room.perimeter.slice()
      while (perim.length) {
        if (this.join(old_room, this.random.choose(perim, true), room)) {
          return true
        }
      }
    }

    return false
  }

  new_corridor () {
    return new Corridor({
      symmetric:false,
      length: this.random.int(
        this.options.min_corridor_length,
        this.options.max_corridor_length
      ),
      facing: this.random.choose(FACING)
    })
  }

  add_interconnect () {
    const perims:{[Key:string]:[[Vector2,Facing],Piece]} = {}
    let hash:string
    let exit:[Vector2,Facing]
    let p:Vector2

    // hash all possible exits
    this.children.forEach((child) => {
      if (child.exits.length < child.options.max_exits) {
        child.perimeter.forEach((exit) => {
          p = child.parent_pos(exit[0])
          hash = `${p[0]}_${p[1]}`
          perims[hash] = [exit, child]
        })
      }
    })

    // search each room for a possible interconnect, backwards
    let room, length, corridor, room2
    for (let i = this.children.length - 1; i--; i >= 0) {
      room = this.children[i]

      // if room has exits available
      if (room.exits.length < room.options.max_exits) {
        // iterate exits
        for (let k = 0; k < room.perimeter.length; k++) {
          exit = room.perimeter[k]
          p = room.parent_pos(exit[0])
          length = -1

          // try to dig a tunnel from this exit and see if it hits anything
          while (length <= this.options.max_interconnect_length) {
            // check if space is not occupied
            if (
              !this.walls.get(p) ||
              !this.walls.get(shift_left(p, exit[1])) ||
              !this.walls.get(shift_right(p, exit[1]))
            ) {
              break
            }
            hash = `${p[0]}_${p[1]}`

            // is there a potential exit at these coordiantes (not of the same room)
            if (perims[hash] && perims[hash][1].id !== room.id) {
              room2 = perims[hash][1]

              // rooms cant be joined directly, add a corridor
              if (length > -1) {
                corridor = new Corridor({
                  length,
                  facing: exit[1]
                })

                if (this.join(room, corridor.perimeter[0], corridor, exit)) {
                  const a =perims[hash][0]
                  this.join_exits(
                    room2,
                    a[0],
                    corridor,
                    corridor.perimeter[corridor.perimeter.length - 1][0]
                  )
                  return true
                } else {
                  return false
                }
                // rooms can be joined directly
              } else {
                this.join_exits(room2, perims[hash][0][0], room, exit[0])
                return true
              }
            }

            // exit not found, try to make the interconnect longer
            p = shift(p, exit[1])
            length++
          }
        }
      }
    }
  }

  new_room (key?:T | RoomTagBase) {
    // spawn next room
    key = key || this.random.choose<T | RoomTagBase>(this.room_tags, false)

    const opts = this.options.rooms[key]

    const room = new Room({
      size: this.random.vec(opts.min_size, opts.max_size),
      max_exits: opts.max_exits,
      symmetric: this.options.symmetric_rooms,
      tag: key
    })

    this.room_tags.splice(this.room_tags.indexOf(key), 1)

    if (key === 'initial') {
      this.initial_room = room
    }
    return room
  }

  generate () {
    let no_rooms = this.options.room_count - 1
    const room = this.new_room(
      this.options.rooms.initial ? 'initial' : undefined
    )
    let no_corridors = Math.round(this.options.corridor_density * no_rooms)

    this.add_piece(
      room,
      this.options.rooms.initial && this.options.rooms.initial.position
        ? this.options.rooms.initial.position
        : this.get_center_pos()
    )

    let k
    let iterations = this.options.max_iterations

    while ((no_corridors || no_rooms) && --iterations) {
      k = this.random.int(1, no_rooms + no_corridors)
      if (k <= no_corridors) {
        const corridor = this.new_corridor()
        const added = this.add_room(corridor, corridor.perimeter[0])
        no_corridors--

        // try to connect to this corridor next
        if (no_rooms > 0 && added) {
          this.add_room(this.new_room(), null, corridor)
          no_rooms--
        }
      } else {
        this.add_room(this.new_room())
        no_rooms--
      }
    }

    for (k = 0; k < this.options.interconnects; k++) {
      this.add_interconnect()
    }

    this.trim()

    if (this.initial_room) {
      this.start_pos = this.initial_room.global_pos(
        this.initial_room.get_center_pos()
      )
    }

    return iterations > 0
  }
}
