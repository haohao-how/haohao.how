import { Text, View } from "react-native";
import { tv } from "tailwind-variants";

export const HanziText = ({
  pinyin,
  hanzi,
  accented,
}: {
  pinyin?: string;
  hanzi: string;
  accented?: boolean;
}) => {
  return (
    <View className="flex-0 items-center">
      {pinyin != null ? (
        <Text className={pinyinText({ accented })}>{pinyin}</Text>
      ) : null}
      <Text className={hanziText({ accented })}>{hanzi}</Text>
    </View>
  );
};

const pinyinText = tv({
  base: `text-xs text-primary-9`,
  variants: {
    accented: {
      true: `text-accent-10 opacity-80`,
    },
  },
});

const hanziText = tv({
  base: `text-xl text-text`,
  variants: {
    accented: {
      true: `text-accent-10`,
    },
  },
});
