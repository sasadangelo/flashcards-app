import 'dotenv/config';

export default {
    expo: {
        name: "WordBuddy",       // cambia con il nome della tua app
        slug: "word-buddy",    // cambia con lo slug
        version: "1.0.0",
        // altre configurazioni Expo che già hai...

        extra: {
            APP_ENV: process.env.APP_ENV || 'production',
            MOCK_DATE: process.env.MOCK_DATE || '',
        },
    },
};