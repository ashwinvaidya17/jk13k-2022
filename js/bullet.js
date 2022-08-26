import { Sprite } from "kontra";

export default function Bullet(x, y, dx, dy) {
  return Sprite({
    x: x,
    y: y,
    width: 10,
    height: 10,
    color: "red",
    dx: dx,
    dy: dy,
    hitCount: 0,
  });
}
