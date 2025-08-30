import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CopyrightScreen() {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Word Buddy</Text>
            <View style={styles.box}>
                <Text style={styles.text}>
                    WordBuddy è un'app di Flashcard per apprendere vocaboli della lingua inglese.
                </Text>
                <Text style={styles.text}>
                    © 2025 Code4Project. Tutti i diritti riservati. Proprietà di Salvatore D'Angelo.
                </Text>
                <Text style={styles.text}>
                    Alcune immagini delle flashcards sono generate tramite AI o provengono da Freepik.com.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2c3e50',
        textAlign: 'center',
    },
    box: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        width: '100%',
    },
    text: {
        fontSize: 16,
        marginBottom: 12,
        lineHeight: 24,
        color: '#34495e',
        textAlign: 'center',
    },
});
