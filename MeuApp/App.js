// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Supabase from './src/services/supabase';

// Importe as telas
import LoginScreen from './src/screens/LoginScreen'; 
import HomeScreen from './src/screens/HomeScreen';
import CadastroProfessorScreen from './src/screens/CadastroProfessorScreen'; 
import CadastroTurmaScreen from './src/screens/CadastroTurmaScreen';
import AtividadesTurmaScreen from './src/screens/AtividadesTurmaScreen'; 
import CadastroAtividadeScreen from './src/screens/CadastroAtividadeScreen'; 

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // NOVO: Controla a tela de carregamento inicial

  useEffect(() => {
    // 1. Carregar a sessão salva no AsyncStorage ao iniciar o App
    const loadInitialSession = async () => {
        try {
            // Tenta pegar a sessão do AsyncStorage
            const { data: { session } } = await Supabase.auth.getSession();
            setSession(session);
        } catch (e) {
            console.error("Erro ao carregar sessão inicial:", e);
        } finally {
            setLoading(false); // SÓ PARAR O LOADING APÓS TENTAR CARREGAR A SESSÃO
        }
    };

    loadInitialSession();

    // 2. Listener para mudanças de autenticação (Login/Logout)
    const { data: authListener } = Supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        // Garante que o loading para, caso tenha sido um evento de login/logout rápido
        if (loading) setLoading(false); 
      }
    );

    // Limpa o listener ao desmontar o componente
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 3. Exibir tela de Loading enquanto a sessão é verificada
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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