import { AnswerButton, AnswerButtonState } from "@/components/AnswerButton";
import { RectButton2 } from "@/components/RectButton2";
import { PropsOf } from "@/components/types";
import shuffle from "lodash/shuffle";
import { ReactNode, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tv } from "tailwind-variants";

export default function DesignSystemPage() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <ScrollView style={{ flex: 1 }}>
        <Section title="AnswerButton">
          <AnswerButtonExamples />
        </Section>

        <Section title="RectButton2">
          <RectButton2Examples />
        </Section>

        <Section title="Typography">
          <View className="flex-column flex-1 gap-2">
            {([`body`, `title`, `chinese`] as const).map((family) => (
              <View className="flex-column" key={family}>
                <LittlePrimaryHeader title={family} />
                <TypographyExample family={family} size="xs" />
                <TypographyExample family={family} size="sm" />
                <TypographyExample family={family} size="base" />
                <TypographyExample family={family} size="lg" />
                <TypographyExample family={family} size="xl" />
                <TypographyExample family={family} size="2xl" />
              </View>
            ))}
          </View>
        </Section>

        <Section title="Colors">
          <View className="flex-column">
            <LittlePrimaryHeader title="primary" />
            <View className="flex-row flex-wrap gap-1">
              <PrimarySwatches />
            </View>
          </View>

          <View className="flex-column">
            <LittleAccentHeader title="accent" />
            <View className="flex-row flex-wrap gap-1">
              <AccentSwatches />
            </View>
          </View>

          <View className={`danger-theme flex-column`}>
            <LittleAccentHeader title="danger" />
            <View className="flex-row flex-wrap gap-1">
              <AccentSwatches />
            </View>
          </View>

          <View className={`danger-success flex-column`}>
            <LittleAccentHeader title="success" />
            <View className="flex-row flex-wrap gap-1">
              <AccentSwatches />
            </View>
          </View>
        </Section>

        {/* Fill the rest of the page if it's too tall for the content */}
        <View className="flex-1 flex-row">
          <View className={`light-theme ${examplesStackClassName}`} />
          <View className={`dark-theme ${examplesStackClassName}`} />
        </View>
      </ScrollView>
    </View>
  );
}

const typography = tv({
  base: `text-primary-12`,

  variants: {
    size: {
      xs: `text-xs`,
      sm: `text-sm`,
      base: `text-base`,
      lg: `text-lg`,
      xl: `text-xl`,
      "2xl": `text-2xl`,
    },
    family: {
      body: `font-body`,
      title: `font-title`,
      chinese: `font-chinese`,
    },
  },
});

const TypographyExample = ({
  size,
  family,
}: {
  size: `xs` | `sm` | `base` | `lg` | `xl` | `2xl`;
  family: `body` | `title` | `chinese`;
}) => {
  return (
    <View className="flex-column">
      <Text className="font-xs text-primary-9">
        <Text className="text-xs font-bold text-primary-11">{size}</Text>
      </Text>

      <Text className={typography({ size, family })} numberOfLines={1}>
        The quick brown fox jumps over the lazy dog.
      </Text>
    </View>
  );
};

const LittlePrimaryHeader = ({ title }: { title: string }) => {
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-[1px] flex-grow bg-primary-7" />
      <Text className="text-center text-xs font-bold uppercase text-primary-10">
        {title}
      </Text>
      <View className="h-[1px] flex-grow bg-primary-7" />
    </View>
  );
};

const LittleAccentHeader = ({ title }: { title: string }) => {
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-[1px] flex-grow bg-accent-7" />
      <Text className="text-center text-xs font-bold uppercase text-accent-10">
        {title}
      </Text>
      <View className="h-[1px] flex-grow bg-accent-7" />
    </View>
  );
};

const PrimarySwatches = () => {
  return (
    <>
      <PrimarySwatch index={1} />
      <PrimarySwatch index={2} />
      <PrimarySwatch index={3} />
      <PrimarySwatch index={4} />
      <PrimarySwatch index={5} />
      <PrimarySwatch index={6} />
      <PrimarySwatch index={7} />
      <PrimarySwatch index={8} />
      <PrimarySwatch index={9} />
      <PrimarySwatch index={10} />
      <PrimarySwatch index={11} />
      <PrimarySwatch index={12} />
    </>
  );
};
const AccentSwatches = () => {
  return (
    <>
      <AccentSwatch index={1} />
      <AccentSwatch index={2} />
      <AccentSwatch index={3} />
      <AccentSwatch index={4} />
      <AccentSwatch index={5} />
      <AccentSwatch index={6} />
      <AccentSwatch index={7} />
      <AccentSwatch index={8} />
      <AccentSwatch index={9} />
      <AccentSwatch index={10} />
      <AccentSwatch index={11} />
      <AccentSwatch index={12} />
    </>
  );
};

const captionLabel = tv({
  base: `text-primary-9 text-xs text-center`,
  variants: {
    highlighted: {
      true: `text-primary-11 font-bold`,
    },
  },
});

