import { GameMode } from '../enums/GameMode';
import { WordPair } from './WordPair';

export interface GameSettings {
  mode: GameMode;
  whiteEnabled: boolean;
  wordPairs: WordPair[];
}
