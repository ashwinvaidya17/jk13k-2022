export default class ReplayObject {
  constructor(sprite, wallTime) {
    this.sprite = sprite;
    this.locationHistory = [];
    this.startTime = wallTime;
    this.shouldRender = false;
  }
  save() {
    if (this.sprite.children.length === 0) {
      this.locationHistory.push({
        x: this.sprite.x,
        y: this.sprite.y,
        rotation: this.sprite.rotation,
      });
    } else {
      let data = [];
      for (let child of this.sprite.children) {
        data.push({
          x: this.sprite.x + child.x,
          y: this.sprite.y + child.y,
          rotation: this.sprite.rotation + child.rotation,
        });
      }
      this.locationHistory.push(data);
    }
  }
  update(time) {
    if (
      time >= this.startTime &&
      time - this.startTime < this.locationHistory.length
    ) {
      this.shouldRender = true;
      if (this.sprite.children.length === 0) {
        this.sprite.x = this.locationHistory[time - this.startTime].x;
        this.sprite.y = this.locationHistory[time - this.startTime].y;
        this.sprite.rotation =
          this.locationHistory[time - this.startTime].rotation;
      } else {
        for (let i = 0; i < this.sprite.children.length; i++) {
          this.sprite.children[i].x =
            this.locationHistory[time - this.startTime][i].x;
          this.sprite.children[i].y =
            this.locationHistory[time - this.startTime][i].y;
          this.sprite.children[i].rotation =
            this.locationHistory[time - this.startTime][i].rotation;
        }
      }
    } else {
      this.shouldRender = false;
      if (this.sprite.isVisible != undefined) {
        this.sprite.isVisible = false;
      }
    }
  }
}
