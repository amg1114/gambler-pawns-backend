/** Gen Random color for chess side assignation */
export function getRandomColor(): "white" | "black" {
    return Math.random() < 0.5 ? "white" : "black";
}

/**
 * Formats the ELO variation after the game ends based on the winner and the player.
 *
 * @param {"w" | "b" | "draw"} winner - The winner of the game ("w" for white, "b" for black, "d" for draw).
 * @param {"white" | "black"} player - The player for whom the ELO variation is being calculated.
 * @param {number} variation - The ELO variation value.
 * @returns {number} The formatted ELO variation. Returns 0 in case of a draw, positive variation if the player won, and negative variation if the player lost.
 */
export function formatEloVariationAfterGameEnd(
    winner: "w" | "b" | "draw",
    player: "w" | "b",
    variation: number,
): number {
    return winner === player ? variation : variation * -1;
}
