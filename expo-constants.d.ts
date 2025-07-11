declare module 'expo-constants' {
    export const expoConfig: {
        extra?: {
            APP_ENV?: string;
            MOCK_DATE?: string;
            // ...
        };
    } | undefined;
}