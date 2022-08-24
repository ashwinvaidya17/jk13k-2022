import {
  clamp,
  GameObject,
  getPointer,
  initKeys,
  keyPressed,
  pointerPressed,
  Sprite,
} from "kontra";
import Bullet from "./bullet";
import {
  AGENTSPEED,
  BULLETVELOCITY,
  GRAVITY,
  JUMPFORCE,
  MAXHITCOUNT,
} from "./constants";

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
        this.y = 3;
        // TODO change direction of sprite
      } else {
        this.x = 0;
        this.y = 8;
        // TODO change direction of sprite
      }
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
    // store if left mouse button is pressed. This is needed so that bullet is not fired during the frames the button
    // is kept pressed.
    lmb_pressed: false,
    bullets_list: [], // store list of bullets
    update: function (dt) {
      if (keyPressed("a") || keyPressed("arrowleft")) {
        this.x -= AGENTSPEED * dt;
        this.going_right = false;
      }
      if (keyPressed("d") || keyPressed("arrowright")) {
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
      if (pointerPressed("left")) {
        if (!this.lmb_pressed) {
          this.lmb_pressed = true;
          let vx = Math.cos(this.children[1].rotation) * BULLETVELOCITY;
          let vy = Math.sin(this.children[1].rotation) * BULLETVELOCITY;
          let posX =
            this.children[1].x +
            Math.cos(this.children[1].rotation) * this.children[1].width;
          let posY =
            this.children[1].y +
            this.children[1].height / 2 +
            Math.sin(this.children[1].rotation) * this.children[1].width;
          this.bullets_list.push(Bullet(posX, posY, vx, vy));
        }
      } else {
        this.lmb_pressed = false;
      }

      this.children.forEach((child) => {
        child.update(dt);
        child.flip_direction(this.going_right);
      });
      this.bullets_list = this.bullets_list.filter(
        (bullet) => bullet.hitCount <= MAXHITCOUNT
      );
      this.bullets_list.forEach((bullet) => {
        bullet.update(dt);
      });
    },
    render: function () {
      this.children.forEach((child) => child.render());
      this.bullets_list.forEach((bullet) => bullet.render());
    },
  });
}
