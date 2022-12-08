CREATE TABLE public.rooms (
	server_id bigint NOT NULL,
	thread_id bigint NOT NULL,
	name varchar NOT NULL,
	owner bigint NOT NULL,
	last_mutation date NOT NULL DEFAULT NOW(),
	CONSTRAINT rooms_pk PRIMARY KEY (server_id,thread_id),
	CONSTRAINT rooms_un UNIQUE (server_id,name)
);
CREATE TABLE public.config (
	server_id bigint NOT NULL,
	room_channel_id bigint NOT NULL,
	CONSTRAINT config_pk PRIMARY KEY (server_id)
);

CREATE TABLE public.joined_players (
	server_id bigint NOT NULL,
	thread_id bigint NOT NULL,
	user_id bigint NOT NULL,
	CONSTRAINT joinedpeople_pk PRIMARY KEY (server_id,thread_id,user_id),
	CONSTRAINT joinedpeople_fk FOREIGN KEY (server_id,thread_id) REFERENCES public.rooms(server_id,thread_id)
);
ALTER TABLE public.joined_players ADD image varchar NOT NULL;


ALTER TABLE public.rooms ADD has_started bool NOT NULL DEFAULT FALSE;

CREATE TABLE public.floor (
	server_id bigint NOT NULL,
	thread_id bigint NOT NULL,
	floor int NOT NULL,
	floor_layout varchar NOT NULL,
	CONSTRAINT floor_pk PRIMARY KEY (server_id,thread_id,floor),
	CONSTRAINT floor_fk FOREIGN KEY (server_id,thread_id) REFERENCES public.rooms(server_id,thread_id)
);

CREATE TABLE public.npc (
	server_id bigint NOT NULL,
	thread_id bigint NOT NULL,
	floor int NOT NULL,
	"name" varchar NOT NULL,
	action_cooldown int NOT NULL,
	id bigserial NOT NULL,
	CONSTRAINT npc_pk PRIMARY KEY (id),
	CONSTRAINT npc_fk FOREIGN KEY (server_id,thread_id,floor) REFERENCES public.floor(server_id,thread_id,floor)
);
CREATE INDEX npc_action_cooldown_idx ON public.player_characters (action_cooldown);

CREATE TABLE public.player_characters (
	server_id int8 NOT NULL,
	thread_id int8 NOT NULL,
	floor int4 NOT NULL,
	"name" varchar NOT NULL,
	action_cooldown int4 NOT NULL,
	id bigserial NOT NULL,
	user_id bigint NOT NULL,
	CONSTRAINT player_characters_pk PRIMARY KEY (id),
	CONSTRAINT player_characters_fk FOREIGN KEY (server_id,thread_id,floor) REFERENCES public.floor(server_id,thread_id,floor),
	CONSTRAINT player_characters_fk_1 FOREIGN KEY (server_id,thread_id,user_id) REFERENCES public.joined_players(server_id,thread_id,user_id)
);
CREATE INDEX player_characters_action_cooldown_idx ON public.player_characters (action_cooldown);

-- public.characters_on_floor source

CREATE OR REPLACE VIEW public.characters_on_floor
AS SELECT characters.server_id,
    characters.thread_id,
    characters.floor,
    characters.action_cooldown
   FROM ( SELECT npc.server_id,
            npc.thread_id,
            npc.floor,
            npc.action_cooldown,
            npc.image
           FROM npc
        UNION
         SELECT pc.server_id,
            pc.thread_id,
            pc.floor,
            pc.action_cooldown,
            joined_players.image
           FROM player_characters pc
           inner join joined_players
           on
                joined_players.server_id = pc.server_id
            AND
                joined_players.thread_id = pc.thread_id
            AND
                joined_players.user_id = pc.user_id
   ) characters
  ORDER BY characters.action_cooldown;
