import { collides, GameLoop, init, initPointer, pointerPressed } from "kontra";
import Agent from "./agent";
import Bullet from "./bullet";
import { BULLETVELOCITY, MAXHITCOUNT } from "./constants";
import Enemy from "./enemy";
import ReplayManager from "./replayManager";
import MakeRoom from "./room";
import StartScreen from "./startScreen";
import GameOverScreen from "./gameOverScreen";

init();
initPointer();

function createLoop() {
  let room = MakeRoom();
  let replayManager = new ReplayManager();
  let agent = Agent();
  var agents = replayManager.getAgents();
  agents.push(agent);
  let enemy = Enemy(agents, room.objects);
  let bulletList = []; // list of bullets
  // store if left mouse button is pressed. This is needed so that bullet is not fired during the frames the button
  // is kept pressed.
  let lmbPressed = false;
  replayManager.watch(agent);
  replayManager.watch(enemy);
  let startScreen = StartScreen();
  let gameOverScreen = GameOverScreen();
  let screen = "startScreen";

  function renderGameScreen() {
    // render the game state
    room.render();
    agent.render();
    enemy.render();
    bulletList.forEach((bullet) => {
      bullet.render();
    });
    for (let object of replayManager.replayList) {
      if (object.shouldRender == true) {
        if (object.sprite.children.length === 0) {
          object.sprite.render();
        } else {
          for (let child of object.sprite.children) {
            child.render();
          }
        }
      }
    }
  }

  function renderStartScreen() {
    startScreen.render();
  }

  function updateStartScreen() {
    screen = startScreen.update();
  }

  function updateGameOverScreen() {
    screen = gameOverScreen.update();
  }

  function rendergameOverScreen() {
    gameOverScreen.render();
  }

  function _checkEnemyCollision() {
    // Kill agent on collision
    for (let agent of enemy.agents) {
      if (agent.isVisible && collides(enemy, agent)) {
        return true;
      }
    }
    return false;
  }

  function updateGameScreen(dt) {
    // update the game state
    room.update();
    agent.update(dt);

    enemy.update(dt);
    if (_checkEnemyCollision()) {
      // reset replay manager
      replayManager.reset();
      // reset episode
      resetEpisode();
      screen = "gameOverScreen";
      return;
    }

    replayManager.update(dt);
    let collision = false;

    for (let obj of room.objects) {
      if (collides(agent, obj)) {
        // Bottom side
        if (agent.y + agent.height > obj.y && agent.y < obj.y) {
          agent.y = obj.y - agent.height;
        }
        // Right side
        else if (agent.x + agent.width > obj.x && agent.x < obj.x) {
          agent.x = obj.x - agent.width;
        }
        // Left side
        else if (
          agent.x < obj.x + obj.width &&
          agent.x + agent.width > obj.x + obj.width
        ) {
          agent.x = obj.x + obj.width;
        }
        // Top side
        else if (
          agent.y < obj.y + obj.height &&
          agent.y + agent.height > obj.y + obj.height
        ) {
          agent.y = obj.y + obj.height;
        }

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
          Math.cos(agent.children[1].rotation) * (agent.children[1].width / 2);
        let posY =
          agent.y +
          agent.children[1].height / 2 +
          Math.sin(agent.children[1].rotation) * (agent.children[1].width / 2);
        let bullet = Bullet(posX, posY, vx, vy);
        bulletList.push(bullet);
        replayManager.watch(bullet);
      }
    } else {
      lmbPressed = false;
    }
    bulletList = bulletList.filter((bullet) => bullet.hitCount <= MAXHITCOUNT);
    bulletList.forEach((bullet) => {
      bullet.update(dt);
    });
  }

  function resetEpisode() {
    room = MakeRoom();
    agent = Agent();
    agents = replayManager.getAgents();
    agents.push(agent);
    enemy = Enemy(agents, room.objects);

    bulletList = []; // list of bullets
    lmbPressed = false;
    replayManager.watch(agent);
    replayManager.watch(enemy);
  }

  return GameLoop({
    update: function (dt) {
      switch (screen) {
        case "startScreen":
          updateStartScreen();
          break;
        case "gameScreen":
          updateGameScreen(dt);
          break;
        case "gameOverScreen":
          updateGameOverScreen();
          break;
      }
    },
    render: function () {
      switch (screen) {
        case "startScreen":
          renderStartScreen();
          break;
        case "gameScreen":
          renderGameScreen();
          break;
        case "gameOverScreen":
          rendergameOverScreen();
          break;
      }
    },
  });
}

let loop = createLoop();
loop.start();
