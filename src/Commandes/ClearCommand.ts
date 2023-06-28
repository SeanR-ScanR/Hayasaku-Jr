/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  CommandInteraction,
  CacheType,
  Client,
  ApplicationCommandOptionType,
} from 'discord.js';
import AbstractCommand from './AbstractCommand.js';
import TypeHelp from '../entity/typeHelp.js';
import SlashOption from '../utils/slashOption.js';
import { CommandManager } from '../CommandManager.js';
import pino from 'pino';

export default class ClearCommand extends AbstractCommand {
  public constructor(
    logger: pino.Logger,
    client: Client,
    commandManager: CommandManager
  ) {
    super(logger, client, commandManager, {
      name: ['clear'],
      help: 'Clear un certain nombre de message',
      type: TypeHelp.Utils,
      cmd: 'clear <nb-msg>',
      args: [
        new SlashOption(
          'nombre',
          'Nombre de message à supprimer',
          ApplicationCommandOptionType.Integer,
          true
        ),
      ],
      slash: true,
    });
  }

  public async run(commandInteraction: CommandInteraction<CacheType>) {
    if (
      !['452186417334976532', '273756946308530176'].includes(
        //@ts-ignore
        commandInteraction.member?.id
      )
    )
      return commandInteraction.reply({
        content: 'Tu ne peux pas utiliser cette commande',
        ephemeral: true,
      });
    //@ts-ignore
    const nombre = commandInteraction.options.getInteger('nombre');
    commandInteraction.channel
      //@ts-ignore
      ?.bulkDelete(nombre)
      .then(() =>
        commandInteraction.reply({
          content: 'Les messages ont bien été supprimé',
          ephemeral: true,
        })
      )
      .catch(() =>
        commandInteraction.reply({
          content: 'Une erreur est survenu',
          ephemeral: true,
        })
      );
  }
}
