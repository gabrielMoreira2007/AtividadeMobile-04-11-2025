// src/screens/CadastroProfessorScreen.js
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView 
} from 'react-native';
import Supabase from '../services/supabase';

const PRIMARY_BLUE = '#007BFF';
const BACKGROUND_LIGHT = '#F0F2F5';

const CadastroProfessorScreen = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }
    if (!nome || !email || !password) {
        Alert.alert("Erro", "Por favor, preencha todos os campos.");
        return;
    }
    
    setLoading(true);

    // 1. Criar o usuário no Auth do Supabase
    const { data: authData, error: authError } = await Supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      setLoading(false);
      Alert.alert("Erro ao Cadastrar", authError.message);
      return;
    }

    // 2. Se o Auth for bem-sucedido, inserir o perfil na tabela 'professores'
    if (authData.user) {
        const { error: profileError } = await Supabase
          .from('professores')
          .insert([
            { id: authData.user.id, nome: nome, email: email }
          ]);

        if (profileError) {
          // 💡 TRATAMENTO DE ERRO: Se a inserção falhar, idealmente, você deveria apagar o usuário Auth também.
          Alert.alert("Erro de Perfil", "Não foi possível completar seu cadastro. Tente novamente.");
          // O usuário está criado no Auth, mas sem perfil.
          setLoading(false);
          return;
        }

        // Sucesso: O App.js detecta a sessão e navega para Home
        Alert.alert("Sucesso!", "Seu cadastro foi concluído. Você está logado e será redirecionado.");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Registro de Professor</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nome Completo"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
          editable={!loading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Senha (mín. 6 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar Senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleCadastro}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>CADASTRAR</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar para o Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BACKGROUND_LIGHT, },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 25,
    },
    title: { fontSize: 28, fontWeight: 'bold', color: PRIMARY_BLUE, textAlign: 'center', marginBottom: 40, },
    input: { height: 55, backgroundColor: '#fff', borderColor: '#DCDCDC', borderWidth: 1, borderRadius: 12, paddingHorizontal: 18, marginBottom: 18, fontSize: 16, color: '#333', elevation: 3, },
    button: { backgroundColor: PRIMARY_BLUE, paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginTop: 15, elevation: 8, },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', },
    backButton: { marginTop: 20, alignItems: 'center' },
    backButtonText: { color: PRIMARY_BLUE, fontSize: 15, textDecorationLine: 'underline' }
});

export default CadastroProfessorScreen;