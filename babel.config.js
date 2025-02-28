/** @type {import('@babel/core').TransformOptions} */
const config = {
  presets: [["@babel/preset-env", { targets: { node: "current" } }]],
};

export default config;
