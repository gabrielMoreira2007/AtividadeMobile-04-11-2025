// src/screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Image, ActivityIndicator 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Supabase from '../services/supabase';

// Cores do Tema
const PRIMARY_BLUE = '#007BFF';
const PRIMARY_RED = '#DC3545';
const TEXT_DARK = '#333';
const TEXT_MEDIUM = '#666';
const BACKGROUND_LIGHT = '#F0F2F5';
const SUCCESS_GREEN = '#28a745';

// --- Componente Card de Turma (Estilizado) ---
const TurmaCard = React.memo(({ turma, onExcluir, onVisualizar }) => (
  <View style={cardStyles.card}>
    <View style={cardStyles.infoContainer}>
      <Text style={cardStyles.nome}>{turma.nome}</Text>
      <Text style={cardStyles.numero}>Código: {turma.numero || 'N/A'}</Text>
    </View>
    
    <View style={cardStyles.actions}>
      <TouchableOpacity 
        style={[cardStyles.button, cardStyles.visualizarButton]} 
        onPress={() => onVisualizar(turma)}
        activeOpacity={0.7}
      >
        <Text style={cardStyles.buttonText}>Ver Atividades</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[cardStyles.button, cardStyles.excluirButton]}
        onPress={() => onExcluir(turma)}
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
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
    borderLeftWidth: 8,
    borderLeftColor: PRIMARY_BLUE,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: { flex: 1, marginRight: 10, },
  nome: { fontSize: 19, fontWeight: 'bold', color: TEXT_DARK, marginBottom: 5, },
  numero: { fontSize: 14, color: TEXT_MEDIUM, },
  actions: { flexDirection: 'column', gap: 8, },
  button: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, alignItems: 'center', },
  visualizarButton: { backgroundColor: SUCCESS_GREEN, },
  excluirButton: { backgroundColor: PRIMARY_RED, },
  buttonText: { color: '#fff', fontSize: 12, fontWeight: 'bold', },
});

// --- TELA PRINCIPAL DO PROFESSOR ---
const HomeScreen = ({ navigation }) => {
  const [professorNome, setProfessorNome] = useState('...');
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Buscando o nome do professor e as turmas
  const fetchUserData = useCallback(async () => {
    setLoading(true);
    const user = Supabase.auth.getUser() ? (await Supabase.auth.getUser()).data.user : null;
    if (!user) {
      setLoading(false);
      return;
    }

    // A) Buscar Nome do Professor (Ponto 2)
    const { data: profData, error: profError } = await Supabase
      .from('professores')
      .select('nome')
      .eq('id', user.id)
      .single();

    if (profError) {
      console.error('Erro ao buscar professor:', profError);
      setProfessorNome('Professor');
    } else if (profData) {
      setProfessorNome(profData.nome);
    }

    // B) Buscar Turmas do Professor (Ponto 4)
    const { data: turmasData, error: turmasError } = await Supabase
      .from('turmas')
      .select('*')
      .order('created_at', { ascending: false }); // A política RLS garante que só vemos nossas turmas

    if (turmasError) {
      console.error('Erro ao buscar turmas:', turmasError);
      Alert.alert("Erro", "Não foi possível carregar as turmas.");
      setTurmas([]);
    } else if (turmasData) {
      setTurmas(turmasData);
    }

    setLoading(false);
  }, []);

  // Usa useFocusEffect para recarregar os dados sempre que a tela for focada
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      return () => { /* Cleanup se necessário */ };
    }, [fetchUserData])
  );

  // 2. Sair do sistema (Logout) - Ponto 'Sair do Sistema'
  const handleLogout = async () => {
    Alert.alert(
      "Sair do Sistema",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          onPress: async () => {
            const { error } = await Supabase.auth.signOut();
            if (error) {
              Alert.alert("Erro ao Sair", error.message);
            }
            // O App.js detecta a mudança de estado e navega para Login
          },
          style: 'destructive'
        }
      ]
    );
  };

  // 3. Excluir Turma - Ponto 5
  const handleExcluirTurma = (turma) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Deseja realmente excluir a turma: "${turma.nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          onPress: async () => {
            // A) Verificar se a turma tem atividades (Ponto 5)
            const { count: atividadesCount, error: countError } = await Supabase
              .from('atividades')
              .select('id', { count: 'exact', head: true }) // Rápido: apenas conta
              .eq('turma_id', turma.id);

            if (countError) {
                Alert.alert("Erro de Validação", "Não foi possível verificar as atividades.");
                return;
            }

            if (atividadesCount > 0) {
              Alert.alert("Erro", "Você não pode excluir uma turma com atividades cadastradas.");
              return;
            }
            
            // B) Excluir se não tiver atividades
            const { error: deleteError } = await Supabase
              .from('turmas')
              .delete()
              .eq('id', turma.id); // A política RLS garante que só podemos excluir a nossa

            if (deleteError) {
              Alert.alert("Erro", `Não foi possível excluir a turma: ${deleteError.message}`);
            } else {
              Alert.alert("Sucesso", `Turma "${turma.nome}" excluída.`);
              fetchUserData(); // Recarrega a lista
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
        <Text style={{ marginTop: 10, color: TEXT_MEDIUM }}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho Customizado */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../../assets/logosemfundo.png')} 
            style={styles.headerLogo} 
            resizeMode="contain"
          />
          <Text style={styles.professorName}>Olá, {professorNome.split(' ')[0]}!</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
      
      {/* Botão de Ação (Ponto 2) */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('CadastroTurma')}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>➕ Cadastrar Nova Turma</Text>
      </TouchableOpacity>

      <Text style={styles.listTitle}>Minhas Turmas ({turmas.length})</Text>

      {/* Listagem de Turmas (Ponto 4) */}
      <FlatList
        data={turmas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TurmaCard 
            turma={item} 
            onExcluir={handleExcluirTurma} 
            onVisualizar={(t) => navigation.navigate('AtividadesTurma', { turma: t })}
          />
        )}
        ListEmptyComponent={() => (
            <Text style={styles.emptyListText}>Você não tem turmas cadastradas.</Text>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, backgroundColor: BACKGROUND_LIGHT, },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BACKGROUND_LIGHT, },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 25, backgroundColor: PRIMARY_BLUE, paddingBottom: 15, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 8, },
  headerLeft: { flexDirection: 'row', alignItems: 'center', },
  headerLogo: { width: 40, height: 40, marginRight: 10, tintColor: '#fff' }, // tintColor para deixar o logo branco
  professorName: { fontSize: 22, fontWeight: 'bold', color: '#fff', },
  logoutButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: PRIMARY_RED, borderRadius: 8, },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 14, },
  addButton: { backgroundColor: PRIMARY_BLUE, padding: 18, marginHorizontal: 20, borderRadius: 12, alignItems: 'center', marginBottom: 30, elevation: 8, },
  addButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold', },
  listTitle: { fontSize: 20, fontWeight: 'bold', color: TEXT_DARK, marginHorizontal: 20, marginBottom: 15, borderBottomWidth: 2, borderBottomColor: PRIMARY_BLUE, alignSelf: 'flex-start', paddingBottom: 5, },
  listContent: { paddingHorizontal: 20, paddingBottom: 20, },
  emptyListText: { textAlign: 'center', color: TEXT_MEDIUM, marginTop: 20, fontSize: 16 }
});

export default HomeScreen;