import { Role } from '../enums/Role';

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isAlive: boolean;
  joinedAt: number;
  role: Role | null;
  word: string | null;
  statement: string | null;
  votedFor: string | null;
}
