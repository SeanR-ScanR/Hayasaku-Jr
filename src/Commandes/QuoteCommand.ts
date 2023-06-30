/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Channel,
  Colors,
  CommandInteraction,
  EmbedBuilder,
  Message,
} from 'discord.js';
import AbstractCommand from './AbstractCommand.js';
import TypeHelp from '../entity/typeHelp.js';
import SlashOption from '../utils/slashOption.js';
import { getDateFromTimeStamp } from '../utils/dateUtils.js';
import { AppInstances } from '../AppInstances.js';

export default class QuoteCommand extends AbstractCommand {
  public constructor(appInstances: AppInstances) {
    super(appInstances, {
      name: ['quote'],
      help: "Renvoie le contenu d'un message",
      cmd: 'q/quote ([<id-channel>-]<id-message> | <url-message>)',
      type: TypeHelp.Utils,
      args: [
        new SlashOption()
          .setName('message')
          .setDescription('ID ou lien du message à quote')
          .setRequired(true),
      ],
      slash: true,
      message: true,
    });
  }

  public async run(commandInteraction: CommandInteraction) {
    let targetChannelId = commandInteraction.channel?.id;
    let targetMessageId;
    try {
      const parsedIds = parseIdsFromCommandInteraction(commandInteraction);
      targetChannelId = parsedIds.channelId ?? targetChannelId;
      targetMessageId = parsedIds.messageId;
    } catch (e) {
      let erreurMessage = "Une erreur s'est produite";
      if (!(e instanceof Error)) {
        erreurMessage = String(e);
      }
      await commandInteraction.reply({
        content: erreurMessage,
        ephemeral: true,
      });
      return;
    }

    if (!targetChannelId || !targetMessageId) {
      await commandInteraction.reply({
        content: 'Merci de préciser tout les arguments nécessaires.',
        ephemeral: true,
      });
      return;
    }

    let targetChannel: Channel | null | undefined;
    try {
      targetChannel = await this.getAppInstances().client.channels.fetch(
        targetChannelId
      );
    } catch (e) {
      /* empty */
    }

    if (!targetChannel) {
      await commandInteraction.reply({
        content: 'Channel inexistant',
        ephemeral: true,
      });
      return;
    }

    let targetMessage;
    try {
      //@ts-ignore pas le choix...
      targetMessage = await targetChannel.messages.fetch(targetMessageId);
    } catch (e) {
      /* empty */
    }

    if (!targetMessage) {
      await commandInteraction.reply({
        content: 'Message inexistant',
        ephemeral: true,
      });
      return;
    }

    const embeds = convertTargetMessageToQuoteEmbeds(
      targetMessage,
      targetChannel
    );

    await commandInteraction.reply({ embeds: embeds });
  }
}

const convertTargetMessageToQuoteEmbeds = (
  targetMessage: Message,
  targetChannel: Channel
) => {
  const iconUrl = targetMessage.author.avatarURL();
  const mainEmbed = new EmbedBuilder()
    .setColor(Colors.Fuchsia)
    .setDescription(
      targetMessage.content + `\n\n[Aller au message](${targetMessage.url})`
    )
    .setAuthor({
      name: targetMessage.author.username,
      ...(iconUrl ? { iconURL: iconUrl } : {}),
    })
    .setFooter({
      text:
        '#' +
        //@ts-ignore
        targetChannel.name +
        ' | ' +
        getDateFromTimeStamp(targetMessage.createdTimestamp),
    });

  if (targetMessage.attachments.size != 0) {
    const firstAttachment = targetMessage.attachments.first();
    if (firstAttachment?.contentType?.startsWith('image')) {
      mainEmbed.setImage(firstAttachment.proxyURL);
    }
  }

  const embeds = [mainEmbed];

  if (
    targetMessage.embeds &&
    targetMessage.embeds.length > 0 &&
    !(targetMessage.author.bot && targetMessage.embeds[0].title == null)
  ) {
    embeds.push(
      ...targetMessage.embeds.map((embed) => new EmbedBuilder(embed.data))
    );
  }
  return embeds;
};

type Ids = { messageId?: string; channelId?: string };

const parseIdsFromCommandInteraction = (
  commandInteraction: CommandInteraction
): Ids => {
  const ids: Ids = {};
  if (commandInteraction.isMessageContextMenuCommand()) {
    ids.messageId = commandInteraction.targetMessage.id;
  } else {
    // @ts-ignore
    const argument = commandInteraction.options.getString('message');
    let url;
    try {
      url = new URL(argument);
    } catch (e) {
      /* empty */
    }
    if (url?.host === 'discord.com' && url.pathname.startsWith('/channels')) {
      const splitIds = url.pathname.split('/');
      if (splitIds.length != 5) {
        throw "Erreur, le lien du message n'est pas valide";
      }
      ids.messageId = splitIds.pop();
      ids.channelId = splitIds.pop();
    } else if (url) {
      throw "Erreur, le lien du message n'est pas valide";
    } else {
      if (!argument.includes('-')) {
        ids.messageId = argument;
      } else if (argument.split(/-/).length != 2) {
        throw "Erreur, veuillez donner l'id sous la forme <message-channel>-<message-message> ou le lien du message";
      } else {
        const splitIds = argument.split(/-/);
        ids.channelId = splitIds[0];
        ids.messageId = splitIds[1];
      }
    }
  }
  return ids;
};
