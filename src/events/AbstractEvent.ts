import { Client, CommandInteraction, Message } from 'discord.js';
import EventError from '../errors/EventError.js';
import injector from 'wire-dependency-injection';
import LogChild from '../LogChild.js';

const ERROR_MESAGE = "Une Erreur s'est produite";

export default class AbstractEvent extends LogChild {
  private readonly eventIdentifier;

  protected client: Client = injector.autoWire(
    'client',
    (b) => (this.client = b)
  );

  public constructor(eventIdentifier: string) {
    super('(Event)[' + eventIdentifier + ']: ');
    this.eventIdentifier = eventIdentifier;
    this.register().catch();
  }

  public async register() {
    await injector.asyncWire('logger');
    try {
      const client = await injector.asyncWire<Client>('client');
      this.getLogger().info(`Registering...`);
      client.on(this.getEventIdentifier(), (args) => this.execute(args));
      this.getLogger().info(`Registered!`);
    } catch (e) {
      this.getLogger().error('Failed to register', e);
    }
  }

  public getEventIdentifier() {
    return this.eventIdentifier;
  }

  public async execute(commandInteraction: CommandInteraction | Message) {
    this.onEvent(commandInteraction).catch(async (error) => {
      let errorMessage = ERROR_MESAGE;
      if (error instanceof EventError) {
        this.getLogger().trace(
          'a managed error occurred while executing a command.'
        );
        this.getLogger().trace(error);
        errorMessage = [errorMessage, error.message].join('\n');
      } else {
        this.getLogger().error(
          'an unexpected error occurred while executing a command.'
        );
        this.getLogger().error(error);
      }
      if (commandInteraction instanceof CommandInteraction) {
        if (!commandInteraction.deferred) {
          await commandInteraction.deferReply({ ephemeral: true });
        } else if (
          !commandInteraction.ephemeral ||
          commandInteraction.replied
        ) {
          await commandInteraction.deleteReply();
        }
        await commandInteraction.followUp({
          content: errorMessage,
          ephemeral: true,
        });
      }
    });
  }

  protected async onEvent(commandInteraction: CommandInteraction | Message) {
    await Promise.reject(commandInteraction);
  }

  public toString() {
    return this.eventIdentifier;
  }
}

export const EVENT_BEAN_TYPE = 'event';
