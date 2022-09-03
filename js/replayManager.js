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
  endEpisode() {
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
