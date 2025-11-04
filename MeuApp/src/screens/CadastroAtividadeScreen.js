import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image 
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Supabase from '../services/supabase';

// 🎨 Cores do Tema
const PRIMARY_BLUE = '#007BFF';
const BACKGROUND_LIGHT = '#F0F2F5';
const BORDER_COLOR = '#DCDCDC';

const CadastroAtividadeScreen = ({ navigation }) => {
  const route = useRoute();
  const { turmaId, atividade } = route.params; 

  const isEditing = !!atividade;
  const [descricao, setDescricao] = useState(isEditing ? atividade.descricao : '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!descricao) {
      Alert.alert("Erro", "A descrição da atividade é obrigatória.");
      return;
    }

    setLoading(true);
    let error;

    if (isEditing) {
      const result = await Supabase
        .from('atividades')
        .update({ descricao })
        .eq('id', atividade.id);
      error = result.error;
    } else {
      const result = await Supabase
        .from('atividades')
        .insert([{ descricao, turma_id: turmaId }]);
      error = result.error;
    }

    setLoading(false);

    if (error) {
      Alert.alert("Erro ao Salvar", error.message);
    } else {
      Alert.alert("Sucesso", `Atividade ${isEditing ? 'atualizada' : 'cadastrada'} com sucesso!`);
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={60}
    >
      {/* === HEADER === */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../img/logosemfundo.png')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar Atividade' : 'Nova Atividade'}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.backButtonHeader}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonHeaderText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      {/* === CONTEÚDO PRINCIPAL === */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Image 
            source={require('../img/logosemfundo.png')}
            style={styles.formLogo}
            resizeMode="contain"
          />

          <Text style={styles.subtitle}>
            {isEditing 
              ? `Editando atividade da turma ID: ${turmaId.slice(0, 8)}...`
              : `Cadastrar para turma ID: ${turmaId.slice(0, 8)}...`
            }
          </Text>
          
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 15 }]}
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
              <Text style={styles.buttonText}>
                {isEditing ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR'}
              </Text>
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

// === ESTILOS ===
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: BACKGROUND_LIGHT, 
  },

  // HEADER PADRÃO
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

  // === CONTEÚDO ===
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 25, 
  },
  
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    alignItems: 'center',
  },

  formLogo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },

  subtitle: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 30,
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
    width: '100%',
  },

  button: { 
    backgroundColor: PRIMARY_BLUE, 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10, 
    width: '100%',
    elevation: 4,
  },

  buttonText: { 
    color: '#fff', 
    fontSize: 17, 
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

export default CadastroAtividadeScreen;
