import { Sprite } from "kontra";

export default function Bullet(x, y, dx, dy) {
  let imageAsset = new Image();
  imageAsset.src = "assets/cannon.png";
  imageAsset.width = 10;
  imageAsset.height = 10;
  return Sprite({
    x: x,
    y: y,
    dx: dx,
    dy: dy,
    hitCount: 0,
    enemyFlag: false,
    image: imageAsset,
  });
}
