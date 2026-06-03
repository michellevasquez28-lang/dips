/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    {
      raw: `flex flex-col flex-row flex-1 flex-wrap shrink-0 inline-block
            items-center items-start items-end justify-center justify-between justify-end
            fixed absolute relative sticky static inset-0 z-10 z-20 z-50
            top-0 right-0 bottom-0 left-0 bottom-full -translate-x-1 -translate-y-1
            w-full w-7 w-8 w-9 w-10 w-14 max-w-sm max-w-lg max-w-2xl
            h-full h-screen h-7 h-8 h-9 h-10 h-14 h-28 h-32 h-40 max-h-[90vh]
            p-3 p-4 p-5 p-6 p-8 p-10 px-2.5 px-3 px-4 px-5 px-6 px-8 px-9
            py-1 py-1.5 py-2 py-2.5 py-3 py-4 pb-3 pb-5 pb-6 pt-4
            mb-1 mb-1.5 mb-2 mb-3 mb-4 mb-5 mb-6 mt-1 mt-2 mt-3 mt-4
            ml-1 ml-2 mr-1 mr-2 gap-1 gap-1.5 gap-2 gap-3 gap-4
            text-xs text-sm text-base text-lg text-xl text-2xl text-3xl
            font-bold font-semibold font-medium leading-none leading-tight leading-relaxed
            tracking-wide tracking-widest italic uppercase
            text-white text-gray-300 text-gray-400 text-gray-500 text-gray-600 text-gray-700 text-gray-800
            text-center text-left whitespace-nowrap resize-none
            bg-white bg-gray-50 bg-gray-100 bg-transparent bg-green-50
            border border-2 border-dashed border-transparent
            border-gray-100 border-gray-200 border-gray-300 border-e-5
            rounded rounded-full rounded-lg rounded-xl rounded-2xl
            shadow shadow-lg shadow-2xl
            overflow-hidden overflow-y-auto
            pointer-events-none cursor-pointer cursor-not-allowed cursor-grab cursor-grabbing
            select-none opacity-0 opacity-100
            transition-all transition-colors transition-opacity transition-shadow
            duration-200 ease-in-out
            -translate-x-1/2 -translate-y-1/2 translate-y-0
            hover:bg-gray-50 hover:bg-gray-100 hover:opacity-90 hover:scale-105 hover:scale-110
            active:scale-95 active:scale-\[0\.98\] focus:outline-none
            disabled:opacity-40 disabled:cursor-not-allowed
            group group-hover:opacity-100
            sticky top-0 z-10
            `,
    },
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1a6b3a',
          dark: '#145530',
          light: '#1e7d44',
        },
        gold: {
          DEFAULT: '#c8a000',
          light: '#ffd700',
          dark: '#8b6914',
          deep: '#5a3d0a',
        },
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'serif'],
      },
    },
  },
  plugins: [],
}
