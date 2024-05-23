import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootView } from "../../components/RootView";
import { GradientAqua } from "../../components/styles";

export default function RadicalPage() {
  const { id } = useLocalSearchParams<"/radical/[id]">();
  const insets = useSafeAreaInsets();

  return (
    <RootView style={styles.root}>
      {/* Top header area */}
      <LinearGradient
        colors={GradientAqua}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View
          style={{
            alignItems: "center",
            height: 250,
            justifyContent: "center",
          }}
        >
          <Text style={styles.headerTitleText}>{id}</Text>
        </View>
      </LinearGradient>
      <View style={styles.beltContainer}>
        <Text style={styles.beltText}>hand</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.titledSectionContainer}>
          <View style={styles.titledSectionContainerInner}>
            <View>
              <Text style={styles.titledSectionTitleText}>Mnemonic</Text>
            </View>
            <View>
              <Text style={styles.titledSectionBodyText}>
                A merchant who was selling spears and shields. He claimed that
                his spears were so sharp they could penetrate anything. And the
                shields were impervious to any blow. A skeptical customer asked:
                “What happens if I hit one of your shields with one of your
                spears.”
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.titledSectionContainer}>
          <View style={styles.titledSectionContainerInner}>
            <View>
              <Text style={styles.titledSectionTitleText}>Meaning</Text>
            </View>
            <View>
              <Text style={styles.titledSectionBodyText}>hand, clutch</Text>
            </View>
          </View>
        </View>

        <View style={styles.titledSectionContainer}>
          <View style={styles.titledSectionContainerInner}>
            <View>
              <Text style={styles.titledSectionTitleText}>Pronunciation</Text>
            </View>
            <View>
              <Text style={styles.titledSectionBodyText}>shǒu • shou3</Text>
            </View>
          </View>
        </View>
      </View>

      <ExpoStatusBar style="auto" />
    </RootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "stretch",
  },

  body: {
    flex: 1,
    gap: 12,
    padding: 12,
    paddingTop: 16,
  },

  beltContainer: {
    backgroundColor: "#20293A",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
  },

  beltText: {
    color: "white",
    fontSize: 23,
    fontFamily: "Roboto",
  },

  headerTitleText: {
    color: "white",
    fontSize: 60,
    fontFamily: "Roboto",
  },

  titledSectionContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },

  titledSectionContainerInner: {
    gap: 4,
    flexShrink: 1,
    flexGrow: 0,
    flexBasis: 500,
  },
  titledSectionTitleText: {
    color: "#868686",
    fontSize: 16,
  },
  titledSectionBodyText: {
    color: "#353F38",
    fontSize: 18,
  },
});
