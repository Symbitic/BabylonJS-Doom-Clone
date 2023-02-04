import { defineConfig } from "vite";
import { name } from "./package.json";

export default defineConfig({
    base: `/${name}/`
});
