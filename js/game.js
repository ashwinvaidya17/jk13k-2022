import { collides, GameLoop, init, initPointer } from "kontra";
import Agent from "./agent";
import Enemy from "./enemy";
import MakeRoom from "./temp_room";

init();
initPointer();

let agent = Agent();
let room = MakeRoom();
let enemy = Enemy(agent, room.objects);

let loop = GameLoop({
  // create the main game loop

  update: function (dt) {
    // update the game state
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
    }
    if (!collision) {
      agent.apply_gravity = true;
    }
  },
  render: function () {
    // render the game state
    room.render();
    agent.render();
    enemy.render();
  },
});

loop.start(); // start the game
