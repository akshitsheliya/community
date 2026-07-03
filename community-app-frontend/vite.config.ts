// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'

// // https://vite.dev/config/
// export default defineConfig({
//   server:{proxy:{
//     "/api":" http://127.0.0.1:3000/api/send-otp"
//     }
//   },
//   plugins: [react()],
// })

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 2000, // Adjust as needed
  },
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: [".weenggs.in"],
    // proxy: {
    //   "/api": {
    //     target: "https://192.168.200.194:4002",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },

    // proxy: {
    //   // Map "/api" to the backend server
    //   "/api": {
    //     target: "http://127.0.0.1:3001", // Your backend server
    //     changeOrigin: true, // Ensures the origin of the request matches the target
    //     rewrite: (path) => path.replace(/^\/api/, ""), // Removes "/api" prefix when forwarding to backend
    //   },
    // },
  },
});
