// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from "@tailwindcss/vite";
// import storyblok  from '@storyblok/astro';
import { loadEnv } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl'



const env = loadEnv("", process.cwd(), 'STORYBLOK');

// https://astro.build/config
export default defineConfig({

  site: 'https://www.nxz.ai',

  vite: {
    plugins: [tailwindcss(), basicSsl()],
    resolve: {
      alias: {
        '@': '/src',
      }
    },
    server: {
      https: true,
    },
  },

  experimental: {
    svg: true,
  },

  integrations: [sitemap(), mdx()] 
  //                                   storyblok({
  //   accessToken: env.STORYBLOK_TOKEN,
  //   components: {
  //     page: 'storyblok/Page',
  //     feature: 'storyblok/Feature',
  //     grid: 'storyblok/Grid',
  //     teaser: 'storyblok/Teaser',
  //   },
  //   apiOptions: {
  //     // Choose your Storyblok space region
  //     region: 'us', // optional,  or 'eu' (default)
  //   },
  // })],
});