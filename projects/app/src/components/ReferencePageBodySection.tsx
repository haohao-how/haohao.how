import { StyleSheet, Text, View } from "react-native";

export const ReferencePageBodySection = ({
  title,
  children,
}: {
  title: string;
  children: string;
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.containerInner}>
        <View>
          <Text style={styles.titleText}>{title}</Text>
        </View>
        <View>
          <Text style={styles.bodyText}>{children}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: `row`,
    justifyContent: `center`,
  },

  containerInner: {
    gap: 4,
    flexShrink: 1,
    flexGrow: 0,
    flexBasis: 500,
  },
  titleText: {
    color: `#868686`,
    fontSize: 16,
  },
  bodyText: {
    color: `#353F38`,
    fontSize: 18,
  },
});
