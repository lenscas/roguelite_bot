import DungeonGenerator from '2d-dungeon';
import { BigArray } from '../bigArray';
//import { dungeon_to_text } from './create_dungeon';
import sharp, { OverlayOptions } from 'sharp';
import conf from '../../config.json';
import { IDB } from '../db';
import { createFloor, getFloorLayout } from './queries.queries';

const dungeon_tiles = {
    ' ': 'floor',
    w: 'wall',
    v: 'void',
    s: 'start',
} as const;

export type DungeonTile = keyof typeof dungeon_tiles;
export type DungeonTileTypes = typeof dungeon_tiles[DungeonTile];

export type DungeonRow = BigArray<DungeonTile>;
export type ExportedDungeon = BigArray<DungeonRow>;

export type DungeonDbParams = {
    thread_id: string;
    server_id: string;
    floor: number;
};

export class Dungeon {
    private dungeon: ExportedDungeon;
    private params: DungeonDbParams;
    private constructor(d: ExportedDungeon, params: DungeonDbParams) {
        this.dungeon = d;
        this.params = params;
    }
    static async fromDB(db: IDB, params: DungeonDbParams): Promise<Dungeon> {
        const layout = await getFloorLayout.run(params, db);
        const parsed = text_to_dungeon(layout[0].floor_layout);
        return new Dungeon(parsed, params);
    }
    static async generateNew(db: IDB, params: DungeonDbParams): Promise<Dungeon> {
        const res = await create_dungeon();
        const as_text = dungeon_to_text(res);
        createFloor.run({ ...params, floor_layout: as_text }, db);
        return new Dungeon(res, params);
    }
    toString = (): string => dungeon_to_text(this.dungeon);
    toText = (): string => this.dungeon.map((x) => x.join('')).join('\n');
    toImage = (): Promise<Buffer> => exported_dungeon_to_image(this.dungeon);
}

function is_dungeon_tile(tile: string): tile is DungeonTile {
    return tile in dungeon_tiles;
}

function text_to_dungeon(serialized_dungeon: string): ExportedDungeon {
    const dungeon: ExportedDungeon = new BigArray();
    let row: DungeonRow = new BigArray();
    for (const tile of serialized_dungeon) {
        if (tile == '\n') {
            dungeon.push(row);
            row = new BigArray();
        } else if (is_dungeon_tile(tile)) {
            row.push(tile);
        } else {
            throw new TypeError('Found invalid character during deserialzing. Found character ' + tile);
        }
    }
    return dungeon;
}
function dungeon_to_text(dungeon: ExportedDungeon): string {
    return dungeon.map((x) => x.join('')).join('\n');
}

const create_dungeon = async (): Promise<ExportedDungeon> => {
    const dungeon2 = new DungeonGenerator({ size: [300, 150], symmetric_rooms: false });
    dungeon2.generate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dungeon = dungeon2 as any;
    const dungeon_layout: ExportedDungeon = new BigArray();
    for (let y = 0; y < dungeon.size[1]; y++) {
        const row: DungeonRow = new BigArray();
        for (let x = 0; x < dungeon.size[0]; x++) {
            if (dungeon.start_pos && dungeon.start_pos[0] === x && dungeon.start_pos[1] === y) {
                row.push('s');
            } else {
                row.push(dungeon.walls.get([x, y]) ? 'w' : ' ');
            }
        }
        dungeon_layout.push(row);
    }
    const double = await double_text_based_dungeon(dungeon_layout);
    return clean_up_dungeon(double);
};

const double_text_based_dungeon = async (dungeon: ExportedDungeon): Promise<ExportedDungeon> => {
    return dungeon.AsyncSlowFlatMap(async (row) => {
        const doubled_row = await row.slowFlatMap((tile) => [tile, tile], row.length / 8);
        return [doubled_row, doubled_row];
    }, dungeon.length);
};

export const get_neighbours = (
    dungeon: ExportedDungeon,
    toCheckX: number,
    toCheckY: number,
): Array<DungeonTile | undefined> => {
    return [
        dungeon[toCheckX + 1] ? dungeon[toCheckX + 1][toCheckY] : undefined,
        dungeon[toCheckX - 1] ? dungeon[toCheckX - 1][toCheckY] : undefined,
        dungeon[toCheckX][toCheckY + 1],
        dungeon[toCheckX][toCheckY - 1],
    ];
};

type Vector2 = [number, number];

const compareNeighbours = (dungeon: ExportedDungeon, location: Vector2, check: (a: DungeonTile) => boolean) => {
    return get_neighbours(dungeon, location[0], location[1])
        .map((x) => x || 'w')
        .map(check)
        .every((x) => x);
};

export const clean_up_dungeon = async (dungeon: ExportedDungeon): Promise<ExportedDungeon> => {
    return await dungeon.asyncSlowMap(async (row, x) => {
        return await row.slowMap((tile, y) => {
            if (tile == 'w') {
                const surroundedByWalls = compareNeighbours(dungeon, [x, y], (tile) => tile == 'v' || tile == 'w');
                if (surroundedByWalls) {
                    return 'v';
                } else {
                    return 'w';
                }
            }
            return tile;
        }, row.length / 2);
    }, dungeon.length);
};

export const IsNever = (x: never): never => {
    throw new Error('IsNever got called. Got value: ' + x);
};

const exported_dungeon_to_image = async (dungeon: ExportedDungeon): Promise<Buffer> => {
    const images = await split_image();
    const size = conf.tile_config.size;

    const config: OverlayOptions[] = (
        await dungeon.slowFlatMap(
            (row, y) =>
                row
                    .map((tile) => {
                        return images[dungeon_tiles[tile]][0];
                    })
                    .map((tile, x) => ({ tile, y, x })),
            dungeon.length,
        )
    ).map((x) => {
        return {
            left: x.x * size,
            top: x.y * size,
            input: x.tile,
            //raw: { height: size, width: size, channels: 3 },
        };
    });
    return await sharp({
        create: {
            background: { r: 0, g: 0, b: 0 },
            channels: 3,
            height: dungeon.length * size,
            width: dungeon[0].length * size,
        },
        unlimited: true,
    })
        .composite(config)
        .png()
        .toBuffer();
};

const extract = async (picture_location: string, locations: number[][]) => {
    const size = conf.tile_config.size;
    // const res: Array<Buffer> = [];
    // for (const tile of locations) {
    //     const b = sharp('./assets/dungeon.png');
    //     res.push(
    //         await b
    //             .extract({
    //                 top: size * tile[1],
    //                 left: size * tile[0],
    //                 width: size,
    //                 height: size,
    //             })
    //             .toBuffer(),
    //     );
    // }
    // return res;
    return Promise.all(
        locations.map((tile) => {
            const a = sharp(picture_location);

            return a
                .extract({
                    top: size * tile[1],
                    left: size * tile[0],
                    width: size,
                    height: size,
                })
                .toBuffer();
        }),
    );
};

const split_image = async () => {
    //const v = sharp('./assets/dungeon.png');
    const voids = await extract('./assets/dungeon.png', conf.tile_config.locations.void);
    console.log('starting walls');
    const wall = await extract('./assets/dungeon.png', conf.tile_config.locations.wall);
    console.log('starting foors');
    const floor = await extract('./assets/dungeon.png', conf.tile_config.locations.floor);
    const res: Record<DungeonTileTypes, Buffer[]> = { void: voids, wall, floor, start: floor };
    return res;
};
