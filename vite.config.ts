import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  root: ".",
  // Ensure assets resolve when loaded via file:// in Electron production builds.
  base: "./",
  build: {
    outDir: "dist",
  },
});
