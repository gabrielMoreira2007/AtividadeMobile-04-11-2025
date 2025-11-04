// src/services/supabase.js

import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
// Importação padrão: Tentativa de resolver referências do AsyncStorage no ambiente Expo/Metro
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// 🚨 Suas chaves (deixadas intactas):
const supabaseUrl = 'https://gqzbwapvquqofdaisbje.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxemJ3YXB2cXVxb2ZkYWlzYmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNDM3NTEsImV4cCI6MjA3NzgxOTc1MX0._qH_VLNZmxgo3Q2vUy0W5UGral3khslB3scz5Z_Fwg8';

const Supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 🔑 O Supabase usará o AsyncStorage para guardar e carregar a sessão.
    storage: AsyncStorage, 
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export default Supabase;