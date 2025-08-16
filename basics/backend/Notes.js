/*
This is a Module-JS Syntax. (Asynchronous-code)
import express from 'express';
only you update in the package.json file 
 "type": "module",


if you want to use Common-JS Syntax (Synchronous-code)
then you use -
const app = require('express');

// json formatter website for how to read professionally API

//axios npm => Axios (npm i axios)

// cors => cross orign request 
 if  url  or  port no. is different then it will considered as a cross orign 
// npm i cors 
// refer cors npm  
// ip white list || domain white list

// in Appwrite their are different way to handel cors 
basically appwrite package install  their are not any request for public api so we go inside cloud add localhost 
for while-listing for our application.
Vercel white-listing.


What is the same origin ? 
basically same origin means url as well as port both are the same.

*/


/*

// proxy create react app ? refer
// proxy vite 
vite.config.js 
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  plugins: [react()],
})

*/

// npm run build  => it create a new dist folder 
// dist folder put in the backend from the frontend 
// when you use  app.use(express.static('dist'));
// if changes are avilable in the frontend then it will not propagate (so it is bad practice). frontend and backend ko segregate 