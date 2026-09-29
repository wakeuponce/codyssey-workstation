import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH: 배포 위치에 맞춘 정적 파일 기준 경로.
//   - 로컬 / Vercel(루트 배포)  → '/' (기본값)
//   - GitHub Pages 하위 폴더   → './' (HashRouter 와 함께 사용, 워크플로에서 지정)
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // 자주 바뀌지 않는 라이브러리를 앱 코드와 분리 → 앱만 수정했을 때 브라우저 캐시 재사용
        codeSplitting: {
          groups: [
            { name: 'supabase', test: /node_modules[\\/]@supabase/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
