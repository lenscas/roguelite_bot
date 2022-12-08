import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { PermissionFlagsBits, RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord-api-types/v10';
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ButtonInteraction,
    Client,
    CommandInteraction,
    InteractionReplyOptions,
    MessagePayload,
    Modal,
    ModalSubmitInteraction,
} from 'discord.js';
import { readdir, lstat } from 'fs/promises';
import path from 'path';
import { IDB, PoolWrapper } from './db';

export type CommandParams = {
    client: Client;
    db: PoolWrapper;
    rest: REST;
};

export type CommandReturn = void | string | InteractionReplyOptions | MessagePayload;
export type CommandPromise = Promise<CommandReturn>;

export type BasicCommandParams<I> = {
    interaction: I;
} & CommandParams;

export type SlashCommandParams = BasicCommandParams<CommandInteraction>;
export type AutoCompleteParams = BasicCommandParams<AutocompleteInteraction>;
export type ModalSubmitParams = BasicCommandParams<ModalSubmitInteraction>;
export type ButtonCommandParams = BasicCommandParams<ButtonInteraction>;

export type Handler<T> = (params: BasicCommandParams<T>) => CommandPromise;

export type HandlerFinder<T> = (id: string, tree: CommandTree) => Handler<T> | undefined;

export type CommandModal = {
    modal_name: string;
    modal_builder: (_: Modal) => Modal;
    modal_handler: Handler<ModalSubmitInteraction>;
};

export type ButtonCommandConfig = {
    name: string;
    func: Handler<ButtonInteraction>;
};

export type Command = {
    help_text: string;
    slash_command: {
        config: (
            x: SlashCommandBuilder,
            guild_id: string,
            db: IDB,
        ) => RESTPostAPIApplicationCommandsJSONBody | Promise<RESTPostAPIApplicationCommandsJSONBody>;
    } & (
        | {
              func: Handler<CommandInteraction>;
              autoComplete?: (params: AutoCompleteParams) => Promise<ApplicationCommandOptionChoiceData[]>;
          }
        | CommandModal
    ) & {
            button_commands?: ButtonCommandConfig[];
        };
};

export function create_command(help_text: Command['help_text'], slash_command: Command['slash_command']): Command {
    return {
        help_text,
        slash_command,
    };
}

export function create_command_for_command_channel(
    help_text: Command['help_text'],
    slash_command: Command['slash_command'],
): Command {
    return create_command(help_text, slash_command);
}

export function create_moderator_command(
    help_text: Command['help_text'],
    slash_command: Command['slash_command'],
): Command {
    const oldConfig = slash_command.config;
    slash_command.config = (x, guild_id, db) =>
        oldConfig(x.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), guild_id, db);

    return create_command(help_text, slash_command);
}
export type CommandWithName = {
    name: string;
    command: Command;
};

export type CommandTree = { group: string; commands: Array<CommandWithName | CommandTree> };

export async function get_commands_in(dir: string, group = ''): Promise<CommandTree> {
    const files = await readdir(dir);
    console.log(files);
    const commands = await Promise.all(
        (
            await Promise.all(
                files
                    .filter((file) => !file.startsWith('_'))
                    .map(async (file) => {
                        const full_path = path.join(dir, file);
                        return {
                            file: await lstat(full_path),
                            name: file,
                            path: full_path,
                            parsed_path: path.parse(full_path),
                        };
                    }),
            )
        )
            .filter((x) => x.file.isDirectory() || (x.parsed_path.ext != '.sql' && x.parsed_path.ext != '.map'))
            .filter((x) => {
                if (x.file.isDirectory()) {
                    return true;
                }
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                return !!require(x.path).command;
            })
            .map(async (file) => {
                if (file.file.isDirectory()) {
                    return get_commands_in(file.path, file.name);
                } else {
                    return {
                        name: path.parse(file.path).name,
                        // eslint-disable-next-line @typescript-eslint/no-var-requires
                        command: require(file.path).command as Command,
                    };
                }
            }),
    );

    return {
        group,
        commands,
    };
}

