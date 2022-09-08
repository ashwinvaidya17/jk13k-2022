import { Button, Scene } from "kontra";
export default function StartScreen() {
  let startButon = Button({
    // sprite properties
    x: 300,
    y: 100,
    anchor: { x: 0.5, y: 0.5 },

    // text properties
    text: {
      text: "Start Game",
      color: "white",
      font: "20px Arial, sans-serif",
      anchor: { x: 0.5, y: 0.5 },
    },

    // button properties
    padX: 20,
    padY: 10,

    render() {
      // focused by keyboard
      if (this.focused) {
        this.context.setLineDash([8, 10]);
        this.context.lineWidth = 3;
        this.context.strokeStyle = "red";
        this.context.strokeRect(0, 0, this.width, this.height);
      }
      // pressed by mouse, touch, or enter/space on keyboard
      if (this.pressed) {
        this.textNode.color = "yellow";
      }
      // hovered by mouse
      else if (this.hovered) {
        this.textNode.color = "red";
        // canvas.style.cursor = "pointer";
      } else {
        this.textNode.color = "red";
        // canvas.style.cursor = "initial";
      }
    },
  });
  return Scene({
    id: "startScreen",
    objects: [startButon],
  });
}