const accentRect = tv({
  base: `h-[40px] w-[40px]`,
  variants: {
    index: {
      1: `bg-accent-1`,
      2: `bg-accent-2`,
      3: `bg-accent-3`,
      4: `bg-accent-4`,
      5: `bg-accent-5`,
      6: `bg-accent-6`,
      7: `bg-accent-7`,
      8: `bg-accent-8`,
      9: `bg-accent-9`,
      10: `bg-accent-10`,
      11: `bg-accent-11`,
      12: `bg-accent-12`,
    },
  },
});

const AccentSwatch = ({ index }: { index: number }) => (
  <View className="flex-column flex-wrap gap-1">
    <Text className={captionLabel({ highlighted: index === 10 })}>{index}</Text>
    <View
      className={accentRect({
        index: index as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
      })}
    />
  </View>
);
const primaryRect = tv({
  base: `h-[40px] w-[40px]`,
  variants: {
    index: {
      1: `bg-primary-1`,
      2: `bg-primary-2`,
      3: `bg-primary-3`,
      4: `bg-primary-4`,
      5: `bg-primary-5`,
      6: `bg-primary-6`,
      7: `bg-primary-7`,
      8: `bg-primary-8`,
      9: `bg-primary-9`,
      10: `bg-primary-10`,
      11: `bg-primary-11`,
      12: `bg-primary-12`,
    },
  },
});

const PrimarySwatch = ({ index }: { index: number }) => (
  <View className="flex-column flex-wrap gap-1">
    <Text className={captionLabel({ highlighted: index === 10 })}>{index}</Text>
    <View
      className={primaryRect({
        index: index as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
      })}
    />
  </View>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <>
    <View className="flex-row">
      <View className={`light-theme flex-1 bg-primary-4 p-2`}>
        <Text className="text-2xl">{title}</Text>
      </View>
      <View className={`dark-theme flex-1 bg-primary-4 p-2`} />
    </View>
    <View className="flex-row">
      <View className={`light-theme ${examplesStackClassName}`}>
        {children}
      </View>
      <View className={`dark-theme ${examplesStackClassName}`}>{children}</View>
    </View>
  </>
);

const examplesStackClassName = `bg-background flex-1 shrink basis-1 flex-row flex-wrap justify-center gap-2 p-2 sm:justify-start`;

const ExampleStack = ({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) => (
  <View className="radius-2 gap-2 p-2">
    <Text className="text-center text-xs text-primary-10">{title}</Text>
    {children}
  </View>
);

const RectButton2Variants = (props: Partial<PropsOf<typeof RectButton2>>) => (
  <>
    <RectButton2 variant="bare" {...props}>
      Bare
    </RectButton2>
    <RectButton2 variant="outline" {...props}>
      Outline
    </RectButton2>
    <RectButton2 variant="filled" {...props}>
      Filled
    </RectButton2>
  </>
);

const RectButton2Examples = (props: Partial<PropsOf<typeof RectButton2>>) => (
  <>
    <ExampleStack title="normal">
      <RectButton2Variants {...props} />
    </ExampleStack>

    <ExampleStack title="accent">
      <RectButton2Variants accent {...props} />
    </ExampleStack>

    <View className="success-theme">
      <ExampleStack title="success">
        <RectButton2Variants accent {...props} />
      </ExampleStack>
    </View>

    <View className="danger-theme">
      <ExampleStack title="danger">
        <RectButton2Variants accent {...props} />
      </ExampleStack>
    </View>

    <ExampleStack title="normal (disabled)">
      <RectButton2Variants disabled {...props} />
    </ExampleStack>

    <ExampleStack title="accent (disabled)">
      <RectButton2Variants accent disabled {...props} />
    </ExampleStack>

    <ExampleStack title="fill width">
      <View className="w-[300px] gap-2 border-2 border-dashed border-primary-8">
        <RectButton2Variants {...props} />
      </View>
    </ExampleStack>
  </>
);

const AnswerButtonExamples = (props: Partial<PropsOf<typeof AnswerButton>>) => (
  <>
    <ExampleStack title="normal">
      <SyncedAnswerButtonExample />
    </ExampleStack>

    <ExampleStack title="disabled">
      <AnswerButton disabled {...props}>
        Selectable
      </AnswerButton>
    </ExampleStack>

    <ExampleStack title="fill width">
      <View className="w-[300px] gap-2 border-2 border-dashed border-primary-8">
        <SyncedAnswerButtonExample />
        <AnswerButton disabled {...props}>
          Selectable
        </AnswerButton>
      </View>
    </ExampleStack>
  </>
);

function SyncedAnswerButtonExample() {
  const [state, setState] = useState<AnswerButtonState>(`default`);
  return (
    <>
      <AnswerButton
        state={state}
        onPress={() => {
          setState(
            (prev) =>
              shuffle(
                (
                  [
                    `selected`,
                    `success`,
                    `error`,
                    `default`,
                  ] as AnswerButtonState[]
                ).filter((x) => x !== prev),
              )[0] ?? `default`,
          );
        }}
      >
        Primary
      </AnswerButton>
      <AnswerButton state={state}>Mirror</AnswerButton>
    </>
  );
}
