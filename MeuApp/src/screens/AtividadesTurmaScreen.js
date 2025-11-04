import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, 
  ActivityIndicator, Alert, Image
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import Supabase from '../services/supabase';

// 🎨 Cores do Tema
const PRIMARY_BLUE = '#007BFF';
const PRIMARY_RED = '#DC3545';
const TEXT_DARK = '#333';
const TEXT_MEDIUM = '#666';
const BACKGROUND_LIGHT = '#F0F2F5';
const EDIT_YELLOW = '#ffc107';

// --- Card de Atividade ---
const AtividadeCard = React.memo(({ atividade, index, onEditar, onExcluir }) => (
  <View style={cardStyles.card}>
    <View style={cardStyles.infoContainer}>
      <Text style={cardStyles.numero}>Atividade N° {index + 1}</Text>
      <Text style={cardStyles.descricao}>{atividade.descricao}</Text>
    </View>
    
    <View style={cardStyles.actions}>
      <TouchableOpacity 
        style={[cardStyles.button, cardStyles.editButton]} 
        onPress={() => onEditar(atividade)}
        activeOpacity={0.7}
      >
        <Text style={cardStyles.buttonText}>Editar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[cardStyles.button, cardStyles.excluirButton]}
        onPress={() => onExcluir(atividade)}
        activeOpacity={0.7}
      >
        <Text style={cardStyles.buttonText}>Excluir</Text>
      </TouchableOpacity>
    </View>
  </View>
));

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    borderLeftWidth: 5,
    borderLeftColor: PRIMARY_BLUE,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: { flex: 1, marginRight: 10, },
  numero: { fontSize: 13, color: TEXT_MEDIUM, },
  descricao: { fontSize: 16, fontWeight: 'bold', color: TEXT_DARK, marginTop: 3, },
  actions: { flexDirection: 'row', gap: 8, },
  button: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5, alignItems: 'center', },
  editButton: { backgroundColor: EDIT_YELLOW, },
  excluirButton: { backgroundColor: PRIMARY_RED, color: '#fff', },
  buttonText: { color:  BACKGROUND_LIGHT, fontSize: 12, fontWeight: 'bold',  },
});

// --- Tela de Atividades da Turma ---
const AtividadesTurmaScreen = ({ navigation }) => {
  const route = useRoute();
  const { turma } = route.params;
  const [atividades, setAtividades] = useState([]);
  const [professorNome, setProfessorNome] = useState('Professor');
  const [loading, setLoading] = useState(true);

  const turmaId = turma.id;
  const turmaNome = turma.nome;

  const fetchAtividades = useCallback(async () => {
    setLoading(true);
    const user = Supabase.auth.getUser() ? (await Supabase.auth.getUser()).data.user : null;
    if (!user) return;

    const { data: profData } = await Supabase
      .from('professores')
      .select('nome')
      .eq('id', user.id)
      .single();

    if (profData) setProfessorNome(profData.nome);

    const { data: atividadesData, error } = await Supabase
      .from('atividades')
      .select('*')
      .eq('turma_id', turmaId)
      .order('created_at', { ascending: true }); 

    if (error) {
      Alert.alert("Erro", "Não foi possível carregar as atividades.");
      setAtividades([]);
    } else {
      setAtividades(atividadesData);
    }

    setLoading(false);
  }, [turmaId]);

  useFocusEffect(useCallback(() => { fetchAtividades(); }, [fetchAtividades]));

  const handleLogout = async () => {
    Alert.alert("Sair", "Deseja realmente sair do sistema?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: async () => await Supabase.auth.signOut(), style: 'destructive' }
    ]);
  };

  const handleExcluirAtividade = (atividade) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Deseja realmente excluir "${atividade.descricao}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          onPress: async () => {
            const { error } = await Supabase
              .from('atividades')
              .delete()
              .eq('id', atividade.id); 

            if (error) Alert.alert("Erro", error.message);
            else {
              Alert.alert("Sucesso", "Atividade excluída.");
              fetchAtividades();
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_BLUE} />
        <Text style={{ marginTop: 10, color: TEXT_MEDIUM }}>Carregando atividades...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER PADRÃO BONITO */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../img/logosemfundo.png')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Atividades da Turma</Text>
        </View>

        {/* Botão de voltar elegante */}
        <TouchableOpacity 
          style={styles.backButtonHeader}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonHeaderText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.turmaNome}>Turma: {turmaNome}</Text>
      <Text style={styles.professorName}>Professor(a): {professorNome.split(' ')[0]}</Text>
      
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('CadastroAtividade', { turmaId })}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>Cadastrar Atividade</Text>
      </TouchableOpacity>

      <Text style={styles.listTitle}>Atividades ({atividades.length})</Text>

      <FlatList
        data={atividades}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AtividadeCard 
            atividade={item} 
            index={index}
            onExcluir={handleExcluirAtividade} 
            onEditar={(a) => navigation.navigate('CadastroAtividade', { atividade: a, turmaId })}
          />
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyListText}>Nenhuma atividade cadastrada.</Text>
        )}
        contentContainerStyle={styles.listContent}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND_LIGHT },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BACKGROUND_LIGHT },

  // HEADER bonito e padrão
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
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerLogo: { width: 42, height: 42, marginRight: 10, tintColor: '#fff' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },

  backButtonHeader: { paddingVertical: 6, paddingHorizontal: 10 },
  backButtonHeaderText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  turmaNome: { fontSize: 24, fontWeight: 'bold', color: TEXT_DARK, marginHorizontal: 20, marginTop: 45 },
  professorName: { fontSize: 16, color: TEXT_MEDIUM, marginHorizontal: 20, marginBottom: 20 },

  addButton: { backgroundColor: PRIMARY_BLUE, padding: 15, marginHorizontal: 20, borderRadius: 10, alignItems: 'center', marginBottom: 20, elevation: 5 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  listTitle: { fontSize: 18, fontWeight: 'bold', color: PRIMARY_BLUE, marginHorizontal: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: PRIMARY_BLUE, alignSelf: 'flex-start', paddingBottom: 5 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyListText: { textAlign: 'center', color: TEXT_MEDIUM, marginTop: 20, fontSize: 16 },

  logoutButton: { alignSelf: 'center', marginVertical: 20 },
  logoutText: { color: PRIMARY_RED, fontSize: 15, fontWeight: 'bold', textDecorationLine: 'underline' },
});

export default AtividadesTurmaScreen;

