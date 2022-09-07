import { collides, GameLoop, init, initPointer, pointerPressed, pointerPressed } from "kontra";
import Agent from "./agent";
import Bullet from "./bullet";
import { BULLETVELOCITY, MAXHITCOUNT } from "./constants";
import Enemy from "./enemy";
import MakeRoom from "./room";
import StartScreen from "./startScreen";

init();
initPointer();
let startScreen = StartScreen();
let room = MakeRoom();
let agent = Agent();
let enemy = Enemy(agent, room.objects);
let bulletList = []; // list of bullets
// store if left mouse button is pressed. This is needed so that bullet is not fired during the frames the button
// is kept pressed.
let lmbPressed = false;
let startButon = Button({
  // sprite properties
  x: 300,
  y: 100,
  anchor: {x: 0.5, y: 0.5},

  // text properties
  text: {
    text: 'Start Game',
    color: 'white',
    font: '20px Arial, sans-serif',
    anchor: {x: 0.5, y: 0.5}
  },

  // button properties
  padX: 20,
  padY: 10,

 render() {
    // focused by keyboard
    if (this.focused) {
      this.context.setLineDash([8,10]);
      this.context.lineWidth = 3;
      this.context.strokeStyle = 'red';
      this.context.strokeRect(0, 0, this.width, this.height);
    }

    // pressed by mouse, touch, or enter/space on keyboard
    if (this.pressed) {
      this.textNode.color = 'yellow';
    }
    // hovered by mouse
    else if (this.hovered) {
      this.textNode.color = 'red';
      canvas.style.cursor = 'pointer';
    }
    else  {
      this.textNode.color = 'red';
      canvas.style.cursor = 'initial';
    }
  }
});
let screen = "gameScreen"
let loop = GameLoop({
  // create the main game loop

  update: function (dt) {
    switch(screen){
      case "startScreen":
          break;
      case "gameScreen": 
            updateGameScreen(dt);
            break;
      case "gameOverScreen":
          break;
    }
    // update the game state
//    updateGameScreen(dt);
  },
  render: function () {
    // render the game state
    switch(screen){
      case "startScreen": 
      //     renderStartScreen();
            break;
      case "gameScreen": 
            renderGameScreen();
            break;
      case "gameOverScreen":
          break;
    }
    
  }
});

loop.start(); // start the game

function renderGameScreen() {
  room.render();
  agent.render();
  enemy.render();
  bulletList.forEach((bullet) => {
    bullet.render();
  });
}

function renderStartScreen(){
  startScreen.render();
}

function updateGameScreen(dt) {
  room.update();
  agent.update(dt);
  enemy.update(dt);

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
        if ((bullets.x + bullets.width > obj.x && bullets.x < obj.x) ||
          (bullets.x < obj.x + obj.width &&
            bullets.x + bullets.width > obj.x + obj.width)) {
          bullets.dx = -bullets.dx;
        }
        if ((bullets.y + bullets.height > obj.y && bullets.y < obj.y) ||
          (bullets.y < obj.y + obj.height &&
            bullets.y + bullets.height > obj.y + obj.height)) {
          bullets.dy = -bullets.dy;
        }
      }
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
      let posX = agent.x +
        Math.cos(agent.children[1].rotation) * agent.children[1].width;
      let posY = agent.y +
        agent.children[1].height / 2 +
        Math.sin(agent.children[1].rotation) * agent.children[1].width;
      bulletList.push(Bullet(posX, posY, vx, vy));
    }
  } else {
    lmbPressed = false;
  }
  bulletList = bulletList.filter((bullet) => bullet.hitCount <= MAXHITCOUNT);
  bulletList.forEach((bullet) => {
    bullet.update(dt);
  });
}

