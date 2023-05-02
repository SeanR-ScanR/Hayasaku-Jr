/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  CommandInteraction,
  CacheType,
  Client,
  ApplicationCommandOptionType,
} from 'discord.js';
import SlashOption from '../../utils/slashOption.js';
import { send } from '../../utils/mangaUtils.js';
import { CommandDeclaration } from '../../types/Command.js';
import AbstractCommand from '../AbstractCommand.js';
import TypeHelp from '../../entity/typeHelp.js';
import { CommandManager } from '../../CommandManager.js';

export interface MangaCommandDeclaration extends CommandDeclaration {
  chapterId: string;
}

export default class ImplementableMangaCommand extends AbstractCommand {
  public constructor(
    client: Client,
    commandManager: CommandManager,
    details: CommandDeclaration
  ) {
    super(client, commandManager, {
      args: [
        new SlashOption(
          'chapitre',
          'Numéro du chapitre',
          ApplicationCommandOptionType.String,
          true
        ),
        new SlashOption('page', 'Numéro de la page'),
      ],
      slash: true,
      type: TypeHelp.ViewManga,
      ...details,
    });
  }

  public async run(commandInteraction: CommandInteraction<CacheType>) {
    send(
      commandInteraction,
      //@ts-ignore
      commandInteraction.options.getString('chapitre'),
      //@ts-ignore
      commandInteraction.options.getString('page'),
      //@ts-ignore
      { research: this.getDetails().chapterId, ...this.getDetails() }
    );
  }
}
