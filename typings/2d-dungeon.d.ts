declare module '2d-dungeon' {
    export type RoomDefinition = {
        min_size: [number, number];
        max_size: [number, number];
        max_exits: number;
        position?: [number, number]; //OPTIONAL pos of initial room
    };
    export type RoomKind = 'any' | 'initial';
    export type DungeonParameters = {
        size?: [number, number];
        seed?: string;
        rooms?: { [RoomKind]: RoomDefinition };
        max_corridor_length?: number;
        min_corridor_length?: number;
        corridor_density?: number; //corridors per room
        symmetric_rooms?: false; // exits must be in the center of a wall if true
        interconnects?: number; //extra corridors to connect rooms and make circular paths. not 100% guaranteed
        max_interconnect_length?: number;
        room_count?: number;
    };

    export type Walls = {
        get = ([number, number]) => boolean;
    };
    export type Exit = {
        x: number;
        y: number;
        dest_piece: Piece;
    };

    export type Piece = {
        position: [number, number];
        tag: RoomKind;
        size: [number, number];
        walls: Walls;
        exits: [Exit];
    };
    export default class Dungeon {
        public size: [number, number];
        public walls: Walls;
        public pieces: [Piece];
        public initial_room: Piece;
        public start_pos: [number, number];
        public constructor(props: DungeonParameters);
        public generate: () => void;
        public print: () => void;
    }
}
