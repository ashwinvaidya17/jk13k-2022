import { initKeys, keyPressed, Sprite } from "kontra";
import { gravity } from "./constants";

initKeys();

const speed = 200;
const jumpForce = -250;

export default function Agent() {
  return Sprite({
    x: 0, // starting x,y position of the sprite
    y: 0,
    width: 20, // width and height of the sprite
    height: 40,
    color: "white",
    y_vel: 0,
    apply_gravity: false,

    update: function (dt) {
      if (keyPressed("arrowleft")) {
        this.x -= speed * dt;
      }
      if (keyPressed("arrowright")) {
        this.x += speed * dt;
      }
      if (keyPressed("space") && !this.apply_gravity) {
        this.y_vel = jumpForce;
      }
      // Gravity
      if (this.apply_gravity) {
        this.y_vel += gravity * dt;
        this.y += this.y_vel * dt;
      }
    },
  });
}
