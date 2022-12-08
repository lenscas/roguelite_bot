import { CacheType, Client, Intents, Interaction, Modal } from 'discord.js';

import db_config from '../database.json';
import { discordToken } from '../config.json';
import {
    get_commands_in,
    find_command,
    register_commands_for,
    find_modal_handler,
    find_button_handler,
    CommandTree,
    HandlerFinder,
    CommandPromise,
    CommandReturn,
    Handler,
} from './command';
import path from 'path';
import { help_through_slash } from './help';
import { PoolWrapper } from './db';
import { enableGhostPingDetection } from './ghostPingDetection';
import { REST } from '@discordjs/rest';

const rest = new REST().setToken(discordToken);

const client = new Client({
    intents: new Intents(['GUILDS']),
});
const reply = async <Cache extends CacheType, I extends Interaction<Cache>>(
    interaction: I,
    toReplyWith: CommandReturn,
) => {
    if (!toReplyWith) {
        return toReplyWith;
    }
    if (interaction.isRepliable()) {
        if (interaction.deferred && !interaction.replied) {
            await interaction.editReply(toReplyWith);
        } else if (interaction.replied || interaction.deferred) {
            await interaction.followUp(toReplyWith);
        } else {
            await interaction.reply(toReplyWith);
        }
    } else {
        return toReplyWith;
    }
};

const runCommand = async <T extends Handler<I>, Cache extends CacheType, I extends Interaction<Cache>>(
    handler: T,
    interaction: I,
    db: PoolWrapper,
) => {
    try {
        return reply(interaction, await handler({ interaction, db, client, rest }));
    } catch (e) {}
};

const findAndRunCommand = async <T extends HandlerFinder<I>, Cache extends CacheType, I extends Interaction<Cache>>(
    find_handler: T,
    interaction: I,
    name: string,
    commands: CommandTree,
    db: PoolWrapper,
): CommandPromise => {
    const command = find_handler(name, commands);
    if (!command) {
        return reply(interaction, {
            content: 'Could not find handler for this action. Handler=' + name,
            ephemeral: true,
        });
    }
    return runCommand(command, interaction, db);
};

(async () => {
    const commands = await get_commands_in(path.join(__dirname, 'commands'));
    const db = new PoolWrapper(db_config.dev);
    await client.login(discordToken);
    await register_slash_commands(client, db);
    client.on('interactionCreate', async (interaction) => {
        try {
            if (interaction.isAutocomplete()) {
                const command = find_command(interaction.commandName, commands);
                if (!command?.slash_command) {
                    return;
                }
                if ('autoComplete' in command.slash_command && command.slash_command.autoComplete) {
                    const res = await command.slash_command.autoComplete({ db, interaction, client, rest });
                    interaction.respond(res);
                }
                return;
            }
            if (interaction.isModalSubmit()) {
                await findAndRunCommand(find_modal_handler, interaction, interaction.customId, commands, db);
            }
            if (interaction.isButton()) {
                await findAndRunCommand(find_button_handler, interaction, interaction.customId, commands, db);
            }
            if (!interaction.isCommand()) return;
            if (interaction.commandName == 'help') {
                await help_through_slash({ db, client, interaction, rest }, commands);
                return;
            }
            const command = find_command(interaction.commandName, commands);
            if (!command) {
                await reply(interaction, {
                    content: 'Failed finding command to run. Command trying to run: ' + interaction.commandName,
                });
                return;
            }
            if ('func' in command.slash_command) {
                const func = command.slash_command.func;
                await runCommand(func, interaction, db);
            } else {
                const builder = command.slash_command.modal_builder(
                    new Modal().setCustomId(command.slash_command.modal_name),
                );
                interaction.showModal(builder);
            }
        } catch (e) {
            if (interaction.isRepliable()) {
                await interaction.reply(`Something has gone wrong.\nError:\n ${e}`);
            }
        }
    });
    enableGhostPingDetection(client);
})();

async function register_slash_commands(client: Client, db: PoolWrapper) {
    try {
        const guilds = await client.guilds.fetch();
        for (const [guild] of guilds) {
            console.log(guild);
            await register_commands_for(client, guild, rest, db);
            console.log(guild);
        }
    } catch (e) {
        console.error('Could not register commands!');
        throw e;
    }
}
