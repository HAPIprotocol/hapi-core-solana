import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";

export default [
  {
    input: ["out-tsc/src/index.js"],
    external: ["@solana/web3.js", "bn.js", "borsh", "bs58"],
    output: [
      {
        file: "lib/index.esm.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [resolve(), commonjs()],
  },
  {
    input: ["out-tsc/src/index.js"],
    external: ["@solana/web3.js", "bn.js", "borsh", "bs58"],
    output: [
      {
        file: "lib/index.cjs.js",
        format: "commonjs",
        sourcemap: true,
      },
    ],
    plugins: [resolve(), commonjs()],
  },
  {
    input: "out-tsc/src/index.d.ts",
    output: [{ file: "lib/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];
