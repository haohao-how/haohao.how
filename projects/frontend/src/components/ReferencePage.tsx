import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { ReactElement, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { RootView } from "./RootView";

export const ReferencePage = ({
  header,
  body,
}: {
  header: ReactElement;
  body: ReactNode;
}) => {
  return (
    <RootView style={styles.root}>
      {header}

      <View style={styles.body}>{body}</View>

      <ExpoStatusBar style="auto" />
    </RootView>
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
});
