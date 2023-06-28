/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CommandInteraction, CacheType, Client } from 'discord.js';
import AbstractCommand from './AbstractCommand.js';
import TypeHelp from '../entity/typeHelp.js';
import SlashOption from '../utils/slashOption.js';
import { CommandManager } from '../CommandManager.js';
import pino from 'pino';

export default class RecommandationCommand extends AbstractCommand {
  public constructor(
    logger: pino.Logger,
    client: Client,
    commandManager: CommandManager
  ) {
    super(logger, client, commandManager, {
      name: ['reco'],
      help: 'Recommande un manga/anime',
      type: TypeHelp.Utils,
      cmd: 'reco <link-nautiljon>',
      args: [
        new SlashOption()
          .setName('lien')
          .setDescription('Lien de la page nautiljon')
          .setRequired(true),
      ],
      slash: true,
    });
  }

  public async run(commandInteraction: CommandInteraction<CacheType>) {
    commandInteraction.reply(
      "Cette commande n'est plus disponible pour le moment du à un changement de version de plugin"
    );
  }
}
