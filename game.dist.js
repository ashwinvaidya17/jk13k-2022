(() => {
  // node_modules/kontra/kontra.mjs
  var noop = () => {
  };
  var callbacks$2 = {};
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
  function getContext() {
    return context;
  }
  function init$1(canvas2, { contextless = false } = {}) {
    canvasEl = document.getElementById(canvas2) || canvas2 || document.querySelector("canvas");
    if (contextless) {
      canvasEl = canvasEl || new Proxy({}, handler$1);
    }
    context = canvasEl.getContext("2d") || new Proxy({}, handler$1);
    context.imageSmoothingEnabled = false;
    emit("init");
    return { canvas: canvasEl, context };
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
      if (vec._c) {
        this.clamp(vec._a, vec._b, vec._d, vec._e);
        this.x = x;
        this.y = y;
      }
    }
    add(vec) {
      return new Vector(this.x + vec.x, this.y + vec.y, this);
    }
    length() {
      return Math.hypot(this.x, this.y);
    }
    clamp(xMin, yMin, xMax, yMax) {
      this._c = true;
      this._a = xMin;
      this._b = yMin;
      this._d = xMax;
      this._e = yMax;
    }
    get x() {
      return this._x;
    }
    get y() {
      return this._y;
    }
    set x(value) {
      this._x = this._c ? clamp(this._a, this._d, value) : value;
    }
    set y(value) {
      this._y = this._c ? clamp(this._b, this._e, value) : value;
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
      opacity = 1,
      ...props
    } = {}) {
      super.init({
        width,
        height,
        context: context2,
        anchor,
        opacity,
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
      let anchorX = -this.width * this.anchor.x;
      let anchorY = -this.height * this.anchor.y;
      if (anchorX || anchorY) {
        context2.translate(anchorX, anchorY);
      }
      this.context.globalAlpha = this.opacity;
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
        _wo = 1
      } = this.parent || {};
      this._wx = this.x;
      this._wy = this.y;
      this._ww = this.width;
      this._wh = this.height;
      this._wo = _wo * this.opacity;
    }
    get world() {
      return {
        x: this._wx,
        y: this._wy,
        width: this._ww,
        height: this._wh,
        opacity: this._wo
      };
    }
    get opacity() {
      return this._opa;
    }
    set opacity(value) {
      this._opa = value;
      this._pc();
    }
  };
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
  function clear(context2) {
    let canvas2 = context2.canvas;
    context2.clearRect(0, 0, canvas2.width, canvas2.height);
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

  // js/constants.js
  var gravity = 200;

  // js/agent.js
  initKeys();
  var speed = 200;
  var jumpForce = -250;
  function Agent() {
    return factory$8({
      x: 0,
      y: 0,
      width: 20,
      height: 40,
      color: "white",
      y_vel: 0,
      apply_gravity: false,
      update: function(dt) {
        if (keyPressed("arrowleft")) {
          this.x -= speed * dt;
        }
        if (keyPressed("arrowright")) {
          this.x += speed * dt;
        }
        if (keyPressed("space") && !this.apply_gravity) {
          this.y_vel = jumpForce;
        }
        if (this.apply_gravity) {
          this.y_vel += gravity * dt;
          this.y += this.y_vel * dt;
        }
      }
    });
  }

  // js/temp_room.js
  function MakeRoom() {
    return factory$8({
      x: 0,
      y: 760,
      width: 800,
      height: 40,
      color: "white"
    });
  }

  // js/game.js
  var { canvas } = init$1();
  var agent = Agent();
  var room = MakeRoom();
  var loop = GameLoop({
    update: function(dt) {
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
    render: function() {
      room.render();
      agent.render();
    }
  });
  loop.start();
})();
