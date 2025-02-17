import { defineConfig, envField } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import vue from '@astrojs/vue';
import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [tailwind(), vue()],
  env: {
    schema: {
      // SECRET_WBBOTID: envField.string({
      //   context: "server",
      //   access: "public"
      // }),
      // SECRET_WBAUTH: envField.string({
      //   context: "server",
      //   access: "public"
      // }),
      PUBLIC_WBBOTID: envField.string({
        context: "client",
        access: "public"
      }),
      PUBLIC_WBAUTH: envField.string({
        context: "client",
        access: "public"
      }),
      PUBLIC_ROOT: envField.string({
        context: "client",
        access: "public"
      }),
      PUBLIC_FTP_HOST: envField.string({
        context: "client",
        access: "public"
      }),
      PUBLIC_FTP_USER: envField.string({
        context: "client",
        access: "public"
      }),
      PUBLIC_FTP_PASS: envField.string({
        context: "client",
        access: "public"
      }),
    }
  },

  adapter: netlify({
    edgeMiddleware: true
  }),
});