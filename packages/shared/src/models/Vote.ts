export interface Vote {
  voterId: string;
  targetPlayerId: string | null;
  submittedAt: number;
}
