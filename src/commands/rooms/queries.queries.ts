/** Types generated for queries found in "src/commands/rooms/queries.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetGamesChannel' parameters type */
export interface IGetGamesChannelParams {
  server_id: string | null | void;
}

/** 'GetGamesChannel' return type */
export interface IGetGamesChannelResult {
  room_channel_id: string;
}

/** 'GetGamesChannel' query type */
export interface IGetGamesChannelQuery {
  params: IGetGamesChannelParams;
  result: IGetGamesChannelResult;
}

const getGamesChannelIR: any = {"usedParamSet":{"server_id":true},"params":[{"name":"server_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":53,"b":62}]}],"statement":"SELECT room_channel_id\nFROM config\nWHERE server_id = :server_id\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT room_channel_id
 * FROM config
 * WHERE server_id = :server_id
 * LIMIT 1
 * ```
 */
export const getGamesChannel = new PreparedQuery<IGetGamesChannelParams,IGetGamesChannelResult>(getGamesChannelIR);


/** 'JoinPlayer' parameters type */
export interface IJoinPlayerParams {
  pfp: string | null | void;
  server_id: string | null | void;
  thread_id: string | null | void;
  user_id: string | null | void;
}

/** 'JoinPlayer' return type */
export type IJoinPlayerResult = void;

/** 'JoinPlayer' query type */
export interface IJoinPlayerQuery {
  params: IJoinPlayerParams;
  result: IJoinPlayerResult;
}

const joinPlayerIR: any = {"usedParamSet":{"server_id":true,"thread_id":true,"user_id":true,"pfp":true},"params":[{"name":"server_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":93,"b":102}]},{"name":"thread_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":109,"b":118}]},{"name":"user_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":125,"b":132}]},{"name":"pfp","required":false,"transform":{"type":"scalar"},"locs":[{"a":139,"b":142}]}],"statement":"INSERT INTO joined_players \n(\n    server_id,\n    thread_id,\n    user_id,image\n)\nVALUES (\n    :server_id,\n    :thread_id,\n    :user_id,\n    :pfp\n)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO joined_players 
 * (
 *     server_id,
 *     thread_id,
 *     user_id,image
 * )
 * VALUES (
 *     :server_id,
 *     :thread_id,
 *     :user_id,
 *     :pfp
 * )
 * ```
 */
export const joinPlayer = new PreparedQuery<IJoinPlayerParams,IJoinPlayerResult>(joinPlayerIR);


/** 'GetGame' parameters type */
export interface IGetGameParams {
  server_id: string | null | void;
  thread_id: string | null | void;
}

/** 'GetGame' return type */
export interface IGetGameResult {
  has_started: boolean;
  owner: string;
}

/** 'GetGame' query type */
export interface IGetGameQuery {
  params: IGetGameParams;
  result: IGetGameResult;
}

const getGameIR: any = {"usedParamSet":{"server_id":true,"thread_id":true},"params":[{"name":"server_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":64,"b":73}]},{"name":"thread_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":101,"b":110}]}],"statement":"SELECT owner,has_started\nFROM rooms\nWHERE\n    rooms.server_id = :server_id\nAND\n    rooms.thread_id = :thread_id"};

/**
 * Query generated from SQL:
 * ```
 * SELECT owner,has_started
 * FROM rooms
 * WHERE
 *     rooms.server_id = :server_id
 * AND
 *     rooms.thread_id = :thread_id
 * ```
 */
export const getGame = new PreparedQuery<IGetGameParams,IGetGameResult>(getGameIR);


/** 'StartGame' parameters type */
export interface IStartGameParams {
  server_id: string | null | void;
  thread_id: string | null | void;
}

/** 'StartGame' return type */
export type IStartGameResult = void;

/** 'StartGame' query type */
export interface IStartGameQuery {
  params: IStartGameParams;
  result: IStartGameResult;
}

const startGameIR: any = {"usedParamSet":{"server_id":true,"thread_id":true},"params":[{"name":"server_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":65,"b":74}]},{"name":"thread_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":102,"b":111}]}],"statement":"UPDATE rooms \nSET has_started = TRUE\nWHERE\n    rooms.server_id = :server_id\nAND\n    rooms.thread_id = :thread_id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE rooms 
 * SET has_started = TRUE
 * WHERE
 *     rooms.server_id = :server_id
 * AND
 *     rooms.thread_id = :thread_id
 * ```
 */
export const startGame = new PreparedQuery<IStartGameParams,IStartGameResult>(startGameIR);


/** 'CreateRoom' parameters type */
export interface ICreateRoomParams {
  name: string | null | void;
  owner_id: string | null | void;
  room_id: string | null | void;
  server_id: string | null | void;
}

/** 'CreateRoom' return type */
export type ICreateRoomResult = void;

/** 'CreateRoom' query type */
export interface ICreateRoomQuery {
  params: ICreateRoomParams;
  result: ICreateRoomResult;
}

const createRoomIR: any = {"usedParamSet":{"server_id":true,"room_id":true,"name":true,"owner_id":true},"params":[{"name":"server_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":86,"b":95}]},{"name":"room_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":102,"b":109}]},{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":116,"b":120}]},{"name":"owner_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":127,"b":135}]}],"statement":"INSERT INTO rooms \n(\n    server_id,\n    thread_id,\n    name,\n    owner\n)\nVALUES\n(\n    :server_id,\n    :room_id,\n    :name,\n    :owner_id\n)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO rooms 
 * (
 *     server_id,
 *     thread_id,
 *     name,
 *     owner
 * )
 * VALUES
 * (
 *     :server_id,
 *     :room_id,
 *     :name,
 *     :owner_id
 * )
 * ```
 */
export const createRoom = new PreparedQuery<ICreateRoomParams,ICreateRoomResult>(createRoomIR);


