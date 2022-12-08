/* plpgsql-language-server:use-query-parameter */
/* @name create_floor */
INSERT INTO floor 
    (
        server_id,
        thread_id,
        floor,
        floor_layout
    )
VALUES (
    :server_id,
    :thread_id,
    :floor,
    :floor_layout
);

/* @name get_floor_layout */
SELECT floor_layout
FROM floor
WHERE
    floor.server_id = :server_id
AND
    floor.thread_id = :thread_id
AND
    floor.floor = :floor
;


