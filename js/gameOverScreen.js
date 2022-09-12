import { Button, Scene, Sprite } from "kontra";
export default function GameOverScreen() {
  let buttonPressed = false;
  let gameOverImage = new Image();
  gameOverImage.src = "assets/game_over.png";
  gameOverImage.width = 800;
  gameOverImage.height = 800;
  let buttonPressedimage = new Image();
  buttonPressedimage.src = "assets/blue_button03.png";
  buttonPressedimage.width = 200;
  buttonPressedimage.height = 40;
  let buttonUnpressedImage = new Image();
  buttonUnpressedImage.src = "assets/blue_button02.png";
  buttonUnpressedImage.width = 200;
  buttonUnpressedImage.height = 40;
  let title = Sprite({
    x: 120,
    y: 50,
    anchor: { x: 0.5, y: 0.5 },
    width: 100,
    height: 100,
    image: gameOverImage,
  });
  let startButon = Button({
    x: 450,
    y: 350,
    anchor: { x: 0.5, y: 0.5 },
    image: buttonUnpressedImage,
    text: {
      text: "Restart",
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
  return Scene({
    id: "gameOverScreen",
    objects: [startButon, title],
    update: function () {
      if (buttonPressed) {
        buttonPressed = false;
        return "gameScreen";
      }
      return "gameOverScreen";
    },
  });
}
