(() => {
  // node_modules/kontra/kontra.mjs
  var noop = () => {
  };
  var srOnlyStyle = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);";
  function addToDom(node, canvas2) {
    let container = canvas2.parentNode;
    node.setAttribute("data-kontra", "");
    if (container) {
      let target = container.querySelector("[data-kontra]:last-of-type") || canvas2;
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
  var fontSizeRegex = /(\d+)(\w+)/;
  function parseFont(font) {
    let match = font.match(fontSizeRegex);
    let size = +match[1];
    let unit = match[2];
    let computed = size;
    return {
      size,
      unit,
      computed
    };
  }
  var Text = class extends GameObject {
    init({
      text = "",
      textAlign = "",
      lineHeight = 1,
      font = getContext().font,
      ...props
    } = {}) {
      text = "" + text;
      super.init({
        text,
        textAlign,
        lineHeight,
        font,
        ...props
      });
      this._p();
    }
    get width() {
      return this._w;
    }
    set width(value) {
      this._d = true;
      this._w = value;
      this._fw = value;
    }
    get text() {
      return this._t;
    }
    set text(value) {
      this._d = true;
      this._t = "" + value;
    }
    get font() {
      return this._f;
    }
    set font(value) {
      this._d = true;
      this._f = value;
      this._fs = parseFont(value).computed;
    }
    get lineHeight() {
      return this._lh;
    }
    set lineHeight(value) {
      this._d = true;
      this._lh = value;
    }
    render() {
      if (this._d) {
        this._p();
      }
      super.render();
    }
    _p() {
      this._s = [];
      this._d = false;
      let context2 = this.context;
      context2.font = this.font;
      if (!this._s.length && this.text.includes("\n")) {
        let width = 0;
        this.text.split("\n").map((str) => {
          this._s.push(str);
          width = Math.max(width, context2.measureText(str).width);
        });
        this._w = this._fw || width;
      }
      if (!this._s.length) {
        this._s.push(this.text);
        this._w = this._fw || context2.measureText(this.text).width;
      }
      this.height = this._fs + (this._s.length - 1) * this._fs * this.lineHeight;
      this._uw();
    }
    draw() {
      let alignX = 0;
      let textAlign = this.textAlign;
      let context2 = this.context;
      textAlign = this.textAlign || (context2.canvas.dir == "rtl" ? "right" : "left");
      alignX = textAlign == "right" ? this.width : textAlign == "center" ? this.width / 2 | 0 : 0;
      this._s.map((str, index) => {
        context2.textBaseline = "top";
        context2.textAlign = textAlign;
        context2.fillStyle = this.color;
        context2.font = this.font;
        context2.fillText(
          str,
          alignX,
          this._fs * this.lineHeight * index
        );
      });
    }
  };
  function factory$7() {
    return new Text(...arguments);
  }
  var pointers = /* @__PURE__ */ new WeakMap();
  var callbacks$1 = {};
  var pressedButtons = {};
  var pointerMap = {
    0: "left",
    1: "middle",
    2: "right"
  };
  function getPointer(canvas2 = getCanvas()) {
    return pointers.get(canvas2);
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
    let { canvas: canvas2, _s } = pointer;
    let rect = canvas2.getBoundingClientRect();
    let transform = _s.transform != "none" ? _s.transform.replace("matrix(", "").split(",") : [1, 1, 1, 1];
    let transformScaleX = parseFloat(transform[0]);
    let transformScaleY = parseFloat(transform[3]);
    let borderWidth2 = (getPropValue(_s, "border-left-width") + getPropValue(_s, "border-right-width")) * transformScaleX;
    let borderHeight = (getPropValue(_s, "border-top-width") + getPropValue(_s, "border-bottom-width")) * transformScaleY;
    let paddingWidth = (getPropValue(_s, "padding-left") + getPropValue(_s, "padding-right")) * transformScaleX;
    let paddingHeight = (getPropValue(_s, "padding-top") + getPropValue(_s, "padding-bottom")) * transformScaleY;
    return {
      scaleX: (rect.width - borderWidth2 - paddingWidth) / canvas2.width,
      scaleY: (rect.height - borderHeight - paddingHeight) / canvas2.height,
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
    let canvas2 = evt.target;
    let pointer = pointers.get(canvas2);
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
    canvas: canvas2 = getCanvas()
  } = {}) {
    let pointer = pointers.get(canvas2);
    if (!pointer) {
      let style = window.getComputedStyle(canvas2);
      pointer = {
        x: 0,
        y: 0,
        radius,
        touches: { length: 0 },
        canvas: canvas2,
        _cf: [],
        _lf: [],
        _o: [],
        _oo: null,
        _s: style
      };
      pointers.set(canvas2, pointer);
    }
    canvas2.addEventListener("mousedown", pointerDownHandler);
    canvas2.addEventListener("touchstart", pointerDownHandler);
    canvas2.addEventListener("mouseup", pointerUpHandler);
    canvas2.addEventListener("touchend", pointerUpHandler);
    canvas2.addEventListener("touchcancel", pointerUpHandler);
    canvas2.addEventListener("blur", blurEventHandler$2);
    canvas2.addEventListener("mousemove", mouseMoveHandler);
    canvas2.addEventListener("touchmove", mouseMoveHandler);
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
  function track(...objects) {
    objects.flat().map((object) => {
      let canvas2 = object.context ? object.context.canvas : getCanvas();
      let pointer = pointers.get(canvas2);
      if (!object._r) {
        object._r = object.render;
        object.render = function() {
          pointer._cf.push(this);
          this._r();
        };
        pointer._o.push(object);
      }
    });
  }
  function pointerPressed(button) {
    return !!pressedButtons[button];
  }
  var Button = class extends Sprite {
    init({
      padX = 0,
      padY = 0,
      text,
      disabled = false,
      onDown,
      onUp,
      ...props
    } = {}) {
      super.init({
        padX,
        padY,
        ...props
      });
      this.textNode = factory$7({
        ...text,
        context: this.context
      });
      if (!this.width) {
        this.width = this.textNode.width;
        this.height = this.textNode.height;
      }
      track(this);
      this.addChild(this.textNode);
      this._od = onDown || noop;
      this._ou = onUp || noop;
      let button = this._dn = document.createElement("button");
      button.style = srOnlyStyle;
      button.textContent = this.text;
      if (disabled) {
        this.disable();
      }
      button.addEventListener("focus", () => this.focus());
      button.addEventListener("blur", () => this.blur());
      button.addEventListener("keydown", (evt) => this._kd(evt));
      button.addEventListener("keyup", (evt) => this._ku(evt));
      addToDom(button, this.context.canvas);
      this._uw();
      this._p();
    }
    get text() {
      return this.textNode.text;
    }
    set text(value) {
      this._d = true;
      this.textNode.text = value;
    }
    destroy() {
      this._dn.remove();
    }
    _p() {
      if (this.text != this._dn.textContent) {
        this._dn.textContent = this.text;
      }
      this.textNode._p();
      let width = this.textNode.width + this.padX * 2;
      let height = this.textNode.height + this.padY * 2;
      this.width = Math.max(width, this.width);
      this.height = Math.max(height, this.height);
      this._uw();
    }
    render() {
      if (this._d) {
        this._p();
      }
      super.render();
    }
    enable() {
      this.disabled = this._dn.disabled = false;
      this.onEnable();
    }
    disable() {
      this.disabled = this._dn.disabled = true;
      this.onDisable();
    }
    focus() {
      if (!this.disabled) {
        this.focused = true;
        if (document.activeElement != this._dn)
          this._dn.focus();
        this.onFocus();
      }
    }
    blur() {
      this.focused = false;
      if (document.activeElement == this._dn)
        this._dn.blur();
      this.onBlur();
    }
    onOver() {
      if (!this.disabled) {
        this.hovered = true;
      }
    }
    onOut() {
      this.hovered = false;
    }
    onEnable() {
    }
    onDisable() {
    }
    onFocus() {
    }
    onBlur() {
    }
    onDown() {
      if (!this.disabled) {
        this.pressed = true;
        this._od();
      }
    }
    onUp() {
      if (!this.disabled) {
        this.pressed = false;
        this._ou();
      }
    }
    _kd(evt) {
      if (evt.code == "Enter" || evt.code == "Space") {
        this.onDown();
      }
    }
    _ku(evt) {
      if (evt.code == "Enter" || evt.code == "Space") {
        this.onUp();
      }
    }
  };
  function factory$6() {
    return new Button(...arguments);
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
      let canvas2 = context2.canvas;
      let section = this._dn = document.createElement("section");
      section.tabIndex = -1;
      section.style = srOnlyStyle;
      section.id = id;
      section.setAttribute("aria-label", name);
      addToDom(section, canvas2);
      Object.assign(this, {
        id,
        name,
        context: context2,
        cullObjects,
        cullFunction,
        sortFunction,
        ...props
      });
      let { width, height } = canvas2;
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
      tag: "agent",
      isVisible: true,
      width: body.width,
      height: body.height,
      children: [body, gun],
      y_vel: 0,
      apply_gravity: false,
      going_right: true,
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
        this.children.forEach((child) => {
          child.update(dt);
          child.flip_direction(this.going_right);
        });
      },
      render: function() {
        this.children.forEach((child) => child.render());
      }
    });
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

  // js/enemy.js
  function Enemy(agents, obstacles) {
    let canvas2 = getCanvas();
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
    function _fillObstacles(obstacles2, room) {
      for (let obstacle of obstacles2) {
        let x = Math.floor(obstacle.x / ENEMYDIM);
        let y = Math.floor(obstacle.y / ENEMYDIM);
        let w = Math.floor(obstacle.width / ENEMYDIM);
        let h = Math.floor(obstacle.height / ENEMYDIM);
        for (let i = x; i < x + w; i++) {
          for (let j = y; j < y + h; j++) {
            room[j][i] = 1;
          }
        }
      }
      return room;
    }
    function _discretizeRoom(obstacles2) {
      let nRows = Math.floor(canvas2.height / ENEMYDIM);
      let nCols = Math.floor(canvas2.width / ENEMYDIM);
      let room = [];
      for (let i = 0; i < nRows; i++) {
        room.push(new Array(nCols).fill(0));
      }
      return _fillObstacles(obstacles2, room);
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
      agents,
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
          this.x = clamp(0, canvas2.width - ENEMYDIM, this.x);
          this.y = clamp(0, canvas2.height - ENEMYDIM, this.y);
        } else {
          this.trajectory = this._aStar();
        }
      },
      _getNearestAgent: function() {
        let minDist = Infinity;
        let nearestAgent = this.agents[this.agents.length - 1];
        for (let agent of this.agents) {
          if (agent.isVisible) {
            let dist = Math.sqrt(
              agent.x - this.x ^ 2 + (agent.y - this.y) ^ 2
            );
            if (dist < minDist) {
              minDist = dist;
              nearestAgent = agent;
            }
          }
        }
        return nearestAgent;
      },
      _aStar: function() {
        let agent = this._getNearestAgent();
        let goal = [
          Math.floor(agent.x / ENEMYDIM),
          Math.floor(agent.y / ENEMYDIM)
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

  // js/replayObject.js
  var ReplayObject = class {
    constructor(sprite, wallTime) {
      this.sprite = sprite;
      this.locationHistory = [];
      this.startTime = wallTime;
      this.shouldRender = false;
    }
    save() {
      if (this.sprite.children == void 0) {
        this.locationHistory.push({
          x: this.sprite.x,
          y: this.sprite.y,
          rotation: this.sprite.rotation
        });
      } else {
        let data = [];
        for (let child of this.sprite.children) {
          data.push({
            x: this.sprite.x + child.x,
            y: this.sprite.y + child.y,
            rotation: this.sprite.rotation + child.rotation
          });
        }
        this.locationHistory.push(data);
      }
    }
    update(time) {
      if (time >= this.startTime && time - this.startTime < this.locationHistory.length) {
        this.shouldRender = true;
        if (this.sprite.children == void 0) {
          this.sprite.x = this.locationHistory[time - this.startTime].x;
          this.sprite.y = this.locationHistory[time - this.startTime].y;
          this.sprite.rotation = this.locationHistory[time - this.startTime].rotation;
        } else {
          for (let i = 0; i < this.sprite.children.length; i++) {
            this.sprite.children[i].x = this.locationHistory[time - this.startTime][i].x;
            this.sprite.children[i].y = this.locationHistory[time - this.startTime][i].y;
            this.sprite.children[i].rotation = this.locationHistory[time - this.startTime][i].rotation;
          }
        }
      } else {
        this.shouldRender = false;
        if (this.sprite.isVisible != void 0) {
          this.sprite.isVisible = false;
        }
      }
    }
  };

  // js/replayManager.js
  var ReplayManager = class {
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
    getAgents() {
      let agents = [];
      this.replayList.forEach((object) => {
        if (object.sprite.tag === "agent") {
          agents.push(object.sprite);
        }
      });
      return agents;
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
  };

  // js/room.js
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
      objects: [
        leftBorder,
        bottomBorder,
        rightBorder,
        topBorder,
        obstacle1,
        obstacle2,
        obstacle3
      ]
    });
  }

  // js/startScreen.js
  initPointer();
  function StartScreen() {
    let startButon = factory$6({
      x: 300,
      y: 100,
      anchor: { x: 0.5, y: 0.5 },
      text: {
        text: "Start Game",
        color: "white",
        font: "20px Arial, sans-serif",
        anchor: { x: 0.5, y: 0.5 }
      },
      padX: 20,
      padY: 10,
      render() {
        if (this.focused) {
          this.context.setLineDash([8, 10]);
          this.context.lineWidth = 3;
          this.context.strokeStyle = "red";
          this.context.strokeRect(0, 0, this.width, this.height);
        }
        if (this.pressed) {
          this.textNode.color = "yellow";
        } else if (this.hovered) {
          this.textNode.color = "red";
          canvas.style.cursor = "pointer";
        } else {
          this.textNode.color = "red";
          canvas.style.cursor = "initial";
        }
      }
    });
    return factory$2(
      {
        id: "startScreen",
        objects: [startButon]
      }
    );
  }

  // js/game.js
  init$1();
  initPointer();
  function createLoop() {
    let room = MakeRoom();
    let replayManager = new ReplayManager();
    let agent = Agent();
    var agents = replayManager.getAgents();
    agents.push(agent);
    let enemy = Enemy(agents, room.objects);
    let bulletList = [];
    let lmbPressed = false;
    replayManager.watch(agent);
    replayManager.watch(enemy);
    let startScreen = StartScreen();
    let startButon = factory$6({
      x: 300,
      y: 100,
      anchor: { x: 0.5, y: 0.5 },
      text: {
        text: "Start Game",
        color: "white",
        font: "20px Arial, sans-serif",
        anchor: { x: 0.5, y: 0.5 }
      },
      padX: 20,
      padY: 10,
      render() {
        if (this.focused) {
          this.context.setLineDash([8, 10]);
          this.context.lineWidth = 3;
          this.context.strokeStyle = "red";
          this.context.strokeRect(0, 0, this.width, this.height);
        }
        if (this.pressed) {
          this.textNode.color = "yellow";
        } else if (this.hovered) {
          this.textNode.color = "red";
          canvas.style.cursor = "pointer";
        } else {
          this.textNode.color = "red";
          canvas.style.cursor = "initial";
        }
      }
    });
    let screen = "gameScreen";
    function renderGameScreen() {
      room.render();
      agent.render();
      enemy.render();
      bulletList.forEach((bullet) => {
        bullet.render();
      });
      for (let object of replayManager.replayList) {
        if (object.shouldRender == true) {
          if (object.sprite.children == void 0) {
            object.sprite.render();
          } else {
            for (let child of object.sprite.children) {
              child.render();
            }
          }
        }
      }
    }
    function renderStartScreen() {
      startScreen.render();
    }
    function updateGameScreen(dt) {
      room.update();
      agent.update(dt);
      enemy.update(dt);
      replayManager.update(dt);
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
            if (bullets.x + bullets.width > obj.x && bullets.x < obj.x || bullets.x < obj.x + obj.width && bullets.x + bullets.width > obj.x + obj.width) {
              bullets.dx = -bullets.dx;
            }
            if (bullets.y + bullets.height > obj.y && bullets.y < obj.y || bullets.y < obj.y + obj.height && bullets.y + bullets.height > obj.y + obj.height) {
              bullets.dy = -bullets.dy;
            }
          }
        }
      }
      for (let bullet of bulletList) {
        if (collides(bullet, enemy)) {
          replayManager.endEpisode();
          resetEpisode();
          return;
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
          let posX = agent.x + Math.cos(agent.children[1].rotation) * agent.children[1].width;
          let posY = agent.y + agent.children[1].height / 2 + Math.sin(agent.children[1].rotation) * agent.children[1].width;
          let bullet = Bullet(posX, posY, vx, vy);
          bulletList.push(bullet);
          replayManager.watch(bullet);
        }
      } else {
        lmbPressed = false;
      }
      bulletList = bulletList.filter((bullet) => bullet.hitCount <= MAXHITCOUNT);
      bulletList.forEach((bullet) => {
        bullet.update(dt);
      });
    }
    function resetEpisode() {
      room = MakeRoom();
      agent = Agent();
      agents = replayManager.getAgents();
      agents.push(agent);
      enemy = Enemy(agents, room.objects);
      bulletList = [];
      lmbPressed = false;
      replayManager.watch(agent);
      replayManager.watch(enemy);
    }
    return GameLoop({
      update: function(dt) {
        switch (screen) {
          case "startScreen":
            renderStartScreen();
            break;
          case "gameScreen":
            updateGameScreen(dt);
            break;
          case "gameOverScreen":
            break;
        }
      },
      render: function() {
        switch (screen) {
          case "startScreen":
            renderStartScreen();
            break;
          case "gameScreen":
            renderGameScreen();
            break;
          case "gameOverScreen":
            break;
        }
      }
    });
  }
  var loop = createLoop();
  loop.start();
})();
