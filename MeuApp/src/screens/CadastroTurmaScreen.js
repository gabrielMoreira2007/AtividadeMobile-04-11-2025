import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ActivityIndicator, KeyboardAvoidingView, Platform, Image, ScrollView
} from 'react-native';
import Supabase from '../services/supabase';

// Cores do Tema
const PRIMARY_BLUE = '#007BFF';
const BACKGROUND_LIGHT = '#F0F2F5';
const BORDER_COLOR = '#DCDCDC';

const CadastroTurmaScreen = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastrar = async () => {
    if (!nome || !numero) {
      Alert.alert("Erro", "Por favor, preencha o Nome e o Número da Turma.");
      return;
    }

    setLoading(true);
    const user = (await Supabase.auth.getUser()).data.user;
    if (!user) {
      Alert.alert("Erro de Sessão", "Usuário não autenticado.");
      setLoading(false);
      return;
    }
    
    const { error } = await Supabase
      .from('turmas')
      .insert([{ nome, numero, professor_id: user.id }]);

    setLoading(false);

    if (error) {
      Alert.alert("Erro ao Cadastrar", error.message);
    } else {
      Alert.alert("Sucesso", `Turma "${nome}" cadastrada com sucesso!`);
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={60}
    >
      {/* HEADER PADRÃO */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../img/logosemfundo.png')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Cadastrar Nova Turma</Text>
        </View>

        <TouchableOpacity 
          style={styles.backButtonHeader}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonHeaderText}>{"Voltar"}</Text>
        </TouchableOpacity>
      </View>

      {/* CONTAINER CENTRAL BONITO */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContainer}>
          <Image 
            source={require('../img/logosemfundo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Cadastro de Turma</Text>
          <Text style={styles.subtitle}>Preencha os dados abaixo para registrar sua nova turma</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome da Turma"
            placeholderTextColor="#999"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
            editable={!loading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Número/Código da Turma"
            placeholderTextColor="#999"
            value={numero}
            onChangeText={setNumero}
            autoCapitalize="none"
            editable={!loading}
          />
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleCadastrar}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar Turma</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Cancelar e Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: BACKGROUND_LIGHT, 
  },

  // --- HEADER PADRÃO ---
  header: {
    width: '100%',
    backgroundColor: PRIMARY_BLUE,
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 3,
    borderBottomColor: '#0056b3',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 42,
    height: 42,
    marginRight: 10,
    tintColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButtonHeader: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backButtonHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // --- CONTAINER INTERNO ---
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },
  innerContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    alignItems: 'center',
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY_BLUE,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
  },

  // --- FORMULÁRIO ---
  input: { 
    height: 50, 
    backgroundColor: '#fff', 
    borderColor: BORDER_COLOR, 
    borderWidth: 1, 
    borderRadius: 12, 
    paddingHorizontal: 20, 
    marginBottom: 18, 
    fontSize: 16, 
    color: '#333', 
    elevation: 3, 
    width: '100%',
  },
  button: { 
    backgroundColor: PRIMARY_BLUE, 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10, 
    elevation: 8, 
    width: '100%',
  },
  buttonText: { 
    color: '#fff', 
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
    textDecorationLine: 'underline' 
  },
});

export default CadastroTurmaScreen;
