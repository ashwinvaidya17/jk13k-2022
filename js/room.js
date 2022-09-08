import { Scene, Sprite } from "kontra";

const borderWidth = 20;
export default function MakeRoom() {
  let color = "#2d404f";
  let leftBorder = Sprite({
    x: 0, // starting x,y position of the sprite
    y: 0,
    width: borderWidth, // width and height of the sprite
    height: 700,
    color: color,
  });

  let rightBorder = Sprite({
    x: 900 - borderWidth, // starting x,y position of the sprite
    y: 0,
    width: borderWidth, // width and height of the sprite
    height: 700,
    color: color,
  });

  let bottomBorder = Sprite({
    x: 0,
    y: 700 - borderWidth,
    width: 900,
    height: borderWidth,
    color: color,
  });

  let topBorder = Sprite({
    x: 0,
    y: 0,
    width: 900,
    height: borderWidth,
    color: color,
  });

  let obstacle1 = Sprite({
    x: 200,
    y: 600,
    width: 200,
    height: 20,
    color: color,
  });

  let obstacle2 = Sprite({
    x: 500,
    y: 400,
    width: 200,
    height: 20,
    color: color,
  });

  let obstacle3 = Sprite({
    x: 200,
    y: 200,
    width: 200,
    height: 20,
    color: color,
  });

  return Scene({
    id: "room",
    objects: [
      leftBorder,
      bottomBorder,
      rightBorder,
      topBorder,
      obstacle1,
      obstacle2,
      obstacle3,
    ],
  });
}
