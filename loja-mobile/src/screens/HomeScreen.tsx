import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import Header from "../components/Header";
import { useCart } from "../context/CartContext";

const books = [
  { id: 1, title: "Café com Deus Pai", price: 74.97, image: require("../../assets/book1.jpg") },
  { id: 2, title: "Dias Quentes", price: 27.93, image: require("../../assets/book2.jpg") },
  { id: 3, title: "Nunca Minta", price: 44.92, image: require("../../assets/book2.jpg") },
  { id: 4, title: "A Cabeça do Santo", price: 52.42, image: require("../../assets/book1.jpg") },
];

const HomeScreen = () => {
  const { addToCart } = useCart();

  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.logo}>A PÁGINA</Text>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.bookCard}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>R$ {item.price.toFixed(2)}</Text>
            <TouchableOpacity style={styles.button} onPress={() => addToCart(item)}>
              <Text style={styles.buttonText}>Adicionar ao Carrinho</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  logo: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginVertical: 10 },
  bookCard: { padding: 15, backgroundColor: "#f9f9f9", marginBottom: 10, borderRadius: 10, alignItems: "center" },
  image: { width: 120, height: 180, resizeMode: "cover" },
  title: { fontSize: 18, fontWeight: "bold", marginVertical: 5 },
  price: { fontSize: 16, color: "green", marginBottom: 10 },
  button: { backgroundColor: "blue", padding: 10, borderRadius: 5 },
  buttonText: { color: "#fff" },
});

export default HomeScreen;
