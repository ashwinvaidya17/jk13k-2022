import { Scene, Sprite } from "kontra";

export default function MakeRoom() {
  let ground1 = Sprite({
    x: 0, // starting x,y position of the sprite
    y: 760,
    width: 800, // width and height of the sprite
    height: 40,
    color: "white",
  });

  let ground2 = Sprite({
    x: 400,
    y: 650,
    width: 400,
    height: 40,
    color: "white",
  });

  return Scene({
    id: "room",
    objects: [ground1, ground2],
  });
}
