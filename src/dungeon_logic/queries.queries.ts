/** Types generated for queries found in "src/dungeon_logic/queries.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'CreateFloor' parameters type */
export interface ICreateFloorParams {
  floor: number | null | void;
  floor_layout: string | null | void;
  server_id: string | null | void;
  thread_id: string | null | void;
}

/** 'CreateFloor' return type */
export type ICreateFloorResult = void;

/** 'CreateFloor' query type */
export interface ICreateFloorQuery {
  params: ICreateFloorParams;
  result: ICreateFloorResult;
}

const createFloorIR: any = {"usedParamSet":{"server_id":true,"thread_id":true,"floor":true,"floor_layout":true},"params":[{"name":"server_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":118,"b":127}]},{"name":"thread_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":134,"b":143}]},{"name":"floor","required":false,"transform":{"type":"scalar"},"locs":[{"a":150,"b":155}]},{"name":"floor_layout","required":false,"transform":{"type":"scalar"},"locs":[{"a":162,"b":174}]}],"statement":"INSERT INTO floor \n    (\n        server_id,\n        thread_id,\n        floor,\n        floor_layout\n    )\nVALUES (\n    :server_id,\n    :thread_id,\n    :floor,\n    :floor_layout\n)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO floor 
 *     (
 *         server_id,
 *         thread_id,
 *         floor,
 *         floor_layout
 *     )
 * VALUES (
 *     :server_id,
 *     :thread_id,
 *     :floor,
 *     :floor_layout
 * )
 * ```
 */
export const createFloor = new PreparedQuery<ICreateFloorParams,ICreateFloorResult>(createFloorIR);


/** 'GetFloorLayout' parameters type */
export interface IGetFloorLayoutParams {
  floor: number | null | void;
  server_id: string | null | void;
  thread_id: string | null | void;
}

/** 'GetFloorLayout' return type */
export interface IGetFloorLayoutResult {
  floor_layout: string;
}

/** 'GetFloorLayout' query type */
export interface IGetFloorLayoutQuery {
  params: IGetFloorLayoutParams;
  result: IGetFloorLayoutResult;
}

const getFloorLayoutIR: any = {"usedParamSet":{"server_id":true,"thread_id":true,"floor":true},"params":[{"name":"server_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":59,"b":68}]},{"name":"thread_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":96,"b":105}]},{"name":"floor","required":false,"transform":{"type":"scalar"},"locs":[{"a":129,"b":134}]}],"statement":"SELECT floor_layout\nFROM floor\nWHERE\n    floor.server_id = :server_id\nAND\n    floor.thread_id = :thread_id\nAND\n    floor.floor = :floor"};

/**
 * Query generated from SQL:
 * ```
 * SELECT floor_layout
 * FROM floor
 * WHERE
 *     floor.server_id = :server_id
 * AND
 *     floor.thread_id = :thread_id
 * AND
 *     floor.floor = :floor
 * ```
 */
export const getFloorLayout = new PreparedQuery<IGetFloorLayoutParams,IGetFloorLayoutResult>(getFloorLayoutIR);


