import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const ReferencePageHeader = ({
  title,
  subtitle,
  gradientColors,
}: {
  title: string | null;
  subtitle: string | null;
  gradientColors: readonly string[];
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View style={styles.title}>
          <Text style={styles.titleText}>{title ?? "⁉️"}</Text>
        </View>
      </LinearGradient>

      <View style={styles.subtitle}>
        <Text style={styles.subtitleText}>{subtitle ?? ""}</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    backgroundColor: "#20293A",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
  },

  subtitleText: {
    color: "white",
    fontSize: 23,
    fontFamily: "Roboto",
  },

  title: {
    alignItems: "center",
    height: 250,
    justifyContent: "center",
  },

  titleText: {
    color: "white",
    fontSize: 60,
    fontFamily: "Roboto",
  },
});
