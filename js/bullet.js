import { Sprite } from "kontra";

export default function Bullet(x, y, dx, dy) {
  let agentBulletImage = new Image();
  let enemyBulletImage = new Image();
  agentBulletImage.src = "assets/cannon.png";
  agentBulletImage.width = 10;
  agentBulletImage.height = 10;
  enemyBulletImage.src = "assets/enemy_bullet.png";
  enemyBulletImage.width = 10;
  enemyBulletImage.height = 10;
  return Sprite({
    x: x,
    y: y,
    dx: dx,
    dy: dy,
    width: 10,
    height: 10,
    hitCount: 0,
    enemyFlag: false,
    tag: "bullet",
    _setImage: function () {
      if (this.enemyFlag) this.image = enemyBulletImage;
      else this.image = agentBulletImage;
    },
  });
}
