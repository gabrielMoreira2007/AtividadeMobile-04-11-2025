// src/screens/AtividadesTurmaScreen.js
import React, { useState, useCallback } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, FlatList, 
    ActivityIndicator, Alert, Image
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import Supabase from '../services/supabase';

// Cores do Tema
const PRIMARY_BLUE = '#007BFF';
const PRIMARY_RED = '#DC3545';
const TEXT_DARK = '#333';
const TEXT_MEDIUM = '#666';
const BACKGROUND_LIGHT = '#F0F2F5';
const EDIT_YELLOW = '#ffc107';

// --- Componente Card de Atividade (Ponto 6 e 7) ---
const AtividadeCard = React.memo(({ atividade, index, onEditar, onExcluir }) => (
  <View style={cardStyles.card}>
    <View style={cardStyles.infoContainer}>
      <Text style={cardStyles.numero}>Atividade N° {index + 1}</Text>
      <Text style={cardStyles.descricao}>{atividade.descricao}</Text>
    </View>
    
    <View style={cardStyles.actions}>
      {/* Botão para Edição - Ponto 8 */}
      <TouchableOpacity 
        style={[cardStyles.button, cardStyles.editButton]} 
        onPress={() => onEditar(atividade)}
        activeOpacity={0.7}
      >
        <Text style={cardStyles.buttonText}>Editar</Text>
      </TouchableOpacity>
      
      {/* Botão para Exclusão - Ponto 8 */}
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
  excluirButton: { backgroundColor: PRIMARY_RED, },
  buttonText: { color: TEXT_DARK, fontSize: 12, fontWeight: 'bold', },
});

// --- TELA DE ATIVIDADES DA TURMA ---
const AtividadesTurmaScreen = ({ navigation }) => {
    const route = useRoute();
    // Recebe o objeto 'turma' completo da HomeScreen
    const { turma } = route.params; 
    
    const [atividades, setAtividades] = useState([]);
    const [professorNome, setProfessorNome] = useState('Professor');
    const [loading, setLoading] = useState(true);

    const turmaId = turma.id;
    const turmaNome = turma.nome;

    // 1. Busca o nome do professor e as atividades
    const fetchAtividades = useCallback(async () => {
        setLoading(true);
        const user = Supabase.auth.getUser() ? (await Supabase.auth.getUser()).data.user : null;
        if (!user) return;

        // A) Buscar Nome do Professor (Ponto 6)
        const { data: profData } = await Supabase.from('professores').select('nome').eq('id', user.id).single();
        if (profData) setProfessorNome(profData.nome);

        // B) Buscar Atividades da Turma (Ponto 7)
        const { data: atividadesData, error: atividadesError } = await Supabase
            .from('atividades')
            .select('*')
            .eq('turma_id', turmaId)
            .order('created_at', { ascending: true }); 

        if (atividadesError) {
            console.error('Erro ao buscar atividades:', atividadesError);
            Alert.alert("Erro", "Não foi possível carregar as atividades.");
            setAtividades([]);
        } else {
            setAtividades(atividadesData);
        }

        setLoading(false);
    }, [turmaId]);

    useFocusEffect(
        useCallback(() => {
            fetchAtividades();
        }, [fetchAtividades])
    );

    // 2. Sair do sistema (Logout) - Ponto 'Sair do Sistema'
    const handleLogout = async () => {
        Alert.alert("Sair", "Deseja sair?", [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Sair", 
                onPress: async () => { await Supabase.auth.signOut(); }, // O App.js faz a navegação
                style: 'destructive'
            }
        ]);
    };

    // 3. Exclusão de Atividade - Ponto 8
    const handleExcluirAtividade = (atividade) => {
        Alert.alert(
            "Confirmar Exclusão",
            `Deseja realmente excluir a atividade: "${atividade.descricao}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Excluir", 
                    onPress: async () => {
                        const { error } = await Supabase
                            .from('atividades')
                            .delete()
                            .eq('id', atividade.id); 

                        if (error) {
                            Alert.alert("Erro", `Não foi possível excluir a atividade: ${error.message}`);
                        } else {
                            Alert.alert("Sucesso", "Atividade excluída.");
                            fetchAtividades(); // Recarrega a lista
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
            {/* Cabeçalho */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>{'< Voltar'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Sair</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.turmaNome}>Turma: {turmaNome}</Text>
            <Text style={styles.professorName}>Professor(a): {professorNome.split(' ')[0]}</Text>
            
            {/* Botão de Cadastro de Atividade (Ponto 6 e 8) */}
            <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => navigation.navigate('CadastroAtividade', { turmaId: turmaId })}
                activeOpacity={0.8}
            >
                <Text style={styles.addButtonText}>➕ Cadastrar Atividade</Text>
            </TouchableOpacity>

            <Text style={styles.listTitle}>Atividades Registradas ({atividades.length})</Text>

            {/* Listagem de Atividades (Ponto 7) */}
            <FlatList
                data={atividades}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <AtividadeCard 
                        atividade={item} 
                        index={index}
                        onExcluir={handleExcluirAtividade} 
                        onEditar={(a) => navigation.navigate('CadastroAtividade', { atividade: a, turmaId: turmaId })}
                    />
                )}
                ListEmptyComponent={() => (
                    <Text style={styles.emptyListText}>Nenhuma atividade cadastrada para esta turma.</Text>
                )}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 50, backgroundColor: BACKGROUND_LIGHT, },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BACKGROUND_LIGHT, },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, backgroundColor: PRIMARY_BLUE, paddingVertical: 15, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, },
    backButton: { padding: 5 },
    backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    logoutButton: { paddingVertical: 5, paddingHorizontal: 10, backgroundColor: PRIMARY_RED, borderRadius: 5, },
    logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 14, },
    turmaNome: { fontSize: 24, fontWeight: 'bold', color: TEXT_DARK, marginHorizontal: 20, marginTop: 15, },
    professorName: { fontSize: 16, color: TEXT_MEDIUM, marginHorizontal: 20, marginBottom: 20, },
    addButton: { backgroundColor: PRIMARY_BLUE, padding: 15, marginHorizontal: 20, borderRadius: 10, alignItems: 'center', marginBottom: 20, elevation: 5, },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', },
    listTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK, marginHorizontal: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: PRIMARY_BLUE, alignSelf: 'flex-start', paddingBottom: 5, },
    listContent: { paddingHorizontal: 20, paddingBottom: 20, },
    emptyListText: { textAlign: 'center', color: TEXT_MEDIUM, marginTop: 20, fontSize: 16 }
});

export default AtividadesTurmaScreen;