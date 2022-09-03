import { collides, GameLoop, init, initPointer, pointerPressed } from "kontra";
import Agent from "./agent";
import Bullet from "./bullet";
import { BULLETVELOCITY, MAXHITCOUNT } from "./constants";
import Enemy from "./enemy";
import ReplayManager from "./replayManager";
import MakeRoom from "./room";

init();
initPointer();

function createLoop() {
  let room = MakeRoom();
  let agent = Agent();
  let enemy = Enemy(agent, room.objects);
  let bulletList = []; // list of bullets
  // store if left mouse button is pressed. This is needed so that bullet is not fired during the frames the button
  // is kept pressed.
  let lmbPressed = false;
  let replayManager = new ReplayManager();
  replayManager.watch(agent);
  replayManager.watch(enemy);

  function resetEpisode() {
    room = MakeRoom();
    agent = Agent();
    enemy = Enemy(agent, room.objects);
    bulletList = []; // list of bullets
    lmbPressed = false;
    replayManager.watch(agent);
    replayManager.watch(enemy);
  }

  return GameLoop({
    // create the main game loop

    update: function (dt) {
      // update the game state
      room.update();
      agent.update(dt);
      enemy.update(dt);
      replayManager.update(dt);
      let collision = false;

      for (let obj of room.objects) {
        if (collides(agent, obj)) {
          agent.y = obj.y - agent.height;
          agent.y_vel = 0;
          agent.apply_gravity = false;
          collision = true;
        }
        for (let bullets of bulletList) {
          if (collides(bullets, obj)) {
            bullets.hitCount++;
            if (
              (bullets.x + bullets.width > obj.x && bullets.x < obj.x) ||
              (bullets.x < obj.x + obj.width &&
                bullets.x + bullets.width > obj.x + obj.width)
            ) {
              bullets.dx = -bullets.dx;
            }
            if (
              (bullets.y + bullets.height > obj.y && bullets.y < obj.y) ||
              (bullets.y < obj.y + obj.height &&
                bullets.y + bullets.height > obj.y + obj.height)
            ) {
              bullets.dy = -bullets.dy;
            }
          }
        }
      }
      for (let bullet of bulletList) {
        if (collides(bullet, enemy)) {
          replayManager.endEpisode();
          resetEpisode();
          return;
        }
      }
      if (!collision) {
        agent.apply_gravity = true;
      }
      if (pointerPressed("left")) {
        if (!lmbPressed) {
          lmbPressed = true;
          let vx = Math.cos(agent.children[1].rotation) * BULLETVELOCITY;
          let vy = Math.sin(agent.children[1].rotation) * BULLETVELOCITY;
          let posX =
            agent.x +
            Math.cos(agent.children[1].rotation) * agent.children[1].width;
          let posY =
            agent.y +
            agent.children[1].height / 2 +
            Math.sin(agent.children[1].rotation) * agent.children[1].width;
          let bullet = Bullet(posX, posY, vx, vy);
          bulletList.push(bullet);
          replayManager.watch(bullet);
        }
      } else {
        lmbPressed = false;
      }
      bulletList = bulletList.filter(
        (bullet) => bullet.hitCount <= MAXHITCOUNT
      );
      bulletList.forEach((bullet) => {
        bullet.update(dt);
      });
    },
    render() {
      // render the game state
      room.render();
      agent.render();
      enemy.render();
      bulletList.forEach((bullet) => {
        bullet.render();
      });
      for (let object of replayManager.replayList) {
        if (object.shouldRender == true) {
          if (object.sprite.children == undefined) {
            object.sprite.render();
          } else {
            for (let child of object.sprite.children) {
              child.render();
            }
          }
        }
      }
    },
  });
}

let loop = createLoop();
loop.start();
