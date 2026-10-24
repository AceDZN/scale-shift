import { defineConfig } from 'vite';
export default defineConfig({base:'./',server:{port:5181,strictPort:true},preview:{port:4181,strictPort:true},build:{target:'es2022'}});
