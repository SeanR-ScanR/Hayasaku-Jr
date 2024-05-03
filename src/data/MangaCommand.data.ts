import TeamBan from '../entity/TeamBan.js';
import { ImplementableMangaCommandDetails } from '../types/Command.js';

const details: Array<ImplementableMangaCommandDetails> = [
  {
    id: 'jjl',
    name: ['jjl'],
    description: "Affiche une page d'un chapitre de Jojolion",
    options: {
      research: 'de4b3c43-5243-4399-9fc3-68a3c0747138',
    },
  },
];

export default details;
