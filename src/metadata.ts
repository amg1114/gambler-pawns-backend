/* eslint-disable */
export default async () => {
    const t = {
        ["./puzzle/entities/userSolvedPuzzle.entity"]: await import("./puzzle/entities/userSolvedPuzzle.entity"),
        ["./user/entities/user.entity"]: await import("./user/entities/user.entity"),
        ["./puzzle/entities/puzzle.entity"]: await import("./puzzle/entities/puzzle.entity"),
        ["./store/entities/userBoughtProduct.entity"]: await import("./store/entities/userBoughtProduct.entity"),
        ["./store/entities/product.entity"]: await import("./store/entities/product.entity"),
        ["./chess/entities/db/game.entity"]: await import("./chess/entities/db/game.entity"),
        ["./chess/entities/db/arcadeModifier.entity"]: await import("./chess/entities/db/arcadeModifier.entity"),
        ["./chess/entities/db/gameMode.entity"]: await import("./chess/entities/db/gameMode.entity"),
        ["./chess/entities/db/gameWithArcadeModifiers.entity"]: await import("./chess/entities/db/gameWithArcadeModifiers.entity"),
        ["./notification/entities/notificationType.entity"]: await import("./notification/entities/notificationType.entity"),
        ["./club/entities/club.entity"]: await import("./club/entities/club.entity"),
        ["./club/entities/userInClub.entity"]: await import("./club/entities/userInClub.entity"),
        ["./club/entities/clubPost.entity"]: await import("./club/entities/clubPost.entity"),
        ["./user/entities/userAvatar.entity"]: await import("./user/entities/userAvatar.entity"),
        ["./notification/entities/notification.entity"]: await import("./notification/entities/notification.entity"),
        ["./club/entities/clubPostComment.entity"]: await import("./club/entities/clubPostComment.entity")
    };
    return { "@nestjs/swagger": { "models": [[import("./user/entities/userAvatar.entity"), { "UserAvatarImg": { userAvatarImgId: { required: true, type: () => Number }, fileName: { required: true, type: () => String } } }], [import("./puzzle/entities/puzzle.entity"), { "Puzzle": { puzzleId: { required: true, type: () => Number }, fen: { required: true, type: () => String }, solution: { required: true, type: () => String }, rating: { required: true, type: () => Number }, popularity: { required: true, type: () => Number }, userSolvedPuzzles: { required: true, type: () => [t["./puzzle/entities/userSolvedPuzzle.entity"].UserSolvedPuzzle] } } }], [import("./puzzle/entities/userSolvedPuzzle.entity"), { "UserSolvedPuzzle": { userSolvedPuzzleId: { required: true, type: () => Number }, user: { required: true, type: () => t["./user/entities/user.entity"].User }, puzzle: { required: true, type: () => t["./puzzle/entities/puzzle.entity"].Puzzle }, solvedTimestamp: { required: true, type: () => Date } } }], [import("./store/entities/product.entity"), { "Product": { productId: { required: true, type: () => Number }, name: { required: true, type: () => String }, type: { required: true, type: () => Object }, description: { required: true, type: () => String }, coinsCost: { required: true, type: () => Number }, userBroughtProducts: { required: true, type: () => [t["./store/entities/userBoughtProduct.entity"].UserBoughtProduct] } } }], [import("./store/entities/userBoughtProduct.entity"), { "UserBoughtProduct": { userBoughtProductId: { required: true, type: () => Number }, user: { required: true, type: () => t["./user/entities/user.entity"].User }, product: { required: true, type: () => t["./store/entities/product.entity"].Product }, purchaseTimestamp: { required: true, type: () => Date } } }], [import("./chess/entities/db/gameMode.entity"), { "GameMode": { gameModeId: { required: true, type: () => Number }, mode: { required: true, type: () => String } } }], [import("./chess/entities/db/arcadeModifier.entity"), { "ArcadeModifiers": { arcadeModifierId: { required: true, type: () => Number }, modifierName: { required: true, type: () => String } } }], [import("./chess/entities/db/gameWithArcadeModifiers.entity"), { "GameWithArcadeModifiers": { gameWithArcadeModifiersId: { required: true, type: () => Number }, game: { required: true, type: () => t["./chess/entities/db/game.entity"].Game }, arcadeModifier: { required: true, type: () => t["./chess/entities/db/arcadeModifier.entity"].ArcadeModifiers } } }], [import("./chess/entities/db/game.entity"), { "Game": { gameId: { required: true, type: () => Number }, gameTimestamp: { required: true, type: () => Date, nullable: true }, pgn: { required: true, type: () => String }, whitesPlayer: { required: true, type: () => t["./user/entities/user.entity"].User }, blacksPlayer: { required: true, type: () => t["./user/entities/user.entity"].User }, winner: { required: true, type: () => Object, nullable: true }, whitesPlayerTime: { required: true, type: () => Number, nullable: true }, blacksPlayerTime: { required: true, type: () => Number, nullable: true }, eloWhitesBeforeGame: { required: true, type: () => Number, nullable: true }, eloWhitesAfterGame: { required: true, type: () => Number, nullable: true }, eloBlacksBeforeGame: { required: true, type: () => Number, nullable: true }, eloBlacksAfterGame: { required: true, type: () => Number, nullable: true }, gameMode: { required: true, type: () => t["./chess/entities/db/gameMode.entity"].GameMode }, resultType: { required: true, type: () => Object, nullable: true }, typePairing: { required: true, type: () => Object, nullable: true }, gameWithArcadeModifiers: { required: true, type: () => [t["./chess/entities/db/gameWithArcadeModifiers.entity"].GameWithArcadeModifiers] } } }], [import("./notification/entities/notificationType.entity"), { "NotificationType": { notificationTypeId: { required: true, type: () => Number }, type: { required: true, type: () => String } } }], [import("./notification/entities/notification.entity"), { "Notification": { notificationId: { required: true, type: () => Number }, userWhoSend: { required: true, type: () => t["./user/entities/user.entity"].User }, userWhoReceive: { required: true, type: () => t["./user/entities/user.entity"].User }, notificationType: { required: true, type: () => t["./notification/entities/notificationType.entity"].NotificationType }, title: { required: true, type: () => String }, message: { required: true, type: () => String }, actionLink1: { required: true, type: () => String }, actionText1: { required: true, type: () => String }, actionLink2: { required: true, type: () => String }, actionText2: { required: true, type: () => String }, isRead: { required: true, type: () => Boolean }, timeStamp: { required: true, type: () => Date } } }], [import("./club/entities/clubPost.entity"), { "ClubPost": { postId: { required: true, type: () => Number }, user: { required: true, type: () => t["./user/entities/user.entity"].User }, club: { required: true, type: () => t["./club/entities/club.entity"].Club }, content: { required: true, type: () => String }, imgFileName: { required: true, type: () => String }, totalLikes: { required: true, type: () => Number }, postTimestamp: { required: true, type: () => Date }, likes: { required: true, type: () => [t["./user/entities/user.entity"].User] } } }], [import("./club/entities/club.entity"), { "Club": { clubId: { required: true, type: () => Number }, name: { required: true, type: () => String }, description: { required: true, type: () => String }, imgFileName: { required: true, type: () => String }, creationTimestamp: { required: true, type: () => Date }, members: { required: true, type: () => [t["./club/entities/userInClub.entity"].UserInClub] }, posts: { required: true, type: () => [t["./club/entities/clubPost.entity"].ClubPost] } } }], [import("./club/entities/userInClub.entity"), { "UserInClub": { userInClubId: { required: true, type: () => Number }, user: { required: true, type: () => t["./user/entities/user.entity"].User }, club: { required: true, type: () => t["./club/entities/club.entity"].Club }, joinTimestamp: { required: true, type: () => Date }, role: { required: true, type: () => Object } } }], [import("./club/entities/clubPostComment.entity"), { "ClubPostComment": { commentId: { required: true, type: () => Number }, user: { required: true, type: () => t["./user/entities/user.entity"].User }, post: { required: true, type: () => t["./club/entities/clubPost.entity"].ClubPost }, content: { required: true, type: () => String }, commentTimestamp: { required: true, type: () => Date } } }], [import("./user/entities/user.entity"), { "User": { userId: { required: true, type: () => Number }, nickname: { required: true, type: () => String }, email: { required: true, type: () => String }, password: { required: true, type: () => String }, dateOfBirth: { required: true, type: () => Date }, countryCode: { required: true, type: () => String }, aboutText: { required: true, type: () => String }, userAvatarImg: { required: true, type: () => t["./user/entities/userAvatar.entity"].UserAvatarImg }, eloRapid: { required: true, type: () => Number }, eloBlitz: { required: true, type: () => Number }, eloBullet: { required: true, type: () => Number }, eloArcade: { required: true, type: () => Number }, currentCoins: { required: true, type: () => Number }, acumulatedAllTimeCoins: { required: true, type: () => Number }, nPuzzlesSolved: { required: true, type: () => Number }, streakDays: { required: true, type: () => Number }, isDeleted: { required: true, type: () => Boolean }, friends: { required: true, type: () => [t["./user/entities/user.entity"].User] }, puzzlesSolved: { required: true, type: () => [t["./puzzle/entities/userSolvedPuzzle.entity"].UserSolvedPuzzle] }, userBoughtProducts: { required: true, type: () => [t["./store/entities/userBoughtProduct.entity"].UserBoughtProduct] }, gamesAsWhite: { required: true, type: () => [t["./chess/entities/db/game.entity"].Game] }, gamesAsBlack: { required: true, type: () => [t["./chess/entities/db/game.entity"].Game] }, notificationsSent: { required: true, type: () => [t["./notification/entities/notification.entity"].Notification] }, notificationsReceived: { required: true, type: () => [t["./notification/entities/notification.entity"].Notification] }, clubs: { required: true, type: () => [t["./club/entities/userInClub.entity"].UserInClub] }, posts: { required: true, type: () => [t["./club/entities/clubPost.entity"].ClubPost] }, likes: { required: true, type: () => [t["./club/entities/clubPost.entity"].ClubPost] }, clubPostComments: { required: true, type: () => [t["./club/entities/clubPostComment.entity"].ClubPostComment] } } }], [import("./auth/dto/auth.dto"), { "SignUpDto": { nickname: { required: true, type: () => String, minLength: 3, maxLength: 20 }, email: { required: true, type: () => String }, password: { required: true, type: () => String }, countryCode: { required: true, type: () => String } }, "LoginDto": { nickname: { required: false, type: () => String, minLength: 3, maxLength: 20 }, email: { required: false, type: () => String }, password: { required: true, type: () => String } }, "forgotPasswordDto": { email: { required: true, type: () => String } }, "resetPasswordDto": { token: { required: true, type: () => String }, newPassword: { required: true, type: () => String } } }], [import("./user/dto/updateUser.dto"), { "UpdateUserDto": { email: { required: false, type: () => String }, nickname: { required: false, type: () => String }, dateOfBirth: { required: false, type: () => Date }, countryCode: { required: false, type: () => String } } }], [import("./auth/dto/responses/signUpResponses.dto"), { "SignUpResponse201Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ access_token: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } }, "SignUpResponse400Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } }, "SignUpResponse409Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } } }], [import("./auth/dto/responses/logInResponses.dto"), { "LogInResponse200Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ access_token: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } }, "LogInResponse400Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } }, "LogInResponse401Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } } }], [import("./auth/dto/responses/forgotPasswordResponses.dto"), { "ForgotPasswordResponse200Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, timestamp: { required: true, type: () => String } }, "ForgotPasswordResponse400Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } } }], [import("./auth/dto/responses/resetPasswordResponses.dto"), { "ForgotPasswordResponse200Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, timestamp: { required: true, type: () => String } }, "ForgotPasswordResponse400Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } }, "ForgotPasswordResponse401Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } } }], [import("./chess/submodules/handle-game/dto/acceptDraw.dto"), { "AcceptDrawDTO": { playerId: { required: true, type: () => String }, gameId: { required: true, type: () => String } } }], [import("./chess/submodules/handle-game/dto/makeMove.dto"), { "MakeMoveDTO": { playerId: { required: true, type: () => String }, from: { required: true, type: () => String }, to: { required: true, type: () => String } } }], [import("./chess/submodules/handle-game/dto/offerDraw.dto"), { "OfferDrawDTO": { playerId: { required: true, type: () => String }, gameId: { required: true, type: () => String } } }], [import("./chess/submodules/game-link/dto/game.dto"), { "CreateGameLinkDto": { gameMode: { required: true, type: () => String } }, "GetGameByGameLinkDto": { encodedId: { required: true, type: () => String } } }], [import("./chess/submodules/game-link/responses/createGameLinkResponses.dto"), { "CreateGameLinkResponse201Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ encodedGameId: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } }, "CreateGameLinkResponse400Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } }, "CreateGameLinkResponse404Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } } }], [import("./chess/submodules/random-pairing/dto/joinGame.dto"), { "JoinGameDTO": { playerId: { required: true, type: () => String }, eloRating: { required: true, type: () => Number }, mode: { required: true, type: () => Object }, bet: { required: false, type: () => Number } } }], [import("./user/dto/responses/updateUserResponse.dto"), { "UpdateUserResponse": { data: { required: true, type: () => Object } } }]], "controllers": [[import("./auth/auth.controller"), { "AuthController": { "signUp": {}, "login": {}, "forgotPassword": {}, "resetPassword": {} } }], [import("./chess/submodules/game-link/game-link.controller"), { "GameLinkController": { "createGameLink": {}, "getGameLinkByGameId": { type: t["./chess/entities/db/game.entity"].Game } } }], [import("./assets/assets.controller"), { "AssetsController": { "getAvatarList": { type: [t["./user/entities/userAvatar.entity"].UserAvatarImg] }, "getAvatar": {} } }], [import("./user/user.controller"), { "UserController": { "getUsers": { type: t["./user/entities/user.entity"].User }, "updateUser": {}, "updateAvatar": { type: t["./user/entities/user.entity"].User }, "getUserFriends": {} } }]] } };
};