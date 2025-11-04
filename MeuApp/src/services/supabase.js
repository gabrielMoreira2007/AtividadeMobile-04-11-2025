// src/services/supabase.js
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🚨 SUBSTITUA PELAS SUAS CHAVES DO SUPABASE 🚨
const supabaseUrl = 'SEU_URL_DO_SUPABASE';
const supabaseAnonKey = 'SUA_CHAVE_ANON';

// Usa AsyncStorage para persistir a sessão de usuário
const Supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export default Supabase;