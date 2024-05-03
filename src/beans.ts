import MangaCommandData from './data/MangaCommand.data.js';
import ImplementableMangaCommand from './commandes/implementable/ImplementableMangaCommand.js';
import AbstractCommand, {
  COMMAND_BEAN_TYPE,
} from './commandes/AbstractCommand.js';
import AbstractMessageHandler, {
  MESSAGE_HANDLER_BEAN_TYPE,
} from './handlers/commandesMessageHandler/AbstractMessageHandler.js';
import injector from 'wire-dependency-injection';

// Services
import './services/CommandInteractionService.js';
import './services/CommandService.js';
import './services/GistService.js';
import './services/MangadexService.js';
import './services/MangaService.js';
import './services/ResourcesService.js';
import './services/SaucenaoService.js';

// Events
import './events/InteractionCreateEvent.js';
import './events/ReadyEvent.js';
import './events/messageCreateEvent.js';

// Commands
import './commandes/ChapterLinkCommand.js';
import './commandes/HelpCommand.js';
import './commandes/MangaLinkCommand.js';
import './commandes/QuoteCommand.js';
import './commandes/SauceCommand.js';

// MessageHandlers
import './handlers/commandesMessageHandler/MangadexChapterLinkHandler.js';

([] as Array<AbstractCommand>)
  .concat(
    MangaCommandData.map((details) => new ImplementableMangaCommand(details))
  )
  .forEach((command) => {
    injector.declare(
      command.getDetails().id + 'ImplCommand',
      command,
      COMMAND_BEAN_TYPE
    );
  });

([] as Array<AbstractMessageHandler>).forEach((message) => {
  injector.declare(
    message.getDetails().id + 'ImplCommand',
    message,
    MESSAGE_HANDLER_BEAN_TYPE
  );
});
