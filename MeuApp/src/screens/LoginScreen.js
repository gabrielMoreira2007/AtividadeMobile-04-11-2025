// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  Image, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView 
} from 'react-native';
import Supabase from '../services/supabase';

const PRIMARY_BLUE = '#007BFF';
const BACKGROUND_LIGHT = '#F0F2F5';
const BORDER_COLOR = '#DCDCDC';
const TEXT_WHITE = '#FFFFFF';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha E-mail e Senha.");
      return;
    }

    setLoading(true);
    const { error } = await Supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      let msg = error.message;
      if (error.status === 400 && error.message.includes('Invalid login credentials')) {
        msg = "E-mail ou senha inválidos. Verifique suas credenciais.";
      } else if (error.status === 400 && error.message.includes('Email not confirmed')) {
        msg = "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
      }
      Alert.alert("Erro ao Entrar", msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContainer}>
            <View style={styles.header}>
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
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // ✅ ocupa a tela inteira
    backgroundColor: PRIMARY_BLUE,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  innerContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: PRIMARY_BLUE,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  form: {
    width: '100%',
    marginTop: 10,
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderColor: BORDER_COLOR,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    elevation: 3,
  },
  button: {
    backgroundColor: PRIMARY_BLUE,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
  },
  buttonText: {
    color: TEXT_WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    color: PRIMARY_BLUE,
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
