const unwrapCascadeLayers = {
  postcssPlugin: "unwrap-cascade-layers-for-legacy-safari",
  AtRule: {
    layer: (rule) => {
      if (!rule.nodes) {
        rule.remove();
        return;
      }

      rule.replaceWith(...rule.nodes);
    },
  },
};

const config = {
  plugins: ["@tailwindcss/postcss", unwrapCascadeLayers],
};

export default config;
