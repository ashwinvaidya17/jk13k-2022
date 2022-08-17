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
        opacity: false,
        ttl: true,
        velocity: true,
        rotation: true,
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
    }),
  ],
});
