import { JoinRoomRequest } from '@imposter/shared';
import { ShareInvite } from './ShareLink';

export class HandleShareInvite {
  execute(invite: ShareInvite, localPlayerName: string): JoinRoomRequest {
    return {
      roomId: invite.roomId.toUpperCase(),
      playerName: localPlayerName.trim(),
    };
  }
}
