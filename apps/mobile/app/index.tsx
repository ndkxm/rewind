import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rewind</Text>
      <Text style={styles.subtitle}>AI-powered image memory</Text>
      <View style={styles.statusContainer}>
        <Text style={styles.status}>🚧 Bootstrap scaffold</Text>
        <Text style={styles.hint}>
          This is the initial project setup. Features will be implemented
          according to the project roadmap.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#e94560",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#a0a0b0",
    marginBottom: 48,
  },
  statusContainer: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    maxWidth: 320,
  },
  status: {
    fontSize: 16,
    color: "#e94560",
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: "#a0a0b0",
    textAlign: "center",
    lineHeight: 20,
  },
});