export function find_command_with(tree: CommandTree, filter: (_: CommandWithName) => boolean): Command | undefined {
    return find_command_and_map(tree, (x) => {
        if (filter(x)) {
            return { k: 'some', v: x.command };
        }
        return { k: 'none' };
    });
}

export function find_command_and_map<T>(
    tree: CommandTree,
    filter_map: (command: CommandWithName) => { k: 'none' } | { k: 'some'; v: T },
): T | undefined {
    for (const candidate of tree.commands) {
        if ('name' in candidate) {
            const res = filter_map(candidate);
            if (res.k == 'some') {
                return res.v;
            }
        } else {
            const found = find_command_and_map(candidate, filter_map);
            if (found) {
                return found;
            }
        }
    }
}

export function find_command(command: string, tree: CommandTree): Command | undefined {
    return find_command_with(tree, (candidate) => candidate.name == command || candidate.name.toLowerCase() == command);
}

export const find_modal_handler: HandlerFinder<ModalSubmitInteraction> = (modal_id: string, tree: CommandTree) => {
    const a = find_command_and_map(tree, (candidate) => {
        if ('modal_name' in candidate.command.slash_command && candidate.command.slash_command.modal_name == modal_id) {
            return { k: 'some', v: candidate.command.slash_command.modal_handler };
        }
        return { k: 'none' };
    });
    return a;
};
export const find_button_handler: HandlerFinder<ButtonInteraction> = (button_id: string, tree: CommandTree) => {
    return find_command_and_map(tree, (x) => {
        const found = x.command.slash_command.button_commands?.find((x) => x.name == button_id);
        if (found) {
            return { k: 'some', v: found.func };
        }
        return { k: 'none' };
    });
};

export function find_something(command: string, tree: CommandTree): Command | CommandTree | undefined {
    for (const candidate of tree.commands) {
        console.log(candidate);
        if ('name' in candidate) {
            if (candidate.name == command) {
                return candidate.command;
            }
        } else if (candidate.group == command) {
            return candidate;
        } else {
            const result = find_something(command, candidate);
            if (result) {
                return result;
            }
        }
    }
}

export function drill_until_found_something(needles: string[], tree: CommandTree): CommandTree | Command | undefined {
    let working_with = tree;
    for (const needle of needles) {
        let found = false;
        for (const candidate of working_with.commands) {
            if ('name' in candidate) {
                if (candidate.name == needle) {
                    return candidate.command;
                }
            } else {
                console.log(candidate.group, candidate.group == needle);
                if (candidate.group == needle) {
                    working_with = candidate;
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            return;
        }
    }
    return working_with;
}

export type SlashCommandConfig = RESTPostAPIApplicationCommandsJSONBody;

export async function find_every_slash_command_config(
    tree: CommandTree,
    guild_id: string,
    db: IDB,
): Promise<Array<SlashCommandConfig>> {
    let results: Array<SlashCommandConfig> = [];
    for (const candidate of tree.commands) {
        if ('name' in candidate) {
            if (candidate.command.slash_command) {
                const name = candidate.name.toLowerCase();
                const description = candidate.command.help_text;
                const builder = new SlashCommandBuilder().setName(name).setDescription(description);
                results.push(await candidate.command.slash_command.config(builder, guild_id, db));
            }
        } else {
            const result = await find_every_slash_command_config(candidate, guild_id, db);
            results = results.concat(result);
        }
    }
    return results;
}

export async function register_commands_for(client: Client, guild: string, rest: REST, db: IDB): Promise<void> {
    const foundCommands = await get_commands_in(path.join(__dirname, 'commands'));
    const slashCommands = await find_every_slash_command_config(foundCommands, guild, db);
    const commands = slashCommands.concat(
        new SlashCommandBuilder()
            .setName('help')
            .setDescription('shows help text')
            .addStringOption((x) => x.setName('search').setDescription('What command/group to search for'))
            .toJSON(),
    );
    if (!client.user) {
        throw new Error('No user for the given client. Maybe not logged in?');
    }
    await rest.put(Routes.applicationGuildCommands(client.user?.id, guild), {
        body: commands,
    });
}
