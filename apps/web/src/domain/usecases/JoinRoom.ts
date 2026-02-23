import { GameGateway } from '../../data/GameGateway';
import { JoinRoomRequest } from '@imposter/shared';

export class JoinRoom {
  constructor(private readonly gateway: GameGateway) {}

  execute(payload: JoinRoomRequest) {
    this.gateway.joinRoom(payload);
  }
}
