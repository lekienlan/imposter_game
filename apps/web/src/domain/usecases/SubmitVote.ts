import { SubmitVoteRequest } from '@imposter/shared';
import { GameGateway } from '../../data/GameGateway';

export class SubmitVote {
  constructor(private readonly gateway: GameGateway) {}

  execute(payload: SubmitVoteRequest) {
    this.gateway.submitVote(payload);
  }
}
