import { MessageActionRow, MessageButton, ThreadChannel } from 'discord.js';
import { create_command_for_command_channel } from '../../command';
import { createRoom, getGamesChannel, joinPlayer } from './queries.queries';

const ROOM_PARAMETER_NAME = 'room_name';
const JOIN_BUTTON_ID = 'join_room';

export const command = create_command_for_command_channel('Creates a new room, with a new game', {
    config: (x) =>
        x
            .addStringOption((x) =>
                x
                    .setName(ROOM_PARAMETER_NAME)
                    .setDescription('Name of the room, will be used for the thread')
                    .setRequired(true),
            )
            .toJSON(),
    func: async ({ interaction, db }) => {
        const roomName = interaction.options.getString(ROOM_PARAMETER_NAME);
        if (!roomName) {
            return 'Missing/invalid room name';
        }
        let thread: undefined | ThreadChannel;
        try {
            const channelToWriteInId = await getGamesChannel
                .run({ server_id: interaction.guildId }, db)
                .then((x) => x[0]?.room_channel_id);
            if (!channelToWriteInId) {
                return {
                    content: 'This server is not yet properly configured. An administrator needs to run `/setup`.',
                    ephemeral: true,
                };
            }
            const channelForRoom = await interaction.guild?.channels.fetch(channelToWriteInId);
            if (!channelForRoom) {
                return {
                    content: 'Could not find the correct channel to create rooms in. Did it get deleted?',
                    ephemeral: true,
                };
            }
            if (!('threads' in channelForRoom)) {
                return {
                    content:
                        "The server isn't properly configured. The channel for games is not a text channel.\nConfigured channel: #<" +
                        channelToWriteInId +
                        '>',
                    ephemeral: true,
                };
            }

            return await db.startTransaction(async (db) => {
                thread = await channelForRoom.threads.create({ name: roomName });
                await createRoom.run(
                    {
                        room_id: thread.id,
                        server_id: interaction.guildId,
                        name: roomName,
                        owner_id: interaction.user.id,
                    },
                    db,
                );
                await joinPlayer.run(
                    {
                        pfp: interaction.user.displayAvatarURL({ format: 'png' }),
                        server_id: interaction.guildId,
                        thread_id: thread.id,
                        user_id: interaction.user.id,
                    },
                    db,
                );
                const joinButton = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId('JoinRoom')
                        .setLabel('Join Room')
                        .setStyle('PRIMARY')
                        .setCustomId(JOIN_BUTTON_ID)
                        .setDisabled(false),
                );
                await thread.send({
                    content: `A new room has been created. Click the button to join.\n${interaction.member?.toString()} can use \`/start\` in this thread to start.`,
                    components: [joinButton],
                });
                return {
                    content: 'Room has been created. Head over to <#' + thread.id + '> for further instructions',
                    ephemeral: true,
                };
            });
        } catch (e) {
            console.log(e);
            if (thread) {
                await thread.delete('Could not properly create room, rolling channel back');
            }
            return {
                content: 'Something went wrong while creating the room. Try again later',
                ephemeral: true,
            };
        }
    },
    button_commands: [
        {
            name: JOIN_BUTTON_ID,
            func: async ({ db, interaction }) => {
                if (!interaction.channel?.isThread()) {
                    console.log(interaction.channel);
                    return {
                        content: 'Could not add you as a player because the current channel is not a Thread.',
                        ephemeral: true,
                    };
                }
                try {
                    await joinPlayer.run(
                        {
                            server_id: interaction.guildId,
                            thread_id: interaction.channelId,
                            user_id: interaction.user.id,
                            pfp: interaction.user.displayAvatarURL({ format: 'png' }),
                        },
                        db,
                    );
                } catch (e) {
                    console.log(e);
                    return {
                        content: 'Something has gone wrong while adding you as a player. Did you already join?',
                        ephemeral: true,
                    };
                }
                return {
                    content: interaction.member?.toString() + ' Has joined the game!',
                };
            },
        },
    ],
});
