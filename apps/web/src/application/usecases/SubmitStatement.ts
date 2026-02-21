import { SubmitStatementRequest } from "@imposter/shared";
import { GameGateway } from "../model/GameGateway";

export class SubmitStatement {
  constructor(private readonly gateway: GameGateway) {}

  execute(payload: SubmitStatementRequest) {
    this.gateway.submitStatement(payload);
  }
}
