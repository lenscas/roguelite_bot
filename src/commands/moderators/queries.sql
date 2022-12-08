/* @name setup_server */
INSERT INTO config (server_id,room_channel_id) VALUES (:server_id, :room_channel_id)
ON CONFLICT ON CONSTRAINT config_pk
DO
UPDATE SET room_channel_id=:room_channel_id;

/* @name get_all_rooms_in_server */
SELect thread_id
FROM rooms
WHERE rooms.server_id = :server_id;

/* @name delete_room_from_server */
DELETE FROM rooms
WHERE 
    rooms.server_id = :server_id
AND
    rooms.thread_id = :thread_id;
