import { defineConfig, envField } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), vue()],
  env: {
    schema: {
      SECRET_WBBOTID: envField.string({
        context: "server",
        access: "public"
      }),
      SECRET_WBAUTH: envField.string({
        context: "server",
        access: "public"
      }),
      PUBLIC_WBBOTID: envField.string({
        context: "client",
        access: "public"
      }),
      PUBLIC_WBAUTH: envField.string({
        context: "client",
        access: "public"
      }),
    }
  }
});