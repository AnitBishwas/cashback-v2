import { defineConfig } from "vite";
import shopify from "vite-plugin-shopify";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [
    shopify({
      themeRoot: "extensions/cashback-v2",
    }),
    react(),
    cssInjectedByJsPlugin({
      jsAssetsFilterFunction: function customJsAssetsfilterFunction(
        outputChunk
      ) {
        return (
          outputChunk.fileName.includes("dashbaord") ||
          outputChunk.fileName.includes("widget")
        );
      },
    }),
  ],
});
