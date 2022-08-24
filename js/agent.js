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
    flip_direction: function () {
      // TODO change direction of the sprite
    },
  });

  let gun = Sprite({
    x: body.width,
    y: 3,
    width: 30,
    height: 5,
    color: "white",
    rotation: 0,
    anchor: { x: 0, y: 0 }, // anchor point for rotation
    flip_direction: function (right) {
      if (right) {
        this.x = body.width;
        // TODO change direction of sprite
      } else {
        this.x = 0;
        // TODO change direction of sprite
      }
      console.log(this.x, this.y, this.width, this.height);
    },
  });

  return GameObject({
    x: 100,
    y: 400,
    rotation: 0,
    width: body.width,
    height: body.height,
    children: [body, gun],
    y_vel: 0,
    apply_gravity: false,
    going_right: true, // store direction to flip the sprite
    update: function (dt) {
      if (keyPressed("arrowleft")) {
        this.x -= AGENTSPEED * dt;
        this.going_right = false;
      }
      if (keyPressed("arrowright")) {
        this.x += AGENTSPEED * dt;
        this.going_right = true;
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
      let temp_rotation = Math.atan2(pointer.y - this.y, pointer.x - this.x);
      if (this.going_right) {
        this.children[1].rotation = clamp(
          -Math.PI / 2,
          Math.PI / 2,
          temp_rotation
        );
      } else {
        if (
          (temp_rotation <= -Math.PI / 2 && temp_rotation >= -Math.PI) ||
          (temp_rotation >= Math.PI / 2 && temp_rotation <= Math.PI)
        ) {
          this.children[1].rotation = temp_rotation;
        }
      }

      this.children.forEach((child) => {
        child.update(dt);
        child.flip_direction(this.going_right);
      });
    },
    render: function () {
      this.children.forEach((child) => child.render());
    },
  });
}
