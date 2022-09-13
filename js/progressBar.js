import { GameObject, Sprite } from "kontra";

const INDICATORWIDTH = 15;
const INDICATORHEIGHT = 25;
const MARGIN = 8;

function getIndicatorSprite() {
  return Sprite({
    x: 0,
    y: 0,
    width: INDICATORWIDTH,
    height: INDICATORHEIGHT,
    color: "#E54EC5",
  });
}

export default function ProgressBar(InitialSize) {
  let baseSprite = Sprite({
    x: 0,
    y: 0,
    width: (INDICATORWIDTH + MARGIN / 2) * InitialSize + MARGIN / 2,
    height: INDICATORHEIGHT + MARGIN,
    color: "#6E4EE5",
  });

  return GameObject({
    x: 700,
    y: 25,
    count: InitialSize,
    width: baseSprite.width,
    height: baseSprite.width,
    children: [baseSprite],
    reset: function () {
      this.count = InitialSize;
      this.children = [baseSprite];
      baseSprite.width =
        (INDICATORWIDTH + MARGIN / 2) * InitialSize + MARGIN / 2;
      this.width = baseSprite.width;
      for (let i = 0; i < InitialSize; i++) {
        let newIndicator = getIndicatorSprite();
        newIndicator.x = (INDICATORWIDTH + MARGIN / 2) * i + MARGIN / 2;
        newIndicator.y = MARGIN / 2;
        this.addChild(newIndicator);
      }
    },
    removeIndicator: function () {
      this.children[this.count].color = "#B94EE5";
      this.count -= 1;
      this.width = baseSprite.width;
    },
    render: function () {
      this.children.forEach((child) => {
        child.render();
      });
    },
  });
}
