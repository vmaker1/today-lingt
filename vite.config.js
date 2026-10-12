import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // 거의 안 바뀌는 라이브러리를 따로 묶어 두면
        // 앱만 고쳐 배포해도 재방문 때 라이브러리는 브라우저 캐시에서 바로 불러와요
        manualChunks: {
          react: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
});
