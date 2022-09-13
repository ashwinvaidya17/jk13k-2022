import { Button, Scene, Sprite } from "kontra";
export default function StartScreen() {
  let buttonPressed = false;
  let startImage = new Image();
  startImage.src = "assets/CHAOS.png";
  startImage.width = 800;
  startImage.height = 800;
  let buttonPressedimage = new Image();
  buttonPressedimage.src = "assets/blue_button03.png";
  buttonPressedimage.width = 200;
  buttonPressedimage.height = 40;
  let buttonUnpressedImage = new Image();
  buttonUnpressedImage.src = "assets/blue_button02.png";
  buttonUnpressedImage.width = 200;
  buttonUnpressedImage.height = 40;
  let instructionsImage = new Image();
  instructionsImage.src = "assets/instructions.png";
  instructionsImage.width = 800;
  instructionsImage.height = 500;
  let title = Sprite({
    x: 620,
    y: 350,
    anchor: { x: 0.5, y: 0.5 },
    width: 800,
    height: 800,
    image: startImage,
  });
  let startButon = Button({
    // sprite properties
    x: 450,
    y: 350,
    anchor: { x: 0.5, y: 0.5 },
    image: buttonUnpressedImage,
    // text properties
    text: {
      text: "Start Game",
      color: "white",
      font: "20px Arial, sans-serif",
      anchor: { x: 0.5, y: 0.5 },
    },
    onDown() {
      this.image = buttonPressedimage;
      this.y += 5;
    },
    onUp() {
      // change screen after mouse release so that it does not create a bullet at the start
      buttonPressed = true;
      this.image = buttonUnpressedImage;
      this.y -= 5;
    },
  });
  let instructions = Sprite({
    x: 450,
    y: 600,
    anchor: { x: 0.5, y: 0.5 },
    width: 800,
    height: 500,
    image: instructionsImage
  });
  return Scene({
    id: "startScreen",
    objects: [startButon, title, instructions],
    update: function () {
      if (buttonPressed) {
        return "gameScreen";
      }
      return "startScreen";
    },
  });
}
