import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const { login } = useAuth();
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    const success = await login(identifier, password);
    if (success) {
      navigation.navigate("Home");
    } else {
      Alert.alert("Erro", "Usuário ou senha incorretos.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput style={styles.input} placeholder="Email ou Username" value={identifier} onChangeText={setIdentifier} />
      <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Não tem conta? Criar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 10 },
  button: { backgroundColor: "blue", padding: 15, borderRadius: 5 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
  link: { color: "blue", textAlign: "center", marginTop: 10 },
});

export default LoginScreen;
