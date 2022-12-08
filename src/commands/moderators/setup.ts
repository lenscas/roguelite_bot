import { ChannelType } from 'discord-api-types/v10';
import { create_moderator_command } from '../../command';
import { setupServer } from './queries.queries';

export const command = create_moderator_command('Sets up the basic configuration needed to use this bot', {
    config: (x) =>
        x
            .addChannelOption((x) =>
                x
                    .addChannelTypes(ChannelType.GuildText)
                    .setDescription('Channel used to play games')
                    .setRequired(true)
                    .setName('room_channel'),
            )
            .toJSON(),
    func: async ({ db, interaction }) => {
        const room = interaction.options.getChannel('room_channel');
        setupServer.run({ server_id: interaction.guildId, room_channel_id: room?.id }, db);
        return {
            content: 'Server configured, now using: <#' + room + '> for its rooms',
            ephemeral: true,
        };
    },
});
