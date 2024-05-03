import TeamBan from '../entity/TeamBan.js';
import { ImplementableMangaCommandDetails } from '../types/Command.js';

const details: Array<ImplementableMangaCommandDetails> = [
  {
    id: 'jjl',
    name: ['jjl'],
    description: "Affiche une page d'un chapitre de Jojolion",
    options: {
      research: '7a9d76c3-42b9-4bcf-81d7-ad307d2ea971',
    },
  },
];

export default details;
