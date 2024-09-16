/* eslint-disable */
export default async () => {
    const t = {};
    return {
        "@nestjs/swagger": {
            models: [
                [
                    import("./auth/dto/auth.dto"),
                    {
                        SignUpDto: {
                            nickname: {
                                required: true,
                                type: () => String,
                                minLength: 3,
                                maxLength: 20,
                            },
                            email: { required: true, type: () => String },
                            password: { required: true, type: () => String },
                            countryCode: { required: true, type: () => String },
                        },
                        LoginDto: {
                            nickname: {
                                required: false,
                                type: () => String,
                                minLength: 3,
                                maxLength: 20,
                            },
                            email: { required: false, type: () => String },
                            password: { required: true, type: () => String },
                        },
                    },
                ],
                [
                    import("./websocket/dto/joinGame.dto"),
                    {
                        JoinGameDTO: {
                            playerId: { required: true, type: () => String },
                            eloRating: { required: true, type: () => Number },
                            mode: { required: true, type: () => Object },
                            bet: { required: false, type: () => Number },
                        },
                    },
                ],
                [
                    import("./websocket/dto/makeMove.dto"),
                    {
                        MakeMoveDTO: {
                            playerId: { required: true, type: () => String },
                            from: { required: true, type: () => String },
                            to: { required: true, type: () => String },
                        },
                    },
                ],
                [
                    import("./websocket/dto/acceptDraw.dto"),
                    {
                        AcceptDrawDTO: {
                            playerId: { required: true, type: () => String },
                            gameId: { required: true, type: () => String },
                        },
                    },
                ],
                [
                    import("./websocket/dto/offerDraw.dto"),
                    {
                        OfferDrawDTO: {
                            playerId: { required: true, type: () => String },
                            gameId: { required: true, type: () => String },
                        },
                    },
                ],
            ],
            controllers: [
                [
                    import("./auth/auth.controller"),
                    { AuthController: { signUp: {}, login: {} } },
                ],
            ],
        },
    };
};
