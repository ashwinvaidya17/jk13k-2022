import { Button, Scene, Sprite } from "kontra";

export default function GameWinScreen() {
  let buttonPressed = false;
  let winGameImage = new Image();
  winGameImage.src = "assets/winText.png";
  winGameImage.width = 250;
  winGameImage.height = 100;
  let buttonPressedimage = new Image();
  buttonPressedimage.src = "assets/blue_button03.png";
  buttonPressedimage.width = 50;
  buttonPressedimage.height = 10;
  let buttonUnpressedImage = new Image();
  buttonUnpressedImage.src = "assets/blue_button02.png";
  buttonUnpressedImage.width = 200;
  buttonUnpressedImage.height = 40;
  let title = Sprite({
    x: 450,
    y: 250,
    anchor: { x: 0.5, y: 0.5 },
    // width: 100,
    // height: 100,
    image: winGameImage,
  });
  let startButon = Button({
    x: 450,
    y: 350,
    anchor: { x: 0.5, y: 0.5 },
    image: buttonUnpressedImage,
    text: {
      text: "Play Again",
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
    id: "winGameScreen",
    objects: [startButon, title],
    update: function () {
      if (buttonPressed) {
        buttonPressed = false;
        return "gameScreen";
      }
      return "winGameScreen";
    },
  });
}
