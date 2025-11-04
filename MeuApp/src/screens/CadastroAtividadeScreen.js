// src/screens/CadastroAtividadeScreen.js - CÓDIGO ATUALIZADO
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Supabase from '../services/supabase';

// Cores do Tema
const PRIMARY_BLUE = '#007BFF';
const BACKGROUND_LIGHT = '#F0F2F5';
const BORDER_COLOR = '#DCDCDC';

const CadastroAtividadeScreen = ({ navigation }) => {
  const route = useRoute();
  // Recebe 'turmaId' (para cadastro) ou 'atividade' e 'turmaId' (para edição)
  const { turmaId, atividade } = route.params; 

  const isEditing = !!atividade; // True se estiver editando uma atividade existente
  const [descricao, setDescricao] = useState(isEditing ? atividade.descricao : '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Define o título da tela de navegação (opcional se você não usa o header do Stack)
    navigation.setOptions({
        title: isEditing ? 'Editar Atividade' : 'Nova Atividade',
    });
  }, [isEditing, navigation]);

  const handleSave = async () => {
    if (!descricao) {
      Alert.alert("Erro", "A descrição da atividade é obrigatória.");
      return;
    }

    setLoading(true);
    let error;

    if (isEditing) {
      // 1. Lógica de Edição (Ponto 8)
      const result = await Supabase
        .from('atividades')
        .update({ descricao: descricao })
        .eq('id', atividade.id);
      error = result.error;

    } else {
      // 2. Lógica de Cadastro (Ponto 8)
      const result = await Supabase
        .from('atividades')
        .insert([
          { 
            descricao: descricao, 
            turma_id: turmaId 
          }
        ]);
      error = result.error;
    }

    setLoading(false);

    if (error) {
      Alert.alert("Erro ao Salvar", error.message);
    } else {
      Alert.alert("Sucesso", `Atividade ${isEditing ? 'atualizada' : 'cadastrada'} com sucesso!`);
      // Volta para a AtividadesTurmaScreen, que irá recarregar a lista
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={60}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{isEditing ? 'Editar Atividade' : 'Cadastrar Nova Atividade'}</Text>
        <Text style={styles.subtitle}>Para a Turma ID: {turmaId.slice(0, 8)}...</Text>
        
        <TextInput
          // AQUI ESTÁ A CORREÇÃO: Unificando o estilo em um único atributo 'style'
          style={[
            styles.input, 
            { 
                height: 100, 
                textAlignVertical: 'top', // Garante que o texto comece no topo (Android)
                paddingTop: 15 // Ajuste de padding para melhor visualização
            }
          ]}
          placeholder="Descrição da Atividade (Ex: Prova 1, Trabalho em Grupo)"
          placeholderTextColor="#999"
          value={descricao}
          onChangeText={setDescricao}
          autoCapitalize="sentences"
          multiline
          numberOfLines={4}
          editable={!loading}
        />
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isEditing ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Cancelar e Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: BACKGROUND_LIGHT, 
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 25, 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: PRIMARY_BLUE, 
    textAlign: 'center', 
    marginBottom: 5, 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 40 
  },
  input: { 
    backgroundColor: '#fff', 
    borderColor: BORDER_COLOR, 
    borderWidth: 1, 
    borderRadius: 12, 
    paddingHorizontal: 18, 
    marginBottom: 18, 
    fontSize: 16, 
    color: '#333', 
    elevation: 3, 
  },
  button: { 
    backgroundColor: PRIMARY_BLUE, 
    paddingVertical: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 15, 
    elevation: 8, 
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
  }
});

export default CadastroAtividadeScreen;