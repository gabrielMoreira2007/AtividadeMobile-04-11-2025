// src/screens/CadastroTurmaScreen.js
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ActivityIndicator, KeyboardAvoidingView, Platform 
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

    // O Supabase irá injetar automaticamente o professor_id graças à RLS,
    // mas por garantia, e para seguir o fluxo, buscamos o ID.
    const user = (await Supabase.auth.getUser()).data.user;
    if (!user) {
        Alert.alert("Erro de Sessão", "Usuário não autenticado.");
        setLoading(false);
        return;
    }
    
    // 1. Inserir a nova turma no Supabase (Ponto 3)
    const { error } = await Supabase
      .from('turmas')
      .insert([
        { 
          nome: nome, 
          numero: numero, 
          professor_id: user.id 
        }
      ]);

    setLoading(false);

    if (error) {
      Alert.alert("Erro ao Cadastrar", error.message);
    } else {
      Alert.alert("Sucesso", `Turma "${nome}" cadastrada com sucesso!`);
      // Volta para a Home, que irá recarregar a lista (graças ao useFocusEffect)
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={60}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Cadastrar Nova Turma</Text>
      </View>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome da Turma (Ex: 3º Ano B - Manhã)"
          placeholderTextColor="#999"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
          editable={!loading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Número/Código da Turma (Ex: T001)"
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
            <Text style={styles.buttonText}>CADASTRAR TURMA</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Cancelar e Voltar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND_LIGHT, justifyContent: 'center', paddingHorizontal: 25, },
  header: { alignItems: 'center', marginBottom: 40, },
  title: { fontSize: 28, fontWeight: 'bold', color: PRIMARY_BLUE, textAlign: 'center', marginBottom: 5, },
  form: { width: '100%', },
  input: { height: 55, backgroundColor: '#fff', borderColor: BORDER_COLOR, borderWidth: 1, borderRadius: 12, paddingHorizontal: 18, marginBottom: 18, fontSize: 16, color: '#333', elevation: 3, },
  button: { backgroundColor: PRIMARY_BLUE, paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginTop: 15, elevation: 8, },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', },
  backButton: { marginTop: 20, alignItems: 'center' },
  backButtonText: { color: PRIMARY_BLUE, fontSize: 15, textDecorationLine: 'underline' }
});

export default CadastroTurmaScreen;