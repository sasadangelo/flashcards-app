import 'dotenv/config';

export default {
    expo: {
        name: "WordBuddy",       // cambia con il nome della tua app
        slug: "word-buddy",    // cambia con lo slug
        version: "0.0.3",
        android: {
            package: "org.code4projects.wordbuddy"
        },

        extra: {
            APP_ENV: process.env.APP_ENV || 'production',
            MOCK_DATE: process.env.MOCK_DATE || '',
            eas: {
                projectId: "774f60d4-74ad-4d87-a577-5ba7a565d477"
            }
        },
    },
};