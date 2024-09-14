// hacer una consulta para enviar datos del opnente:
// elo, nickname, avatar, countryCode
export interface Player {
    playerId: string;
    eloRating: number;
    socketId: string;
}
