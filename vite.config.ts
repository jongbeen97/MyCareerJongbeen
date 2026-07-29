import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 상대 경로로 빌드합니다. 루트(Vercel)든 하위 경로(GitHub Pages의 /저장소이름/)든
  // 자산이 그대로 로드되므로, 배포처를 바꿔도 설정을 다시 만질 필요가 없습니다.
  base: './',
  plugins: [react()],
})
