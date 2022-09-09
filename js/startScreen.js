import { Button, Scene, setImagePath, load, imageAssets } from "kontra";
export default function StartScreen(screen) {
 
  let buttonPressed = false;
  setImagePath('assets/');
  load('blue_button02.png', 'blue_button03.png').then(()=>{console.log("Images loaded")})
  let buttonPressedimage =  new Image();
  buttonPressedimage.src = 'assets/blue_button03.png'
  buttonPressedimage.width = 100;
  buttonPressedimage.height = 20;
  let buttonUnpressedImage = new Image();
  buttonUnpressedImage.src = 'assets/blue_button02.png'
  buttonUnpressedImage.width = 100;
  buttonUnpressedImage.height = 20;
  let startButon = Button({
    // sprite properties
    x: 450,
    y: 350,
    anchor: { x: 0.5, y: 0.5 },
    image: imageAssets['blue_button02'],
    // text properties
    text: {
      text: "Start Game",
      color: "white",
      font: "20px Arial, sans-serif",
      anchor: { x: 0.5, y: 0.5 },
    },
    onDown() {
      buttonPressed = true;
      this.image = buttonPressedimage;
      this.y += 5;
    },
    onUp() {
      this.image = buttonUnpressedImage;
      this.y -= 5;
    }
  });
  return Scene({
    id: "startScreen",
    objects: [startButon],
    update: function (){
      if(buttonPressed){
        return "gameScreen"
      }
      return "startScreen"
    }
  });
}
