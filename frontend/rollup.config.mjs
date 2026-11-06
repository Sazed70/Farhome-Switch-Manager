import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/switch-manager-panel.ts",
  output: {
    banner: '/*! Farhome modifications 2026-11-06; based on Home Assistant Switch Manager. GPLv3; third-party terms: assets/THIRD_PARTY_NOTICES.txt. */',
    file: "../custom_components/switch_manager/assets/switch_manager_panel.js",
    format: "es",
    inlineDynamicImports: true,
    sourcemap: !production,
  },
  plugins: [
    typescript({ noEmit: false, outDir: "../custom_components/switch_manager/assets" }),
    resolve(),
    production && terser({ format: { comments: /@license|@preserve|^!/ } }),
  ],
};
