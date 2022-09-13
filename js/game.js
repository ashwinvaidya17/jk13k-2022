import { collides, GameLoop, init, initPointer, pointerPressed } from "kontra";
import Agent from "./agent";
import Bullet from "./bullet";
import { BULLETVELOCITY, MAXHITCOUNT, ROUNDS } from "./constants";
import Enemy from "./enemy";
import ReplayManager from "./replayManager";
import MakeRoom from "./room";
import StartScreen from "./startScreen";
import GameOverScreen from "./gameOverScreen";
import GameWinScreen from "./winGameScreen";
import ProgressBar from "./progressBar";

init();
initPointer();

function createLoop() {
  let victoryCounter = 0;
  let progressBar = ProgressBar(ROUNDS);
  progressBar.reset();
  let room = MakeRoom();
  let replayManager = new ReplayManager();
  let agent = Agent();
  let agents = replayManager.getAgents();
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
  let gameWinScreen = GameWinScreen();
  let screen = "startScreen";

  let pastBulletList = [];

  function renderGameScreen() {
    // render the game state
    room.render();
    progressBar.render();
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

  function updateGameWinScreen() {
    screen = gameWinScreen.update();
  }

  function renderGameWinScreen() {
    gameWinScreen.render();
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

  function _nextEpisode() {
    victoryCounter++;
    progressBar.removeIndicator();
    replayManager.endEpisode();
    resetEpisode();
  }

  function updateGameScreen(dt) {
    // update the game state
    room.update();
    agent.update(dt);

    enemy.update(dt);
    if (_checkEnemyCollision()) {
      // reset replay manager
      return _loseGame();
    }

    replayManager.update(dt);
    let collision = false;

    if (enemy.timeCounter >= 2) {
      enemy.timeCounter = 0;
      let positionX = enemy.x + enemy.width / 2;
      let positionY = enemy.y + enemy.height / 2;
      let hypotenuse = Math.sqrt(
        Math.pow(agent.x - enemy.x, 2) + Math.pow(agent.y - enemy.y, 2)
      );
      let velx = ((agent.x - enemy.x) / hypotenuse) * BULLETVELOCITY;
      let vely = ((agent.y - enemy.y) / hypotenuse) * BULLETVELOCITY;
      let bullet = Bullet(positionX, positionY, velx, vely);
      bullet.enemyFlag = true;
      bullet._setImage();
      bulletList.push(bullet);
      replayManager.watch(bullet);
    }
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
        if (bullet.enemyFlag == false) {
          _nextEpisode();
          return;
        }
      }
      // If bullets from the current episode collide with agent from this and past episodes, kill the agent
      for (let _agent of agents) {
        if (collides(bullet, _agent)) {
          return _loseGame();
        }
      }
    }
    // If the bullets from the past collide with the agent from this episode then kill this agent
    for (let bullet of pastBulletList) {
      if (collides(bullet, agent)) {
        return _loseGame();
      }
    }
    if (!collision) {
      agent.apply_gravity = true;
    }
    if (pointerPressed("left") && screen === "gameScreen") {
      if (!lmbPressed) {
        lmbPressed = true;
        let vx = Math.cos(agent.children[1].rotation) * BULLETVELOCITY;
        let vy = Math.sin(agent.children[1].rotation) * BULLETVELOCITY;
        let posX =
          Math.cos(agent.children[1].rotation) * agent.children[1].width +
          agent.children[1].x +
          agent.x;
        let posY =
          Math.sin(agent.children[1].rotation) * agent.children[1].width +
          agent.children[1].y +
          agent.y;
        let bullet = Bullet(posX, posY, vx, vy);
        bullet._setImage();
        bulletList.push(bullet);
        replayManager.watch(bullet);
      }
    } else {
      lmbPressed = false;
    }
    bulletList = bulletList.filter((bullet) => bullet.hitCount <= MAXHITCOUNT);
    bulletList.forEach((bullet) => {
      bullet.update();
    });
  }

  function _loseGame() {
    replayManager.reset();
    progressBar.reset();
    // reset episode
    victoryCounter = 0;
    resetEpisode();
    screen = "gameOverScreen";
    return;
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
    pastBulletList = replayManager.getBullets();

    if (victoryCounter === ROUNDS) {
      screen = "winGameScreen";
      progressBar.reset();
      replayManager.reset();
    }
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
        case "winGameScreen":
          updateGameWinScreen();
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
        case "winGameScreen":
          renderGameWinScreen();
      }
    },
  });
}

let loop = createLoop();
loop.start();
