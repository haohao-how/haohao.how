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
      <Text className={hanziText({ accented })}>{hanzi}</Text>
      {pinyin != null ? (
        <Text className={pinyinText({ accented })}>{pinyin}</Text>
      ) : null}
    </View>
  );
};

const pinyinText = tv({
  base: `text-xs text-primary-9 absolute bottom-[100%] right-0 left-0 text-center pb-1`,
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
