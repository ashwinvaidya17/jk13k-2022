import {
  clamp,
  GameObject,
  getPointer,
  initKeys,
  keyPressed,
  Sprite,
} from "kontra";
import { AGENTSPEED, GRAVITY, JUMPFORCE } from "./constants";

initKeys();

export default function Agent() {
  let body = Sprite({
    x: 0, // starting x,y position of the sprite
    y: 0,
    width: 20, // width and height of the sprite
    height: 40,
    color: "white",
  });

  let gun = Sprite({
    x: body.width + 10,
    y: 3,
    width: 20,
    height: 5,
    color: "white",
    rotation: 0,
    anchor: { x: 0, y: this.y }, // anchor point for rotation
  });

  return GameObject({
    x: 0,
    y: 400,
    rotation: 0,
    width: body.width,
    height: body.height,
    children: [body, gun],
    y_vel: 0,
    apply_gravity: false,
    update: function (dt) {
      this.children.forEach((child) => child.update(dt));
      if (keyPressed("arrowleft")) {
        this.x -= AGENTSPEED * dt;
      }
      if (keyPressed("arrowright")) {
        this.x += AGENTSPEED * dt;
      }
      if (keyPressed("space") && !this.apply_gravity) {
        this.y_vel = JUMPFORCE;
      }
      // Gravity
      if (this.apply_gravity) {
        this.y_vel += GRAVITY * dt;
        this.y += this.y_vel * dt;
      }

      let pointer = getPointer();
      this.children[1].rotation = Math.atan2(
        pointer.y - this.y,
        pointer.x - this.x
      );
      this.children[1].rotation = clamp(
        -Math.PI / 2,
        Math.PI / 2,
        this.children[1].rotation
      );
    },
    render: function () {
      this.children.forEach((child) => child.render());
    },
  });
}
