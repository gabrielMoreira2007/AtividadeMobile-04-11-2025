// src/screens/CadastroProfessorScreen.js
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Image
} from 'react-native';
import Supabase from '../services/supabase';

const PRIMARY_BLUE = '#007BFF';
const BACKGROUND_LIGHT = '#F0F2F5';
const TEXT_WHITE = '#FFFFFF';

const CadastroProfessorScreen = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !password || !confirmPassword) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await Supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      Alert.alert("Erro ao Cadastrar", authError.message);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await Supabase
        .from('professores')
        .insert([{ id: authData.user.id, nome, email }]);

      if (profileError) {
        Alert.alert("Erro", "Não foi possível completar o cadastro. Tente novamente.");
        setLoading(false);
        return;
      }

      Alert.alert("Sucesso!", "Cadastro concluído. Verifique seu e-mail para confirmar sua conta.");
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.header}>
                    <Image 
                      source={require('../img/logosemfundo.png')} 
                      style={styles.logo} 
                      resizeMode="contain"
                    />
                  </View>
          <Text style={styles.title}>Criar Conta de Professor</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome Completo"
            placeholderTextColor="#999"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
            editable={!loading}
          />
          
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
            placeholder="Senha (mín. 6 caracteres)"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmar Senha"
            placeholderTextColor="#999"
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: PRIMARY_BLUE, 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 120,
    height: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    elevation: 10,
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: PRIMARY_BLUE, 
    textAlign: 'center', 
    marginBottom: 30, 
  },
  input: { 
    height: 50, 
    backgroundColor: '#fff', 
    borderColor: '#DCDCDC', 
    borderWidth: 1, 
    borderRadius: 12, 
    paddingHorizontal: 18, 
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
  backButton: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  backButtonText: { 
    color: PRIMARY_BLUE, 
    fontSize: 15, 
    fontWeight: 'bold', 
  },
});

export default CadastroProfessorScreen;
