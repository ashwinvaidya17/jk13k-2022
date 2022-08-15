import { Sprite } from "kontra";

export default function MakeRoom() {
  return Sprite({
    x: 0, // starting x,y position of the sprite
    y: 760,
    width: 800, // width and height of the sprite
    height: 40,
    color: "white",
  });
}
