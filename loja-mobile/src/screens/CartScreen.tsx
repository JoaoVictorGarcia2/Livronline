import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useCart } from "../context/CartContext";

const CartScreen = () => {
  const { cart, removeFromCart } = useCart();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carrinho</Text>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.title}</Text>
            <Text>R$ {item.price.toFixed(2)}</Text>
            <TouchableOpacity style={styles.button} onPress={() => removeFromCart(item.id)}>
              <Text style={styles.buttonText}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  item: { padding: 10, backgroundColor: "#f9f9f9", marginBottom: 10, borderRadius: 5 },
  button: { backgroundColor: "red", padding: 5, borderRadius: 5, alignSelf: "center" },
  buttonText: { color: "#fff" },
});

export default CartScreen;
