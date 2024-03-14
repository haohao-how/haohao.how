import { Text } from "react-native";
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
      color={rectButtonProps.color ?? "#333"}
    >
      <Text
        style={{
          color: "white",
          fontSize: 10,
          fontWeight: "bold",
          opacity: 0.8,
          textTransform: "uppercase",
          marginBottom: 5,
          alignSelf: "flex-start",
        }}
        selectable={false}
      >
        {title}
      </Text>
      <Text
        style={{
          color: "white",
          fontWeight: "bold",
          alignSelf: "flex-start",
        }}
        selectable={false}
      >
        {subtitle}
      </Text>
    </RectButton>
  );
}
