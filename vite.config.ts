// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import { resolve } from "path";
// import dts from "vite-plugin-dts";
// import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

// export default defineConfig({
//   plugins: [
//     react(),
//     dts({
//       insertTypesEntry: true,
//     }),
//     cssInjectedByJsPlugin(),
//   ],
//   build: {
//     lib: {
//       entry: resolve(__dirname, "src/index.tsx"),
//       name: "KYCSDK",
//       fileName: (format) => `kyc-sdk.${format}.js`,
//     },
//     rollupOptions: {
//       external: ["react", "react-dom", "react-modal"],
//       output: {
//         globals: {
//           react: "React",
//           "react-dom": "ReactDOM",
//           "react-modal": "ReactModal",
//         },
//       },
//     },
//   },
//   css: {
//     postcss: {
//       plugins: [require("tailwindcss"), require("autoprefixer")],
//     },
//   },
// });

import { defineConfig, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import path from "path";

const sharedConfig: UserConfig = {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@public": path.resolve(__dirname, "public"),
    },
  },
  plugins: [react()],
  css: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.svg"],
};

export default defineConfig(({ command }) => {
  if (command === "serve") {
    // dev specific config
    return {
      ...sharedConfig,
      define: {
        "process.env.NODE_ENV": '"development"',
      },
      server: {
        open: true,
      },
      build: {
        rollupOptions: {
          input: {
            main: resolve(__dirname, "index.html"),
          },
        },
      },
    };
  } else {
    // command === 'build'
    return {
      ...sharedConfig,
      plugins: [
        dts({
          insertTypesEntry: true,
        }),
        cssInjectedByJsPlugin(),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, "src/index.tsx"),
          name: "KYCSDK",
          fileName: (format) => `kyc-sdk.${format}.js`,
        },
        rollupOptions: {
          external: ["react", "react-dom", "react-modal"],
          output: {
            globals: {
              react: "React",
              "react-dom": "ReactDOM",
              "react-modal": "ReactModal",
            },
            assetFileNames: "assets/[name][extname]",
          },
        },
      },
    };
  }
});
