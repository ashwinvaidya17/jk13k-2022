(() => {
  // node_modules/kontra/kontra.mjs
  var noop = () => {
  };
  var srOnlyStyle = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);";
  function addToDom(node, canvas) {
    let container = canvas.parentNode;
    node.setAttribute("data-kontra", "");
    if (container) {
      let target = container.querySelector("[data-kontra]:last-of-type") || canvas;
      container.insertBefore(node, target.nextSibling);
    } else {
      document.body.appendChild(node);
    }
  }
  function removeFromArray(array, item) {
    let index = array.indexOf(item);
    if (index != -1) {
      array.splice(index, 1);
      return true;
    }
  }
  var callbacks$2 = {};
  function on(event, callback) {
    callbacks$2[event] = callbacks$2[event] || [];
    callbacks$2[event].push(callback);
  }
  function emit(event, ...args) {
    (callbacks$2[event] || []).map((fn) => fn(...args));
  }
  var canvasEl;
  var context;
  var handler$1 = {
    get(target, key) {
      if (key == "_proxy")
        return true;
      return noop;
    }
  };
  function getCanvas() {
    return canvasEl;
  }
  function getContext() {
    return context;
  }
  function init$1(canvas, { contextless = false } = {}) {
    canvasEl = document.getElementById(canvas) || canvas || document.querySelector("canvas");
    if (contextless) {
      canvasEl = canvasEl || new Proxy({}, handler$1);
    }
    context = canvasEl.getContext("2d") || new Proxy({}, handler$1);
    context.imageSmoothingEnabled = false;
    emit("init");
    return { canvas: canvasEl, context };
  }
  function rotatePoint(point, angle) {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    return {
      x: point.x * cos - point.y * sin,
      y: point.x * sin + point.y * cos
    };
  }
  function clamp(min, max, value) {
    return Math.min(Math.max(min, value), max);
  }
  function collides(obj1, obj2) {
    [obj1, obj2] = [obj1, obj2].map((obj) => getWorldRect(obj));
    return obj1.x < obj2.x + obj2.width && obj1.x + obj1.width > obj2.x && obj1.y < obj2.y + obj2.height && obj1.y + obj1.height > obj2.y;
  }
  function getWorldRect(obj) {
    let { x = 0, y = 0, width, height } = obj.world || obj;
    if (obj.mapwidth) {
      width = obj.mapwidth;
      height = obj.mapheight;
    }
    if (obj.anchor) {
      x -= width * obj.anchor.x;
      y -= height * obj.anchor.y;
    }
    return {
      x,
      y,
      width,
      height
    };
  }
  var Vector = class {
    constructor(x = 0, y = 0, vec = {}) {
      this.x = x;
      this.y = y;
    }
    add(vec) {
      return new Vector(this.x + vec.x, this.y + vec.y, this);
    }
  };
  function factory$a() {
    return new Vector(...arguments);
  }
  var Updatable = class {
    constructor(properties) {
      return this.init(properties);
    }
    init(properties = {}) {
      this.position = factory$a();
      this.velocity = factory$a();
      this.ttl = Infinity;
      Object.assign(this, properties);
    }
    update(dt) {
      this.advance(dt);
    }
    advance(dt) {
      let velocity = this.velocity;
      this.position = this.position.add(velocity);
      this._pc();
      this.ttl--;
    }
    get dx() {
      return this.velocity.x;
    }
    get dy() {
      return this.velocity.y;
    }
    set dx(value) {
      this.velocity.x = value;
    }
    set dy(value) {
      this.velocity.y = value;
    }
    isAlive() {
      return this.ttl > 0;
    }
    _pc() {
    }
  };
  var GameObject = class extends Updatable {
    init({
      width = 0,
      height = 0,
      context: context2 = getContext(),
      render = this.draw,
      update = this.advance,
      anchor = { x: 0, y: 0 },
      rotation = 0,
      ...props
    } = {}) {
      super.init({
        width,
        height,
        context: context2,
        anchor,
        rotation,
        ...props
      });
      this._di = true;
      this._uw();
      this._rf = render;
      this._uf = update;
    }
    update(dt) {
      this._uf(dt);
    }
    render() {
      let context2 = this.context;
      context2.save();
      if (this.x || this.y) {
        context2.translate(this.x, this.y);
      }
      if (this.rotation) {
        context2.rotate(this.rotation);
      }
      let anchorX = -this.width * this.anchor.x;
      let anchorY = -this.height * this.anchor.y;
      if (anchorX || anchorY) {
        context2.translate(anchorX, anchorY);
      }
      this._rf();
      if (anchorX || anchorY) {
        context2.translate(-anchorX, -anchorY);
      }
      context2.restore();
    }
    draw() {
    }
    _pc() {
      this._uw();
    }
    get x() {
      return this.position.x;
    }
    get y() {
      return this.position.y;
    }
    set x(value) {
      this.position.x = value;
      this._pc();
    }
    set y(value) {
      this.position.y = value;
      this._pc();
    }
    get width() {
      return this._w;
    }
    set width(value) {
      this._w = value;
      this._pc();
    }
    get height() {
      return this._h;
    }
    set height(value) {
      this._h = value;
      this._pc();
    }
    _uw() {
      if (!this._di)
        return;
      let {
        _wx = 0,
        _wy = 0,
        _wr = 0
      } = this.parent || {};
      this._wx = this.x;
      this._wy = this.y;
      this._ww = this.width;
      this._wh = this.height;
      this._wr = _wr + this.rotation;
      let { x, y } = rotatePoint({ x: this._wx, y: this._wy }, _wr);
      this._wx = x;
      this._wy = y;
    }
    get world() {
      return {
        x: this._wx,
        y: this._wy,
        width: this._ww,
        height: this._wh,
        rotation: this._wr
      };
    }
    get rotation() {
      return this._rot;
    }
    set rotation(value) {
      this._rot = value;
      this._pc();
    }
  };
  function factory$9() {
    return new GameObject(...arguments);
  }
  var Sprite = class extends GameObject {
    init({
      ...props
    } = {}) {
      super.init({
        ...props
      });
    }
    draw() {
      if (this.color) {
        this.context.fillStyle = this.color;
        this.context.fillRect(0, 0, this.width, this.height);
      }
    }
  };
  function factory$8() {
    return new Sprite(...arguments);
  }
  var pointers = /* @__PURE__ */ new WeakMap();
  var callbacks$1 = {};
  var pressedButtons = {};
  var pointerMap = {
    0: "left",
    1: "middle",
    2: "right"
  };
  function getPointer(canvas = getCanvas()) {
    return pointers.get(canvas);
  }
  function circleRectCollision(object, pointer) {
    let { x, y, width, height } = getWorldRect(object);
    do {
      x -= object.sx || 0;
      y -= object.sy || 0;
    } while (object = object.parent);
    let dx = pointer.x - Math.max(x, Math.min(pointer.x, x + width));
    let dy = pointer.y - Math.max(y, Math.min(pointer.y, y + height));
    return dx * dx + dy * dy < pointer.radius * pointer.radius;
  }
  function getCurrentObject(pointer) {
    let renderedObjects = pointer._lf.length ? pointer._lf : pointer._cf;
    for (let i = renderedObjects.length - 1; i >= 0; i--) {
      let object = renderedObjects[i];
      let collides2 = object.collidesWithPointer ? object.collidesWithPointer(pointer) : circleRectCollision(object, pointer);
      if (collides2) {
        return object;
      }
    }
  }
  function getPropValue(style, value) {
    return parseFloat(style.getPropertyValue(value)) || 0;
  }
  function getCanvasOffset(pointer) {
    let { canvas, _s } = pointer;
    let rect = canvas.getBoundingClientRect();
    let transform = _s.transform != "none" ? _s.transform.replace("matrix(", "").split(",") : [1, 1, 1, 1];
    let transformScaleX = parseFloat(transform[0]);
    let transformScaleY = parseFloat(transform[3]);
    let borderWidth2 = (getPropValue(_s, "border-left-width") + getPropValue(_s, "border-right-width")) * transformScaleX;
    let borderHeight = (getPropValue(_s, "border-top-width") + getPropValue(_s, "border-bottom-width")) * transformScaleY;
    let paddingWidth = (getPropValue(_s, "padding-left") + getPropValue(_s, "padding-right")) * transformScaleX;
    let paddingHeight = (getPropValue(_s, "padding-top") + getPropValue(_s, "padding-bottom")) * transformScaleY;
    return {
      scaleX: (rect.width - borderWidth2 - paddingWidth) / canvas.width,
      scaleY: (rect.height - borderHeight - paddingHeight) / canvas.height,
      offsetX: rect.left + (getPropValue(_s, "border-left-width") + getPropValue(_s, "padding-left")) * transformScaleX,
      offsetY: rect.top + (getPropValue(_s, "border-top-width") + getPropValue(_s, "padding-top")) * transformScaleY
    };
  }
  function pointerDownHandler(evt) {
    let button = evt.button != null ? pointerMap[evt.button] : "left";
    pressedButtons[button] = true;
    pointerHandler(evt, "onDown");
  }
  function pointerUpHandler(evt) {
    let button = evt.button != null ? pointerMap[evt.button] : "left";
    pressedButtons[button] = false;
    pointerHandler(evt, "onUp");
  }
  function mouseMoveHandler(evt) {
    pointerHandler(evt, "onOver");
  }
  function blurEventHandler$2(evt) {
    let pointer = pointers.get(evt.target);
    pointer._oo = null;
    pressedButtons = {};
  }
  function callCallback(pointer, eventName, evt) {
    let object = getCurrentObject(pointer);
    if (object && object[eventName]) {
      object[eventName](evt);
    }
    if (callbacks$1[eventName]) {
      callbacks$1[eventName](evt, object);
    }
    if (eventName == "onOver") {
      if (object != pointer._oo && pointer._oo && pointer._oo.onOut) {
        pointer._oo.onOut(evt);
      }
      pointer._oo = object;
    }
  }
  function pointerHandler(evt, eventName) {
    evt.preventDefault();
    let canvas = evt.target;
    let pointer = pointers.get(canvas);
    let { scaleX, scaleY, offsetX, offsetY } = getCanvasOffset(pointer);
    let isTouchEvent = evt.type.includes("touch");
    if (isTouchEvent) {
      Array.from(evt.touches).map(
        ({ clientX, clientY, identifier }) => {
          let touch = pointer.touches[identifier];
          if (!touch) {
            touch = pointer.touches[identifier] = {
              start: {
                x: (clientX - offsetX) / scaleX,
                y: (clientY - offsetY) / scaleY
              }
            };
            pointer.touches.length++;
          }
          touch.changed = false;
        }
      );
      Array.from(evt.changedTouches).map(
        ({ clientX, clientY, identifier }) => {
          let touch = pointer.touches[identifier];
          touch.changed = true;
          touch.x = pointer.x = (clientX - offsetX) / scaleX;
          touch.y = pointer.y = (clientY - offsetY) / scaleY;
          callCallback(pointer, eventName, evt);
          emit("touchChanged", evt, pointer.touches);
          if (eventName == "onUp") {
            delete pointer.touches[identifier];
            pointer.touches.length--;
            if (!pointer.touches.length) {
              emit("touchEnd");
            }
          }
        }
      );
    } else {
      pointer.x = (evt.clientX - offsetX) / scaleX;
      pointer.y = (evt.clientY - offsetY) / scaleY;
      callCallback(pointer, eventName, evt);
    }
  }
  function initPointer({
    radius = 5,
    canvas = getCanvas()
  } = {}) {
    let pointer = pointers.get(canvas);
    if (!pointer) {
      let style = window.getComputedStyle(canvas);
      pointer = {
        x: 0,
        y: 0,
        radius,
        touches: { length: 0 },
        canvas,
        _cf: [],
        _lf: [],
        _o: [],
        _oo: null,
        _s: style
      };
      pointers.set(canvas, pointer);
    }
    canvas.addEventListener("mousedown", pointerDownHandler);
    canvas.addEventListener("touchstart", pointerDownHandler);
    canvas.addEventListener("mouseup", pointerUpHandler);
    canvas.addEventListener("touchend", pointerUpHandler);
    canvas.addEventListener("touchcancel", pointerUpHandler);
    canvas.addEventListener("blur", blurEventHandler$2);
    canvas.addEventListener("mousemove", mouseMoveHandler);
    canvas.addEventListener("touchmove", mouseMoveHandler);
    if (!pointer._t) {
      pointer._t = true;
      on("tick", () => {
        pointer._lf.length = 0;
        pointer._cf.map((object) => {
          pointer._lf.push(object);
        });
        pointer._cf.length = 0;
      });
    }
    return pointer;
  }
  function pointerPressed(button) {
    return !!pressedButtons[button];
  }
  function clear(context2) {
    let canvas = context2.canvas;
    context2.clearRect(0, 0, canvas.width, canvas.height);
  }
  function GameLoop({
    fps = 60,
    clearCanvas = true,
    update = noop,
    render,
    context: context2 = getContext(),
    blur = false
  } = {}) {
    let accumulator = 0;
    let delta = 1e3 / fps;
    let step = 1 / fps;
    let clearFn = clearCanvas ? clear : noop;
    let last, rAF, now, dt, loop2;
    let focused = true;
    if (!blur) {
      window.addEventListener("focus", () => {
        focused = true;
      });
      window.addEventListener("blur", () => {
        focused = false;
      });
    }
    function frame() {
      rAF = requestAnimationFrame(frame);
      if (!focused)
        return;
      now = performance.now();
      dt = now - last;
      last = now;
      if (dt > 1e3) {
        return;
      }
      emit("tick");
      accumulator += dt;
      while (accumulator >= delta) {
        loop2.update(step);
        accumulator -= delta;
      }
      clearFn(context2);
      loop2.render();
    }
    loop2 = {
      update,
      render,
      isStopped: true,
      start() {
        last = performance.now();
        this.isStopped = false;
        requestAnimationFrame(frame);
      },
      stop() {
        this.isStopped = true;
        cancelAnimationFrame(rAF);
      }
    };
    return loop2;
  }
  var keydownCallbacks = {};
  var keyupCallbacks = {};
  var pressedKeys = {};
  var keyMap = {
    Enter: "enter",
    Escape: "esc",
    Space: "space",
    ArrowLeft: "arrowleft",
    ArrowUp: "arrowup",
    ArrowRight: "arrowright",
    ArrowDown: "arrowdown"
  };
  function call(callback = noop, evt) {
    if (callback._pd) {
      evt.preventDefault();
    }
    callback(evt);
  }
  function keydownEventHandler(evt) {
    let key = keyMap[evt.code];
    let callback = keydownCallbacks[key];
    pressedKeys[key] = true;
    call(callback, evt);
  }
  function keyupEventHandler(evt) {
    let key = keyMap[evt.code];
    let callback = keyupCallbacks[key];
    pressedKeys[key] = false;
    call(callback, evt);
  }
  function blurEventHandler() {
    pressedKeys = {};
  }
  function initKeys() {
    let i;
    for (i = 0; i < 26; i++) {
      keyMap["Key" + String.fromCharCode(i + 65)] = String.fromCharCode(
        i + 97
      );
    }
    for (i = 0; i < 10; i++) {
      keyMap["Digit" + i] = keyMap["Numpad" + i] = "" + i;
    }
    window.addEventListener("keydown", keydownEventHandler);
    window.addEventListener("keyup", keyupEventHandler);
    window.addEventListener("blur", blurEventHandler);
  }
  function keyPressed(key) {
    return !!pressedKeys[key];
  }
  function getAllNodes(object) {
    let nodes = [];
    if (object._dn) {
      nodes.push(object._dn);
    } else if (object.children) {
      object.children.map((child) => {
        nodes = nodes.concat(getAllNodes(child));
      });
    }
    return nodes;
  }
  var Scene = class {
    constructor({
      id,
      name = id,
      objects = [],
      context: context2 = getContext(),
      cullObjects = true,
      cullFunction = collides,
      sortFunction,
      ...props
    }) {
      this._o = [];
      let canvas = context2.canvas;
      let section = this._dn = document.createElement("section");
      section.tabIndex = -1;
      section.style = srOnlyStyle;
      section.id = id;
      section.setAttribute("aria-label", name);
      addToDom(section, canvas);
      Object.assign(this, {
        id,
        name,
        context: context2,
        cullObjects,
        cullFunction,
        sortFunction,
        ...props
      });
      let { width, height } = canvas;
      let x = width / 2;
      let y = height / 2;
      this.camera = factory$9({
        x,
        y,
        width,
        height,
        context: context2,
        centerX: x,
        centerY: y,
        anchor: { x: 0.5, y: 0.5 },
        render: this._rf.bind(this)
      });
      this.add(objects);
    }
    set objects(value) {
      this.remove(this._o);
      this.add(value);
    }
    get objects() {
      return this._o;
    }
    add(...objects) {
      objects.flat().map((object) => {
        this._o.push(object);
        getAllNodes(object).map((node) => {
          this._dn.appendChild(node);
        });
      });
    }
    remove(...objects) {
      objects.flat().map((object) => {
        removeFromArray(this._o, object);
        getAllNodes(object).map((node) => {
          addToDom(node, this.context);
        });
      });
    }
    show() {
      this.hidden = this._dn.hidden = false;
      let focusableObject = this._o.find((object) => object.focus);
      if (focusableObject) {
        focusableObject.focus();
      } else {
        this._dn.focus();
      }
      this.onShow();
    }
    hide() {
      this.hidden = this._dn.hidden = true;
      this.onHide();
    }
    destroy() {
      this._dn.remove();
      this._o.map((object) => object.destroy && object.destroy());
    }
    lookAt(object) {
      let { x, y } = object.world || object;
      this.camera.x = x;
      this.camera.y = y;
    }
    update(dt) {
      if (!this.hidden) {
        this._o.map((object) => object.update && object.update(dt));
      }
    }
    _rf() {
      let {
        _o,
        context: context2,
        _sx,
        _sy,
        camera,
        sortFunction,
        cullObjects,
        cullFunction
      } = this;
      context2.translate(_sx, _sy);
      let objects = _o;
      if (cullObjects) {
        objects = objects.filter(
          (object) => cullFunction(camera, object)
        );
      }
      if (sortFunction) {
        objects.sort(sortFunction);
      }
      objects.map((object) => object.render && object.render());
    }
    render() {
      if (!this.hidden) {
        let { context: context2, camera } = this;
        let { x, y, centerX, centerY } = camera;
        context2.save();
        this._sx = centerX - x;
        this._sy = centerY - y;
        context2.translate(this._sx, this._sy);
        camera.render();
        context2.restore();
      }
    }
    onShow() {
    }
    onHide() {
    }
  };
  function factory$2() {
    return new Scene(...arguments);
  }

  // js/bullet.js
  function Bullet(x, y, dx, dy) {
    return factory$8({
      x,
      y,
      width: 10,
      height: 10,
      color: "red",
      dx,
      dy,
      hitCount: 0
    });
  }

  // js/constants.js
  var GRAVITY = 200;
  var AGENTSPEED = 200;
  var JUMPFORCE = -250;
  var ENEMYSPEED = 100;
  var ENEMYDIM = 40;
  var BULLETVELOCITY = 10;
  var MAXHITCOUNT = 3;

  // js/agent.js
  initKeys();
  function Agent() {
    let body = factory$8({
      x: 0,
      y: 0,
      width: 20,
      height: 40,
      color: "white",
      flip_direction: function() {
      }
    });
    let gun = factory$8({
      x: body.width,
      y: 3,
      width: 30,
      height: 5,
      color: "white",
      rotation: 0,
      anchor: { x: 0, y: 0 },
      flip_direction: function(right) {
        if (right) {
          this.x = body.width;
          this.y = 3;
        } else {
          this.x = 0;
          this.y = 8;
        }
      }
    });
    return factory$9({
      x: 100,
      y: 400,
      rotation: 0,
      width: body.width,
      height: body.height,
      children: [body, gun],
      y_vel: 0,
      apply_gravity: false,
      going_right: true,
      lmb_pressed: false,
      bullets_list: [],
      update: function(dt) {
        if (keyPressed("a") || keyPressed("arrowleft")) {
          this.x -= AGENTSPEED * dt;
          this.going_right = false;
        }
        if (keyPressed("d") || keyPressed("arrowright")) {
          this.x += AGENTSPEED * dt;
          this.going_right = true;
        }
        if (keyPressed("space") && !this.apply_gravity) {
          this.y_vel = JUMPFORCE;
        }
        if (this.apply_gravity) {
          this.y_vel += GRAVITY * dt;
          this.y += this.y_vel * dt;
        }
        let pointer = getPointer();
        let temp_rotation = Math.atan2(pointer.y - this.y, pointer.x - this.x);
        if (this.going_right) {
          this.children[1].rotation = clamp(
            -Math.PI / 2,
            Math.PI / 2,
            temp_rotation
          );
        } else {
          if (temp_rotation <= -Math.PI / 2 && temp_rotation >= -Math.PI || temp_rotation >= Math.PI / 2 && temp_rotation <= Math.PI) {
            this.children[1].rotation = temp_rotation;
          }
        }
        if (pointerPressed("left")) {
          if (!this.lmb_pressed) {
            this.lmb_pressed = true;
            let vx = Math.cos(this.children[1].rotation) * BULLETVELOCITY;
            let vy = Math.sin(this.children[1].rotation) * BULLETVELOCITY;
            let posX = this.children[1].x + Math.cos(this.children[1].rotation) * this.children[1].width;
            let posY = this.children[1].y + this.children[1].height / 2 + Math.sin(this.children[1].rotation) * this.children[1].width;
            this.bullets_list.push(Bullet(posX, posY, vx, vy));
          }
        } else {
          this.lmb_pressed = false;
        }
        this.children.forEach((child) => {
          child.update(dt);
          child.flip_direction(this.going_right);
        });
        this.bullets_list = this.bullets_list.filter(
          (bullet) => bullet.hitCount <= MAXHITCOUNT
        );
        this.bullets_list.forEach((bullet) => {
          bullet.update(dt);
        });
      },
      render: function() {
        this.children.forEach((child) => child.render());
        this.bullets_list.forEach((bullet) => bullet.render());
      }
    });
  }

  // js/enemy.js
  function Enemy(agent2, obstacles) {
    let canvas = getCanvas();
    let directions = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1]
    ];
    function _fillObstacles(obstacles2, room2) {
      for (let obstacle of obstacles2) {
        let x = Math.floor(obstacle.x / ENEMYDIM);
        let y = Math.floor(obstacle.y / ENEMYDIM);
        let w = Math.floor(obstacle.width / ENEMYDIM);
        let h = Math.floor(obstacle.height / ENEMYDIM);
        for (let i = x; i < x + w; i++) {
          for (let j = y; j < y + h; j++) {
            room2[j][i] = 1;
          }
        }
      }
      return room2;
    }
    function _discretizeRoom(obstacles2) {
      let nRows = Math.floor(canvas.height / ENEMYDIM);
      let nCols = Math.floor(canvas.width / ENEMYDIM);
      let room2 = [];
      for (let i = 0; i < nRows; i++) {
        room2.push(new Array(nCols).fill(0));
      }
      return _fillObstacles(obstacles2, room2);
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
    return factory$8({
      x: 50,
      y: 50,
      width: ENEMYDIM,
      height: ENEMYDIM,
      color: "green",
      room: _discretizeRoom(obstacles),
      agent: agent2,
      timeCounter: 0,
      trajectory: [],
      update: function(dt) {
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
      _aStar: function() {
        let goal = [
          Math.floor(this.agent.x / ENEMYDIM),
          Math.floor(this.agent.y / ENEMYDIM)
        ];
        let start = {
          x: Math.floor(this.x / ENEMYDIM),
          y: Math.floor(this.y / ENEMYDIM),
          h: 1,
          parent: null
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
              h: 0
            };
            if (next.x < 0 || next.x >= this.room[0].length || next.y < 0 || next.y >= this.room.length || this.room[next.y][next.x] === 1) {
              continue;
            }
            let distance = Math.abs(goal[0] - next.x) + Math.abs(goal[1] - next.y);
            if (!open.find((x) => x.x === next.x && x.y === next.y)) {
              open.push({
                x: next.x,
                y: next.y,
                h: 1 + current.h + distance,
                parent: current
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
      }
    });
  }

  // js/temp_room.js
  var borderWidth = 20;
  function MakeRoom() {
    let leftBorder = factory$8({
      x: 0,
      y: 0,
      width: borderWidth,
      height: 700,
      color: "white"
    });
    let rightBorder = factory$8({
      x: 900 - borderWidth,
      y: 0,
      width: borderWidth,
      height: 700,
      color: "white"
    });
    let bottomBorder = factory$8({
      x: 0,
      y: 700 - borderWidth,
      width: 900,
      height: borderWidth,
      color: "white"
    });
    let topBorder = factory$8({
      x: 0,
      y: 0,
      width: 900,
      height: borderWidth,
      color: "white"
    });
    let obstacle1 = factory$8({
      x: 200,
      y: 600,
      width: 200,
      height: 20,
      color: "white"
    });
    let obstacle2 = factory$8({
      x: 500,
      y: 400,
      width: 200,
      height: 20,
      color: "white"
    });
    let obstacle3 = factory$8({
      x: 200,
      y: 200,
      width: 200,
      height: 20,
      color: "white"
    });
    return factory$2({
      id: "room",
      objects: [leftBorder, bottomBorder, rightBorder, topBorder, obstacle1, obstacle2, obstacle3]
    });
  }

  // js/game.js
  init$1();
  initPointer();
  var agent = Agent();
  var room = MakeRoom();
  var enemy = Enemy(agent, room.objects);
  var loop = GameLoop({
    update: function(dt) {
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
    render: function() {
      room.render();
      agent.render();
      enemy.render();
    }
  });
  loop.start();
})();
