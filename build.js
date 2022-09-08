const esbuild = require("esbuild");
const kontra = require("esbuild-plugin-kontra");

esbuild.build({
  entryPoints: ["js/game.js"],
  bundle: true,
  outfile: "game.dist.js",
  plugins: [
    kontra({
      gameObject: {
        anchor: true,
        opacity: true,
        ttl: true,
        velocity: true,
        rotation: true,
        group: true,
      },
      text: {
        newline: true,
        rtl: true,
        textAlign: true,
      },
      vector: {
        clamp: false,
        length: false,
      },
      sprite: { image: true },
    }),
  ],
});
