/** @type {import('stylelint').Config} */
const config = {
  extends: ["stylelint-config-standard", "stylelint-config-tailwindcss"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "apply",
          "config",
          "custom-variant",
          "layer",
          "plugin",
          "source",
          "tailwind",
          "theme",
          "utility",
          "variant",
        ],
      },
    ],
    "hue-degree-notation": null,
    "lightness-notation": null,
    "rule-empty-line-before": null,
  },
};

export default config;
