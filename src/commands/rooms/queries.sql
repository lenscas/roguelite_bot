/* @name get_games_channel */
SELECT room_channel_id
FROM config
WHERE server_id = :server_id
LIMIT 1;


/* @name join_player */
INSERT INTO joined_players 
(
    server_id,
    thread_id,
    user_id,image
)
VALUES (
    :server_id,
    :thread_id,
    :user_id,
    :pfp
);

/* @name get_game */
SELECT owner,has_started
FROM rooms
WHERE
    rooms.server_id = :server_id
AND
    rooms.thread_id = :thread_id;

/* @name start_game */
UPDATE rooms 
SET has_started = TRUE
WHERE
    rooms.server_id = :server_id
AND
    rooms.thread_id = :thread_id;

/* @name create_room */
INSERT INTO rooms 
(
    server_id,
    thread_id,
    name,
    owner
)
VALUES
(
    :server_id,
    :room_id,
    :name,
    :owner_id
);
