import { Test, TestingModule } from "@nestjs/testing";
import { AssetsController } from "./assets.controller";
import { AssetsService } from "./assets.service";
import { Response } from "express";
import { join } from "path";

describe("AssetsController", () => {
    let controller: AssetsController;
    let assetsService: AssetsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AssetsController],
            providers: [
                {
                    provide: AssetsService,
                    useValue: {
                        getAvatarList: jest.fn(),
                        getAvatar: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<AssetsController>(AssetsController);
        assetsService = module.get<AssetsService>(AssetsService);
    });

    describe("getAvatarList", () => {
        it("should return the list of avatar images", async () => {
            const avatarList = [
                {
                    userAvatarImgId: 1,
                    fileName: "avatar1.jpg",
                },
                {
                    userAvatarImgId: 2,
                    fileName: "avatar2.jpg",
                },
            ];
            jest.spyOn(assetsService, "getAvatarList").mockResolvedValue(
                avatarList,
            );

            const result = await controller.getAvatarList();

            expect(result).toEqual(avatarList);
            expect(assetsService.getAvatarList).toHaveBeenCalled();
        });
    });

    describe("getAvatar", () => {
        it("should return an avatar image", async () => {
            const mockAvatarPath = "path/to/avatar.png";
            const mockId = "1";

            // Mock the service to return the path of the avatar
            jest.spyOn(assetsService, "getAvatar").mockResolvedValue(
                mockAvatarPath,
            );

            const mockResponse = {
                sendFile: jest.fn(),
            } as unknown as Response;

            await controller.getAvatar(mockId, mockResponse as Response);

            expect(assetsService.getAvatar).toHaveBeenCalledWith(mockId);
            expect(mockResponse.sendFile).toHaveBeenCalledWith(
                join(process.cwd(), mockAvatarPath),
            );
        });
    });

    it('should handle avatar not found (404)', async () => {
      const mockId = '1';

      // Mock the service to return null (not found)
      jest.spyOn(assetsService, 'getAvatar').mockResolvedValue(null);

      const mockResponse: Partial<Response> = {
        sendFile: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getAvatar(mockId, mockResponse as Response);

      expect(assetsService.getAvatar).toHaveBeenCalledWith(mockId);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Avatar not found' });
    });
});
