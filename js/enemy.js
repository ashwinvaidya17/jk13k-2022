import { clamp, getCanvas, Sprite } from "kontra";
import { ENEMYDIM, ENEMYSPEED } from "./constants";

export default function Enemy(agent, obstacles) {
  let canvas = getCanvas();
  let directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  function _fillObstacles(obstacles, room) {
    for (let obstacle of obstacles) {
      // Find places where obstacles cover the grid
      let x = Math.floor(obstacle.x / ENEMYDIM);
      let y = Math.floor(obstacle.y / ENEMYDIM);
      let w = Math.ceil(obstacle.width / ENEMYDIM);
      let h = Math.ceil(obstacle.height / ENEMYDIM);
      for (let i = x; i < x + w; i++) {
        for (let j = y; j < y + h; j++) {
          room[j][i] = 1;
        }
      }
    }
    return room;
  }
  function _discretizeRoom(obstacles) {
    let nRows = Math.floor(canvas.height / ENEMYDIM);
    let nCols = Math.floor(canvas.width / ENEMYDIM);
    let room = [];
    for (let i = 0; i < nRows; i++) {
      room.push(new Array(nCols).fill(0));
    }
    return _fillObstacles(obstacles, room);
  }
  function findMin(open) {
    let min = open[0];
    let index = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < min.f) {
        min = open[i];
        index = i;
      }
    }
    return [index, min];
  }
  return Sprite({
    x: 50,
    y: 50,
    width: ENEMYDIM,
    height: ENEMYDIM,
    color: "green",
    room: _discretizeRoom(obstacles),
    agent: agent,
    timeCounter: 0,
    trajectory: [],
    update: function (dt) {
      // Only get new path every n seconds
      this.timeCounter += dt;
      if (this.timeCounter > 2) {
        this.trajectory = this._aStar();
        this.timeCounter = 0;
      }
      if (this.trajectory.length > 0) {
        let next = this.trajectory[0];
        let currX = Math.floor(this.x / ENEMYDIM);
        let currY = Math.floor(this.y / ENEMYDIM);
        if (next[0] === currX && next[1] === currY) {
          this.trajectory.shift();
        }
        let xDir = Math.sign(next[0] - currX);
        let yDir = Math.sign(next[1] - currY);
        this.x += xDir * dt * ENEMYSPEED;
        this.y += yDir * dt * ENEMYSPEED;
        this.x = clamp(0, canvas.width - ENEMYDIM, this.x);
        this.y = clamp(0, canvas.height - ENEMYDIM, this.y);
      } else {
        this.trajectory = this._aStar();
      }
    },
    _aStar: function () {
      let goal = [
        Math.floor(this.agent.x / ENEMYDIM),
        Math.floor(this.agent.y / ENEMYDIM),
      ];
      let start = {
        x: Math.floor(this.x / ENEMYDIM),
        y: Math.floor(this.y / ENEMYDIM),
        h: 1,
        parent: null,
      };
      let open = [start];
      let closed = [];
      let path = [];

      while (open.length > 0) {
        let minEle = findMin(open);
        let current = minEle[1];
        let index = minEle[0];
        if (current.x === goal[0] && current.y === goal[1]) {
          while (current) {
            path.push([current.x, current.y]);
            current = current.parent;
          }
          return path.reverse();
        }

        open.splice(index, 1);
        closed.push(current);
        for (let i = 0; i < directions.length; i++) {
          let next = {
            x: current.x + directions[i][0],
            y: current.y + directions[i][1],
            h: 0,
          };
          if (
            next.x < 0 ||
            next.x >= this.room[0].length ||
            next.y < 0 ||
            next.y >= this.room.length ||
            this.room[next.y][next.x] === 1
          ) {
            continue;
          }
          let distance =
            Math.abs(goal[0] - next.x) + Math.abs(goal[1] - next.y);
          if (!open.find((x) => x.x === next.x && x.y === next.y)) {
            open.push({
              x: next.x,
              y: next.y,
              h: 1 + current.h + distance,
              parent: current,
            });
            let neighbor = closed.find((x) => x.x === next.x && x.y === next.y);
            if (neighbor) {
              if (current.h + distance < neighbor.h) {
                neighbor.h = current.h + distance;
                neighbor.parent = current;
              }
            }
          }
        }
      }
      return false;
    },
  });
}