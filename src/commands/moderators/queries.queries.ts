/** Types generated for queries found in "src/commands/moderators/queries.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'SetupServer' parameters type */
export interface ISetupServerParams {
  room_channel_id: string | null | void;
  server_id: string | null | void;
}

/** 'SetupServer' return type */
export type ISetupServerResult = void;

/** 'SetupServer' query type */
export interface ISetupServerQuery {
  params: ISetupServerParams;
  result: ISetupServerResult;
}

const setupServerIR: any = {"usedParamSet":{"server_id":true,"room_channel_id":true},"params":[{"name":"server_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":55,"b":64}]},{"name":"room_channel_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":67,"b":82},{"a":151,"b":166}]}],"statement":"INSERT INTO config (server_id,room_channel_id) VALUES (:server_id, :room_channel_id)\nON CONFLICT ON CONSTRAINT config_pk\nDO\nUPDATE SET room_channel_id=:room_channel_id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO config (server_id,room_channel_id) VALUES (:server_id, :room_channel_id)
 * ON CONFLICT ON CONSTRAINT config_pk
 * DO
 * UPDATE SET room_channel_id=:room_channel_id
 * ```
 */
export const setupServer = new PreparedQuery<ISetupServerParams,ISetupServerResult>(setupServerIR);


/** 'GetAllRoomsInServer' parameters type */
export interface IGetAllRoomsInServerParams {
  server_id: string | null | void;
}

/** 'GetAllRoomsInServer' return type */
export interface IGetAllRoomsInServerResult {
  thread_id: string;
}

/** 'GetAllRoomsInServer' query type */
export interface IGetAllRoomsInServerQuery {
  params: IGetAllRoomsInServerParams;
  result: IGetAllRoomsInServerResult;
}

const getAllRoomsInServerIR: any = {"usedParamSet":{"server_id":true},"params":[{"name":"server_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":52,"b":61}]}],"statement":"SELect thread_id\nFROM rooms\nWHERE rooms.server_id = :server_id"};

/**
 * Query generated from SQL:
 * ```
 * SELect thread_id
 * FROM rooms
 * WHERE rooms.server_id = :server_id
 * ```
 */
export const getAllRoomsInServer = new PreparedQuery<IGetAllRoomsInServerParams,IGetAllRoomsInServerResult>(getAllRoomsInServerIR);


/** 'DeleteRoomFromServer' parameters type */
export interface IDeleteRoomFromServerParams {
  server_id: string | null | void;
  thread_id: string | null | void;
}

/** 'DeleteRoomFromServer' return type */
export type IDeleteRoomFromServerResult = void;

/** 'DeleteRoomFromServer' query type */
export interface IDeleteRoomFromServerQuery {
  params: IDeleteRoomFromServerParams;
  result: IDeleteRoomFromServerResult;
}

const deleteRoomFromServerIR: any = {"usedParamSet":{"server_id":true,"thread_id":true},"params":[{"name":"server_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":47,"b":56}]},{"name":"thread_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":84,"b":93}]}],"statement":"DELETE FROM rooms\nWHERE \n    rooms.server_id = :server_id\nAND\n    rooms.thread_id = :thread_id"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM rooms
 * WHERE 
 *     rooms.server_id = :server_id
 * AND
 *     rooms.thread_id = :thread_id
 * ```
 */
export const deleteRoomFromServer = new PreparedQuery<IDeleteRoomFromServerParams,IDeleteRoomFromServerResult>(deleteRoomFromServerIR);


