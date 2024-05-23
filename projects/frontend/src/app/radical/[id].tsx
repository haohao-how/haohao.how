import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootView } from "../../components/RootView";
import { GradientAqua } from "../../components/styles";
import { radicalLookupByChar } from "../../data/radicals";

export default function RadicalPage() {
  const { id } = useLocalSearchParams<"/radical/[id]">();
  const insets = useSafeAreaInsets();
  const radical = radicalLookupByChar.get(id);

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
          <Text style={styles.headerTitleText}>{radical?.char ?? "⁉️"}</Text>
        </View>
      </LinearGradient>

      <View style={styles.beltContainer}>
        <Text style={styles.beltText}>{radical?.name ?? ""}</Text>
      </View>

      <View style={styles.body}>
        {radical?.mnemonic !== undefined ? (
          <TitledSection title="Mnemonic">{radical.mnemonic}</TitledSection>
        ) : null}

        {radical !== undefined ? (
          <TitledSection title="Meaning">
            {[radical.name].concat(radical.altNames ?? []).join(", ")}
          </TitledSection>
        ) : null}

        {radical?.pronunciations !== undefined ? (
          <TitledSection title="Pronunciation">
            {radical.pronunciations.join(", ")}
          </TitledSection>
        ) : null}
      </View>

      <ExpoStatusBar style="auto" />
    </RootView>
  );
}

const TitledSection = ({
  title,
  children,
}: {
  title: string;
  children: string;
}) => {
  return (
    <View style={styles.titledSectionContainer}>
      <View style={styles.titledSectionContainerInner}>
        <View>
          <Text style={styles.titledSectionTitleText}>{title}</Text>
        </View>
        <View>
          <Text style={styles.titledSectionBodyText}>{children}</Text>
        </View>
      </View>
    </View>
  );
};

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
