import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <TextInput style={styles.searchBar} placeholder="O que você procura?" />
      <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
        <MaterialIcons name="shopping-cart" size={24} color="black" />
      </TouchableOpacity>
      {user ? (
        <TouchableOpacity onPress={logout}>
          <MaterialIcons name="logout" size={24} color="black" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <MaterialIcons name="login" size={24} color="black" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "#fff", justifyContent: "space-between" },
  searchBar: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 5, marginRight: 10 },
});

export default Header;
