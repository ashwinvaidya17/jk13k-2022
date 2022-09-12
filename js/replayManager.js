import ReplayObject from "./replayObject.js";

export default class ReplayManager {
  constructor() {
    this.watchList = [];
    this.replayList = [];
    this.bulletsWatchList = [];
    this.wallCounter = 0;
    this.counter = 0;
  }

  watch(object) {
    this.watchList.push(new ReplayObject(object, this.wallCounter));
  }

  reset() {
    // reset state
    this.watchList = [];
    this.replayList = [];
    this.bulletsWatchList = [];
    this.wallCounter = 0;
    this.counter = 0;
  }

  getAgents() {
    // gets the list of all the agents in the replay buffer
    let agents = [];
    this.replayList.forEach((object) => {
      if (object.sprite.tag === "agent") {
        agents.push(object.sprite);
      }
    });
    return agents;
  }

  getBullets() {
    // gets the list of all the bullets in the replay buffer
    let bullets = [];
    this.replayList.forEach((object) => {
      if (object.sprite.tag === "bullet") {
        bullets.push(object.sprite);
      }
    });
    return bullets;
  }

  endEpisode() {
    for (let object of this.watchList) {
      if (object.sprite.tag === "agent") {
        for (let child of object.sprite.children) {
          child.opacity = 0.2;
        }
      } else {
        object.sprite.opacity = 0.2;
      }
    }
    this.replayList = this.replayList.concat(this.watchList).slice();
    this.watchList = [];
    this.wallCounter = 0;
  }

  update() {
    this.watchList.forEach((object) => {
      object.save(this.wallCounter);
    });
    this.replayList.forEach((object) => {
      object.update(this.wallCounter);
    });
    this.wallCounter += 1;
  }
}
