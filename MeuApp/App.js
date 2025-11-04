// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Importe o cliente Supabase
import Supabase from './src/services/supabase';

// Importe as telas
import LoginScreen from './src/screens/LoginScreen'; 
import HomeScreen from './src/screens/HomeScreen';
import CadastroTurmaScreen from './src/screens/CadastroTurmaScreen';
import AtividadesTurmaScreen from './src/screens/AtividadesTurmaScreen';
import CadastroProfessorScreen from './src/screens/CadastroProfessorScreen'; // Nova tela de cadastro
import CadastroAtividadeScreen from './src/screens/CadastroAtividadeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null); // Armazena a sessão do Supabase
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verifica se há uma sessão ativa no Supabase
    Supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuta mudanças na autenticação (login, logout, refresh)
    const { data: { subscription } } = Supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe(); // Limpeza
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {session && session.user ? (
          // Telas Acessíveis APÓS o login
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CadastroTurma" component={CadastroTurmaScreen} />
            <Stack.Screen name="AtividadesTurma" component={AtividadesTurmaScreen} />
            <Stack.Screen name="CadastroAtividade" component={CadastroAtividadeScreen} />
          </>
        ) : (
          // Telas Acessíveis ANTES do login
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="CadastroProfessor" component={CadastroProfessorScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F2F5',
    }
});