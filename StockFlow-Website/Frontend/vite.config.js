import { defineConfig, transformWithOxc } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function jsxInJs() {
  return {
    name: "jsx-in-js",
    enforce: "pre",
    async transform(code, id) {
      if (id.endsWith(".js") && id.includes("/src/")) {
        return await transformWithOxc(code, id, { lang: "jsx" });
      }
    },
  };
}

export default defineConfig({
  plugins: [jsxInJs(), react(), tailwindcss()],
});
