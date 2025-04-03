import React from "react";
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useSearch } from "../context/SearchContext";
import { useCart } from "../context/CartContext";

const books = [
  { id: 1, title: "Café com Deus Pai", price: 74.97, image: require("../../assets/book1.jpg") },
  { id: 2, title: "Dias Quentes", price: 27.93, image: require("../../assets/book1.jpg") },
  { id: 3, title: "Nunca Minta", price: 44.92, image: require("../../assets/book1.jpg") },
  { id: 4, title: "A Cabeça do Santo", price: 52.42, image: require("../../assets/book1.jpg") },
];

const HomeScreen = () => {
  const { searchTerm, setSearchTerm } = useSearch();
  const { addToCart } = useCart();

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>A PÁGINA</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="O que você procura?"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <FlatList
        data={filteredBooks}
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
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  logo: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  searchBar: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 20 },
  bookCard: { padding: 10, backgroundColor: "#f9f9f9", marginBottom: 10, borderRadius: 5 },
  image: { width: 100, height: 150, resizeMode: "cover", alignSelf: "center" },
  title: { fontSize: 16, fontWeight: "bold", textAlign: "center", marginVertical: 5 },
  price: { fontSize: 14, textAlign: "center", color: "green", marginBottom: 5 },
  button: { backgroundColor: "blue", padding: 10, borderRadius: 5, alignSelf: "center" },
  buttonText: { color: "#fff", textAlign: "center" },
});

export default HomeScreen;
