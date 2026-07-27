import base from "./base.mjs";

export default [
  ...base,

  {
    languageOptions: {
      globals: globals.node,
    },
  },
];
