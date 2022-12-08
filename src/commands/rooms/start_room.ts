import { create_command } from '../../command';
import { getGame, startGame } from './queries.queries';
import { Dungeon } from '../../dungeon_logic/dungeon';

export const command = create_command('Starts the room from the current thread.', {
    config: (x) => x.toJSON(),
    async func({ db, interaction }) {
        if (!interaction.guildId) {
            return {
                content: 'This command only works in servers',
            };
        }
        if (!interaction.channelId) {
            return {
                content: 'Interaction did not contain a channel id. Permission problem?',
            };
        }
        const [guildId, channelId] = [interaction.guildId, interaction.channelId];
        const game = await getGame
            .run({ thread_id: interaction.channelId, server_id: interaction.guildId }, db)
            .then((x) => x[0]);
        if (!game) {
            return {
                content: 'Could not find the game belonging to this thread.',
                ephemeral: true,
            };
        }
        if (game.owner != interaction.user.id) {
            return {
                content: 'Only the owner of this game can start it. You are not.',
                ephemeral: true,
            };
        }
        if (game.has_started) {
            return {
                content: 'Game has already started',
                ephemeral: true,
            };
        }
        await interaction.deferReply();
        try {
            return await db.startTransaction(async (db) => {
                await startGame.run({ server_id: guildId, thread_id: channelId }, db);
                const dungeon = await Dungeon.generateNew(db, {
                    floor: 1,
                    server_id: guildId,
                    thread_id: channelId,
                });
                return {
                    files: [
                        {
                            attachment: await dungeon.toImage(),
                            name: 'dungeon.png',
                        },
                    ],
                };
            });
        } catch (e) {
            console.log(e);
            return {
                content: 'Something has gone wrong while trying to start the game. Try again later',
                ephemeral: true,
            };
        }
    },
});
