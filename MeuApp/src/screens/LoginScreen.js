// src/screens/LoginScreen.js - CÓDIGO ATUALIZADO
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  Image, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import Supabase from '../services/supabase';

const PRIMARY_BLUE = '#007BFF';
const BACKGROUND_LIGHT = '#F0F2F5';
const BORDER_COLOR = '#DCDCDC';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validação básica para evitar requisições vazias
    if (!email || !password) {
        Alert.alert("Erro", "Por favor, preencha E-mail e Senha.");
        return;
    }

    setLoading(true);
    
    // 1. Tenta fazer o login com a função do Supabase
    const { error } = await Supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    
    setLoading(false);

    if (error) {
      // 2. Exibe o erro DETALHADO em caso de falha (Erro 400 ou Credenciais Inválidas)
      
      let errorMessage = error.message;

      if (error.status === 400 && error.message.includes('Invalid login credentials')) {
          errorMessage = "E-mail ou senha inválidos. Verifique suas credenciais.";
      } else if (error.status === 400 && error.message.includes('Email not confirmed')) {
          errorMessage = "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
      }
      
      Alert.alert("Erro ao Entrar", errorMessage);
      
    } 
    // Se não houver erro, o App.js detecta a nova sessão e navega automaticamente
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        {/* Caminho da Imagem corrigido */}
        <Image 
          source={require('../img/logosemfundo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.title}>Sistema de Turmas</Text>
        <Text style={styles.subtitle}>Acesse sua conta de professor</Text>
      </View>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>ENTRAR</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => navigation.navigate('CadastroProfessor')}
        >
          <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BACKGROUND_LIGHT, justifyContent: 'center', paddingHorizontal: 25, },
    header: { alignItems: 'center', marginBottom: 40, },
    logo: { width: 150, height: 150, marginBottom: 20, },
    title: { fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 5, },
    subtitle: { fontSize: 16, color: '#666', },
    form: { width: '100%', },
    input: { height: 55, backgroundColor: '#fff', borderColor: BORDER_COLOR, borderWidth: 1, borderRadius: 12, paddingHorizontal: 18, marginBottom: 18, fontSize: 16, color: '#333', elevation: 3, },
    button: { backgroundColor: PRIMARY_BLUE, paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginTop: 15, elevation: 8, },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', },
    linkButton: { marginTop: 20, alignItems: 'center' },
    linkText: { color: PRIMARY_BLUE, fontSize: 15, fontWeight: 'bold', textDecorationLine: 'underline' }
});

export default LoginScreen;