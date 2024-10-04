export class GamePlayer {
    public playerId: string;
    public isGuest: boolean;
    public side: "Whites" | "Blacks";
    public time: number; // seconds
    // get this info if player is registered
    // info for
    // TODO: get this data in service in order to send it
    public nickname: string = null;
    public aboutText: string = null;
    public eloRating: number = null;
    public avatarImgPath: string | null = null;

    constructor(playerId: string, side: "Whites" | "Blacks", time: number) {
        this.playerId = playerId;
        this.isGuest = this.playerId.includes("GuestPlayer");
        this.side = side;
        this.time = time;
    }

    assignDataToNonGuestUser(
        nickname: string,
        aboutText: string,
        eloRating: number,
        avatarImgPath: string,
    ) {
        this.nickname = nickname;
        this.aboutText = aboutText;
        this.eloRating = eloRating;
        this.avatarImgPath = avatarImgPath;
    }
}
