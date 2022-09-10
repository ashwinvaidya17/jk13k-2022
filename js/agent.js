import {
  clamp,
  GameObject,
  getCanvas,
  getPointer,
  initKeys,
  keyPressed,
  randInt,
  Sprite,
} from "kontra";
import { AGENTSPEED, GRAVITY, JUMPFORCE } from "./constants";

initKeys();

export default function Agent() {
  let bodyImage = new Image();
  bodyImage.src = "assets/agent.png";
  bodyImage.width = 40;
  bodyImage.height = 50;
  let body = Sprite({
    x: 0, // starting x,y position of the sprite
    y: 0,
    image: bodyImage,
    flip_direction: function () {
      // TODO change direction of the sprite
    },
  });

  let gunImage = new Image();
  gunImage.src = "assets/gun.png";
  gunImage.width = 30;
  gunImage.height = 15;
  let gun = Sprite({
    image: gunImage,
    x: body.width,
    y: 5,
    rotation: 0,
    anchor: { x: 0, y: 0 }, // anchor point for rotation
    flip_direction: function (right) {
      if (right) {
        this.x = body.width - 10;
        this.y = 5;
        this.scaleX = 1;
      } else {
        this.x = 10;
        this.y = 15;
        this.image.scaleX = -1;
      }
    },
  });

  return GameObject({
    x: randInt(body.width + 20, getCanvas().width - body.width + 20),
    y: getCanvas().height - body.height,
    rotation: 0,
    tag: "agent", // tag to identify the object
    isVisible: true,
    width: body.width,
    height: body.height,
    children: [body, gun],
    y_vel: 0,
    apply_gravity: false,
    going_right: true, // store direction to flip the sprite
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
