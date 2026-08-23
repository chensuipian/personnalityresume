/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 主题三色：#162660 深藏青（主色）/ #bedaf6 浅蓝（辅助）/ #F1E4D1 米色（背景）
        primary: {
          DEFAULT: '#162660',
          light: '#bedaf6',
        },
        cream: '#F1E4D1',
      },
    },
  },
  plugins: [],
}
