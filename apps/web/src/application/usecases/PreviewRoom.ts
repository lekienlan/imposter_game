import { GameGateway } from "../model/GameGateway";
import { RoomPreviewRequest } from "@imposter/shared";

export class PreviewRoom {
  constructor(private readonly gateway: GameGateway) {}

  execute(payload: RoomPreviewRequest) {
    this.gateway.previewRoom(payload);
  }
}
