export default function getRandomColor(): "white" | "black" {
    return Math.random() < 0.5 ? "white" : "black";
}
