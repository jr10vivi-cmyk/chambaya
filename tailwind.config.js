/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#fff7ed',
                    500: '#f97316',
                    600: '#ea580c',
                }
            }
        },
    },
    plugins: [],
    // Salvaguarda: nunca purgar estas clases base
    safelist: [
        'grid', 'flex', 'hidden', 'block',
        'lg:grid-cols-2', 'sm:grid-cols-2', 'sm:grid-cols-3',
        'lg:grid-cols-4', 'sm:grid-cols-4', 'grid-cols-2',
        'grid-cols-3', 'grid-cols-4',
        'lg:flex', 'md:flex', 'lg:hidden', 'md:hidden',
    ]
}