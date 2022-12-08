import { create_moderator_command } from '../../command';
import { deleteRoomFromServer, getAllRoomsInServer } from './queries.queries';

export const command = create_moderator_command("cleans up every game that isn't used anymore", {
    config: (x) => x.toJSON(),
    async func({ db, interaction }) {
        const rooms = await getAllRoomsInServer.run({ server_id: interaction.guildId }, db);
        for (const room of rooms) {
            const a = interaction.guild?.channels.cache.get(room.thread_id);
            if (a?.isThread()) {
                if (a.archived) {
                    await deleteRoomFromServer.run({ thread_id: a.id, server_id: interaction.guildId }, db);
                }
            }
        }
        return {
            content: 'Done',
            ephemeral: true,
        };
    },
});
