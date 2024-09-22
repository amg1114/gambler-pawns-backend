import { Test, TestingModule } from "@nestjs/testing";
import { GameLinkService } from "./gameLink.service";

describe("GameLinkService", () => {
    let service: GameLinkService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameLinkService],
        }).compile();

        service = module.get<GameLinkService>(GameLinkService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
