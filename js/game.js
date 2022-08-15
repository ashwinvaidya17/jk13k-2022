import { collides, GameLoop, init } from "kontra";
import Agent from "./agent";
import MakeRoom from "./temp_room";

init();

let agent = Agent();
let room = MakeRoom();

let loop = GameLoop({
  // create the main game loop
  update: function (dt) {
    // update the game state
    room.update();
    agent.update(dt);
    if (collides(agent, room)) {
      agent.y = room.y - agent.height;
      agent.y_vel = 0;
      agent.apply_gravity = false;
    } else {
      agent.apply_gravity = true;
    }
  },
  render: function () {
    // render the game state
    room.render();
    agent.render();
  },
});

loop.start(); // start the game
