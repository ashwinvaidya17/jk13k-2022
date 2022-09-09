import { Button, Scene, Sprite, getCanvas  } from "kontra";
export default function StartScreen(screen) {
 
  let buttonPressed = false;
  let buttonPressedimage =  new Image();
  buttonPressedimage.src = 'assets/blue_button03.png'
  buttonPressedimage.width = 200;
  buttonPressedimage.height = 40;
  let buttonUnpressedImage = new Image();
  buttonUnpressedImage.src = 'assets/blue_button02.png'
  buttonUnpressedImage.width = 200;
  buttonUnpressedImage.height = 40;
  let title = Sprite({
    x: 450,
    y: 250,
    anchor: {x: 0.5, y: 0.5},
  
    // required for a rectangle sprite
    width: 400,
    height: 50,
    color: 'red',
    render: function(){
      
    }
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
    objects: [startButon, title],
    update: function (){
      if(buttonPressed){
        return "gameScreen"
      }
      return "startScreen"
    }
  });
}
