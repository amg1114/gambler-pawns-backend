/* eslint-disable */
export default async () => {
    const t = {
        ["./modules/puzzle/entities/userSolvedPuzzle.entity"]: await import("./modules/puzzle/entities/userSolvedPuzzle.entity"),
        ["./modules/user/entities/user.entity"]: await import("./modules/user/entities/user.entity"),
        ["./modules/puzzle/entities/puzzle.entity"]: await import("./modules/puzzle/entities/puzzle.entity"),
        ["./modules/store/entities/userBoughtProduct.entity"]: await import("./modules/store/entities/userBoughtProduct.entity"),
        ["./modules/store/entities/product.entity"]: await import("./modules/store/entities/product.entity"),
        ["./modules/chess/entities/db/game.entity"]: await import("./modules/chess/entities/db/game.entity"),
        ["./modules/chess/entities/db/arcadeModifier.entity"]: await import("./modules/chess/entities/db/arcadeModifier.entity"),
        ["./modules/chess/entities/db/gameWithArcadeModifiers.entity"]: await import("./modules/chess/entities/db/gameWithArcadeModifiers.entity"),
        ["./modules/club/entities/club.entity"]: await import("./modules/club/entities/club.entity"),
        ["./modules/club/entities/userInClub.entity"]: await import("./modules/club/entities/userInClub.entity"),
        ["./modules/club/entities/clubPost.entity"]: await import("./modules/club/entities/clubPost.entity"),
        ["./modules/user/entities/userAvatar.entity"]: await import("./modules/user/entities/userAvatar.entity"),
        ["./modules/notification/entities/notification.entity"]: await import("./modules/notification/entities/notification.entity"),
        ["./modules/club/entities/clubPostComment.entity"]: await import("./modules/club/entities/clubPostComment.entity"),
        ["./modules/chess/entities/game"]: await import("./modules/chess/entities/game")
    };
    return { "@nestjs/swagger": { "models": [[import("./modules/user/entities/userAvatar.entity"), { "UserAvatarImg": { userAvatarImgId: { required: true, type: () => Number }, fileName: { required: true, type: () => String } } }], [import("./modules/puzzle/entities/puzzle.entity"), { "Puzzle": { puzzleId: { required: true, type: () => Number }, lichessId: { required: true, type: () => String }, fen: { required: true, type: () => String }, solution: { required: true, type: () => String }, rating: { required: true, type: () => Number }, popularity: { required: true, type: () => Number }, userSolvedPuzzles: { required: true, type: () => [t["./modules/puzzle/entities/userSolvedPuzzle.entity"].UserSolvedPuzzle] } } }], [import("./modules/puzzle/entities/userSolvedPuzzle.entity"), { "UserSolvedPuzzle": { userSolvedPuzzleId: { required: true, type: () => Number }, user: { required: true, type: () => t["./modules/user/entities/user.entity"].User }, puzzle: { required: true, type: () => t["./modules/puzzle/entities/puzzle.entity"].Puzzle }, solvedTimestamp: { required: true, type: () => Date } } }], [import("./modules/store/entities/product.entity"), { "Product": { productId: { required: true, type: () => Number }, name: { required: true, type: () => String }, type: { required: true, type: () => Object }, description: { required: true, type: () => String }, coinsCost: { required: true, type: () => Number }, userBroughtProducts: { required: true, type: () => [t["./modules/store/entities/userBoughtProduct.entity"].UserBoughtProduct] } } }], [import("./modules/store/entities/userBoughtProduct.entity"), { "UserBoughtProduct": { userBoughtProductId: { required: true, type: () => Number }, user: { required: true, type: () => t["./modules/user/entities/user.entity"].User }, product: { required: true, type: () => t["./modules/store/entities/product.entity"].Product }, purchaseTimestamp: { required: true, type: () => Date } } }], [import("./modules/chess/entities/db/arcadeModifier.entity"), { "ArcadeModifiers": { arcadeModifierId: { required: true, type: () => Number }, modifierName: { required: true, type: () => String } } }], [import("./modules/chess/entities/db/gameWithArcadeModifiers.entity"), { "GameWithArcadeModifiers": { gameWithArcadeModifiersId: { required: true, type: () => Number }, game: { required: true, type: () => t["./modules/chess/entities/db/game.entity"].Game }, arcadeModifier: { required: true, type: () => t["./modules/chess/entities/db/arcadeModifier.entity"].ArcadeModifiers } } }], [import("./modules/chess/entities/db/game.entity"), { "Game": { gameId: { required: true, type: () => Number }, gameTimestamp: { required: true, type: () => Date, nullable: true }, pgn: { required: true, type: () => String }, whitesPlayer: { required: true, type: () => t["./modules/user/entities/user.entity"].User }, blacksPlayer: { required: true, type: () => t["./modules/user/entities/user.entity"].User }, winner: { required: true, type: () => Object, nullable: true }, whitesPlayerTime: { required: true, type: () => Number, nullable: true }, blacksPlayerTime: { required: true, type: () => Number, nullable: true }, eloWhitesBeforeGame: { required: true, type: () => Number, nullable: true }, eloWhitesAfterGame: { required: true, type: () => Number, nullable: true }, eloBlacksBeforeGame: { required: true, type: () => Number, nullable: true }, eloBlacksAfterGame: { required: true, type: () => Number, nullable: true }, timeAfterGameEndWhites: { required: true, type: () => Number, nullable: true }, timeAfterGameEndBlacks: { required: true, type: () => Number, nullable: true }, gameMode: { required: true, type: () => Object }, resultType: { required: true, type: () => Object, nullable: true }, typePairing: { required: true, type: () => Object, nullable: true }, gameWithArcadeModifiers: { required: true, type: () => [t["./modules/chess/entities/db/gameWithArcadeModifiers.entity"].GameWithArcadeModifiers] } } }], [import("./modules/notification/entities/notification.entity"), { "Notification": { notificationId: { required: true, type: () => Number }, userWhoSend: { required: true, type: () => t["./modules/user/entities/user.entity"].User }, userWhoReceive: { required: true, type: () => t["./modules/user/entities/user.entity"].User }, type: { required: true, type: () => Object }, title: { required: true, type: () => String }, message: { required: true, type: () => String }, actionLink1: { required: true, type: () => String }, actionText1: { required: true, type: () => String }, actionLink2: { required: true, type: () => String }, actionText2: { required: true, type: () => String }, isRead: { required: true, type: () => Boolean }, timeStamp: { required: true, type: () => Date } } }], [import("./modules/club/entities/clubPost.entity"), { "ClubPost": { postId: { required: true, type: () => Number }, user: { required: true, type: () => t["./modules/user/entities/user.entity"].User }, club: { required: true, type: () => t["./modules/club/entities/club.entity"].Club }, content: { required: true, type: () => String }, imgFileName: { required: true, type: () => String }, totalLikes: { required: true, type: () => Number }, postTimestamp: { required: true, type: () => Date }, likes: { required: true, type: () => [t["./modules/user/entities/user.entity"].User] } } }], [import("./modules/club/entities/club.entity"), { "Club": { clubId: { required: true, type: () => Number }, name: { required: true, type: () => String }, description: { required: true, type: () => String }, imgFileName: { required: true, type: () => String }, creationTimestamp: { required: true, type: () => Date }, members: { required: true, type: () => [t["./modules/club/entities/userInClub.entity"].UserInClub] }, posts: { required: true, type: () => [t["./modules/club/entities/clubPost.entity"].ClubPost] } } }], [import("./modules/club/entities/userInClub.entity"), { "UserInClub": { userInClubId: { required: true, type: () => Number }, user: { required: true, type: () => t["./modules/user/entities/user.entity"].User }, club: { required: true, type: () => t["./modules/club/entities/club.entity"].Club }, joinTimestamp: { required: true, type: () => Date }, role: { required: true, type: () => Object } } }], [import("./modules/club/entities/clubPostComment.entity"), { "ClubPostComment": { commentId: { required: true, type: () => Number }, user: { required: true, type: () => t["./modules/user/entities/user.entity"].User }, post: { required: true, type: () => t["./modules/club/entities/clubPost.entity"].ClubPost }, content: { required: true, type: () => String }, commentTimestamp: { required: true, type: () => Date } } }], [import("./modules/user/entities/user.entity"), { "User": { userId: { required: true, type: () => Number }, nickname: { required: true, type: () => String }, email: { required: true, type: () => String }, password: { required: true, type: () => String }, dateOfBirth: { required: true, type: () => Date }, countryCode: { required: true, type: () => String }, aboutText: { required: true, type: () => String }, userAvatarImg: { required: true, type: () => t["./modules/user/entities/userAvatar.entity"].UserAvatarImg }, eloRapid: { required: true, type: () => Number }, eloBlitz: { required: true, type: () => Number }, eloBullet: { required: true, type: () => Number }, eloArcade: { required: true, type: () => Number }, currentCoins: { required: true, type: () => Number }, acumulatedAllTimeCoins: { required: true, type: () => Number }, nPuzzlesSolved: { required: true, type: () => Number }, streakDays: { required: true, type: () => Number }, isDeleted: { required: true, type: () => Boolean }, friends: { required: true, type: () => [t["./modules/user/entities/user.entity"].User] }, puzzlesSolved: { required: true, type: () => [t["./modules/puzzle/entities/userSolvedPuzzle.entity"].UserSolvedPuzzle] }, userBoughtProducts: { required: true, type: () => [t["./modules/store/entities/userBoughtProduct.entity"].UserBoughtProduct] }, gamesAsWhite: { required: true, type: () => [t["./modules/chess/entities/db/game.entity"].Game] }, gamesAsBlack: { required: true, type: () => [t["./modules/chess/entities/db/game.entity"].Game] }, notificationsSent: { required: true, type: () => [t["./modules/notification/entities/notification.entity"].Notification] }, notificationsReceived: { required: true, type: () => [t["./modules/notification/entities/notification.entity"].Notification] }, clubs: { required: true, type: () => [t["./modules/club/entities/userInClub.entity"].UserInClub] }, posts: { required: true, type: () => [t["./modules/club/entities/clubPost.entity"].ClubPost] }, likes: { required: true, type: () => [t["./modules/club/entities/clubPost.entity"].ClubPost] }, clubPostComments: { required: true, type: () => [t["./modules/club/entities/clubPostComment.entity"].ClubPostComment] } } }], [import("./modules/auth/dto/auth.dto"), { "SignUpDto": { nickname: { required: true, type: () => String, minLength: 3, maxLength: 20 }, email: { required: true, type: () => String }, password: { required: true, type: () => String }, countryCode: { required: true, type: () => String } }, "LoginDto": { nickname: { required: false, type: () => String, minLength: 3, maxLength: 20 }, email: { required: false, type: () => String }, password: { required: true, type: () => String } }, "forgotPasswordDto": { email: { required: true, type: () => String } }, "resetPasswordDto": { token: { required: true, type: () => String }, newPassword: { required: true, type: () => String } } }], [import("./modules/user/dto/updateUser.dto"), { "UpdateUserDto": { email: { required: false, type: () => String }, nickname: { required: false, type: () => String }, dateOfBirth: { required: false, type: () => Date }, countryCode: { required: false, type: () => String } } }], [import("./modules/auth/responses/signUpResponses.dto"), { "SignUpResponse201Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ access_token: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } }, "SignUpResponse400Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } }, "SignUpResponse409Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } } }], [import("./modules/auth/responses/logInResponses.dto"), { "LogInResponse200Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ access_token: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } }, "LogInResponse400Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } }, "LogInResponse401Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } } }], [import("./modules/auth/responses/forgotPasswordResponses.dto"), { "ForgotPasswordResponse200Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, timestamp: { required: true, type: () => String } }, "ForgotPasswordResponse400Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } } }], [import("./modules/auth/responses/resetPasswordResponses.dto"), { "ForgotPasswordResponse200Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, timestamp: { required: true, type: () => String } }, "ForgotPasswordResponse400Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } }, "ForgotPasswordResponse401Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } } }], [import("./modules/chess/submodules/handle-game/dto/makeMove.dto"), { "MakeMoveDTO": { playerId: { required: true, type: () => String }, from: { required: true, type: () => String }, to: { required: true, type: () => String }, promotion: { required: false, type: () => String } } }], [import("./modules/chess/submodules/game-link/dto/game-link.dto"), { "CreateGameLinkDto": { gameMode: { required: true, type: () => Object } }, "GetGameByGameLinkDto": { encodedId: { required: true, type: () => String, minLength: 4 } } }], [import("./modules/chess/submodules/game-link/responses/createGameLinkResponses.dto"), { "CreateGameLinkResponse201Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ encodedGameId: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } }, "CreateGameLinkResponse400Dto": { status: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, path: { required: true, type: () => String }, data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) }, timestamp: { required: true, type: () => String } } }], [import("./modules/chess/submodules/random-pairing/dto/joinGame.dto"), { "JoinGameDTO": { playerId: { required: true, type: () => String }, mode: { required: true, type: () => Object }, bet: { required: false, type: () => Number }, timeInMinutes: { required: true, type: () => Number }, timeIncrementPerMoveSeconds: { required: true, type: () => Number } } }], [import("./modules/chess/submodules/handle-game/dto/acceptDraw.dto"), { "AcceptDrawDTO": { playerId: { required: true, type: () => String }, gameId: { required: true, type: () => String } } }], [import("./modules/chess/submodules/handle-game/dto/offerDraw.dto"), { "OfferDrawDTO": { playerId: { required: true, type: () => String }, gameId: { required: true, type: () => String } } }], [import("./modules/chess/submodules/rewatch/responses/rewatchGameResponses.dto"), { "RewatchGameResponse200Dto": { data: { required: true, type: () => t["./modules/chess/entities/game"].Game } }, "RewatchGameResponse400Dto": { data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) } }, "RewatchGameResponse404Dto": { data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) } }, "RewatchGameResponse406Dto": { data: { required: true, type: () => ({ message: { required: true, type: () => [String] }, error: { required: true, type: () => String } }) } } }], [import("./modules/user/dto/responses/searchResponses.dto"), { "SearchReponse200Dto": { data: { required: true } } }], [import("./modules/notification/dto/friendGameInvite.dto"), { "FriendGameInviteDto": { receiverId: { required: true, type: () => Number } } }], [import("./modules/puzzle/responses/getRandomPuzzleResponses.dto"), { "GetRandomPuzzleResponses200Dto": { data: { required: true, type: () => ({ lichessId: { required: true, type: () => String }, fen: { required: true, type: () => String }, solution: { required: true, type: () => String }, rating: { required: true, type: () => Number }, popularity: { required: true, type: () => Number } }) } } }], [import("./modules/puzzle/responses/puzzleResponse.dto"), { "GetPuzzleResponses200Dto": { data: { required: true, type: () => ({ id: { required: true, type: () => Number }, lichessId: { required: true, type: () => String }, fen: { required: true, type: () => String }, solution: { required: true, type: () => String }, rating: { required: true, type: () => Number }, popularity: { required: true, type: () => Number } }) } } }], [import("./modules/notification/dto/manageFriendGameInvite.dto"), { "AcceptFriendGameInviteDto": { notificationId: { required: true, type: () => Number } } }]], "controllers": [[import("./modules/auth/auth.controller"), { "AuthController": { "signUp": {}, "login": {}, "forgotPassword": {}, "resetPassword": {} } }], [import("./modules/chess/submodules/game-link/game-link.controller"), { "GameLinkController": { "createGameLink": {} } }], [import("./modules/chess/submodules/rewatch/rewatch.controller"), { "RewatchGameController": { "getGameLinkByGameId": { type: t["./modules/chess/entities/db/game.entity"].Game } } }], [import("./modules/chess/submodules/game-history/game-history.controller"), { "GameHistoryController": { "getGameHistory": { type: [t["./modules/chess/entities/db/game.entity"].Game] } } }], [import("./modules/assets/assets.controller"), { "AssetsController": { "getAvatarList": { type: [t["./modules/user/entities/userAvatar.entity"].UserAvatarImg] } } }], [import("./modules/user/user.controller"), { "UserController": { "searchUsers": {}, "getUsers": { type: t["./modules/user/entities/user.entity"].User }, "updateUser": {}, "updateAvatar": { type: t["./modules/user/entities/user.entity"].User }, "getUserFriends": {} } }], [import("./modules/puzzle/puzzle.controller"), { "PuzzleController": { "getRandomPuzzle": {}, "getPuzzleById": { type: t["./modules/puzzle/entities/puzzle.entity"].Puzzle } } }]] } };
};