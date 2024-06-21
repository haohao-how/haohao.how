import { StyleSheet, Text } from "react-native";
import { RectButton } from "./RectButton";
import { PropsOf } from "./types";

export type SectionHeaderButtonProps = {
  title: string;
  subtitle: string;
} & PropsOf<typeof RectButton>;

/**
 * Ensures on web that the top status bar background color matches the view background.
 */
export function SectionHeaderButton({
  title,
  subtitle,
  ...rectButtonProps
}: SectionHeaderButtonProps) {
  return (
    <RectButton
      {...rectButtonProps}
      borderRadius={rectButtonProps.borderRadius ?? 10}
      color={rectButtonProps.color ?? `#333`}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: 10,
            opacity: 0.8,
            textTransform: `uppercase`,
            marginBottom: 5,
          },
        ]}
      >
        {title}
      </Text>
      <Text style={styles.text}>{subtitle}</Text>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  text: {
    userSelect: `none`,
    color: `white`,
    fontWeight: `bold`,
    alignSelf: `flex-start`,
  },
});
