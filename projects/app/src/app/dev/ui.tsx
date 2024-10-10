import { AnswerButton, AnswerButtonState } from "@/components/AnswerButton";
import { RectButton2 } from "@/components/RectButton2";
import { RootView } from "@/components/RootView";
import { XStack, YStack } from "@/components/Stack";
import { PropsOf } from "@/components/types";
import { invariant } from "@haohaohow/lib/invariant";
import {
  FontSizeTokens,
  getConfig,
  styled,
  Theme,
  Variable,
  View,
} from "@tamagui/core";
import { SizableText } from "@tamagui/text";
import shuffle from "lodash/shuffle";
import { ReactNode, useState } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DesignSystemPage() {
  const insets = useSafeAreaInsets();

  const fontSizeTokens = Array.from({ length: 16 }).map(
    (_, i) => `$${i + 1}` as FontSizeTokens,
  );

  return (
    <RootView flex={1} paddingTop={insets.top}>
      <ScrollView style={{ flex: 1 }}>
        <Section title="AnswerButton">
          <AnswerButtonExamples />
        </Section>

        <Section title="RectButton2">
          <RectButton2Examples />
        </Section>

        <Section title="Typography">
          <YStack flex={1} gap="$2">
            {([`$body`, `$title`, `$chinese`] as const).map((font) => (
              <YStack key={font}>
                <LittleAccentHeader title={font} />
                {fontSizeTokens.map((size) => (
                  <TypographyExample font={font} size={size} key={size} />
                ))}
              </YStack>
            ))}
          </YStack>
        </Section>

        <Section title="Colors">
          <YStack>
            <LittleAccentHeader title="default" />
            <XStack gap="$1" flexWrap="wrap">
              <AccentSwatches tokenBase="color" />
            </XStack>
          </YStack>

          <YStack theme="danger">
            <LittleAccentHeader title="danger" />
            <XStack gap="$1" flexWrap="wrap">
              <AccentSwatches tokenBase="accent" />
            </XStack>
          </YStack>

          <YStack theme="success">
            <LittleAccentHeader title="success" />
            <XStack gap="$1" flexWrap="wrap">
              <AccentSwatches tokenBase="accent" />
            </XStack>
          </YStack>
        </Section>

        {/* Fill the rest of the page if it's too tall for the content */}
        <XStack flexGrow={1}>
          <ExamplesStack theme="light" />
          <ExamplesStack theme="dark" />
        </XStack>
      </ScrollView>
    </RootView>
  );
}

const TypographyExample = ({
  size,
  font: fontKey,
}: {
  size: FontSizeTokens;
  font: `$body` | `$title` | `$chinese`;
}) => {
  const c = getConfig();
  c.fonts[c.defaultFontToken];

  c.fontsParsed;

  const font = c.fontsParsed[fontKey];
  invariant(font != null);

  function getVal(v: string | number | Variable | undefined): string | number {
    if (typeof v === `string` || typeof v === `number`) {
      return v;
    }
    if (typeof v === `undefined`) {
      return ``;
    }
    return v.val as string | number;
  }

  const fontWeight = getVal(font.weight?.[size]);
  const fontSize = getVal(font.size[size]);
  const lineHeight = getVal(font.lineHeight?.[size]);

  return (
    <YStack flex={1} gap="$1">
      <SizableText color="$color9" fontSize="$2">
        <SizableText color="$color11" fontSize="$2" fontWeight="bold">
          {size}
        </SizableText>
        <SizableText color="$color10">
          {` `}•{` `}
        </SizableText>
        {fontSize}px / {lineHeight}px
        <SizableText color="$color10">
          {` `}•{` `}
        </SizableText>
        {fontWeight}
      </SizableText>

      <SizableText size={size} numberOfLines={1} flex={1} fontFamily={fontKey}>
        The quick brown fox jumps over the lazy dog.
      </SizableText>
    </YStack>
  );
};

const LittleAccentHeader = ({
  title,
  accented = true,
}: {
  title: string;
  accented?: boolean;
}) => {
  const token = accented ? `$accent` : `$color`;
  return (
    <XStack gap="$2" alignItems="center">
      <View height={1} backgroundColor={token + `7`} flexGrow={1} />
      <SizableText
        color={token + `10`}
        fontSize="$2"
        fontWeight="bold"
        textTransform="uppercase"
        textAlign="center"
      >
        {title}
      </SizableText>
      <View height={1} backgroundColor={token + `7`} flexGrow={1} />
    </XStack>
  );
};

const AccentSwatches = ({ tokenBase }: { tokenBase: string }) => {
  return (
    <>
      <AccentSwatch tokenBase={tokenBase} index={1} />
      <AccentSwatch tokenBase={tokenBase} index={2} />
      <AccentSwatch tokenBase={tokenBase} index={3} />
      <AccentSwatch tokenBase={tokenBase} index={4} />
      <AccentSwatch tokenBase={tokenBase} index={5} />
      <AccentSwatch tokenBase={tokenBase} index={6} />
      <AccentSwatch tokenBase={tokenBase} index={7} />
      <AccentSwatch tokenBase={tokenBase} index={8} />
      <AccentSwatch tokenBase={tokenBase} index={9} />
      <AccentSwatch tokenBase={tokenBase} index={10} />
      <AccentSwatch tokenBase={tokenBase} index={11} />
      <AccentSwatch tokenBase={tokenBase} index={12} />
    </>
  );
};

const AccentSwatch = ({
  index,
  tokenBase,
}: {
  index: number;
  tokenBase: string;
}) => (
  <YStack gap="$1">
    <CaptionText
      {...(index === 10
        ? {
            color: `$color11`,
            fontWeight: `bold`,
          }
        : {})}
    >
      {index}
    </CaptionText>
    <View width={40} height={40} backgroundColor={`$${tokenBase}${index}`} />
  </YStack>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <>
    <XStack>
      <View
        backgroundColor="$color4"
        flexBasis={1}
        flexGrow={1}
        padding="$2"
        theme="light"
      >
        <Heading>{title}</Heading>
      </View>
      <View
        flexBasis={1}
        flexGrow={1}
        backgroundColor="$color4"
        padding="$2"
        theme="dark"
      />
    </XStack>
    <XStack>
      <ExamplesStack theme="light">{children}</ExamplesStack>
      <ExamplesStack theme="dark">{children}</ExamplesStack>
    </XStack>
  </>
);

const ExamplesStack = styled(XStack, {
  justifyContent: `center`,
  $gtSm: {
    justifyContent: `flex-start`,
  },
  gap: `$2`,
  backgroundColor: `$background`,
  padding: `$2`,
  flex: 1,
  flexBasis: 1,
  flexWrap: `wrap`,
});

const Heading = styled(SizableText, {
  size: `$9`,
});

const ExampleStack = ({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) => (
  <YStack
    backgroundColor={0.5}
    borderColor="$borderColor"
    borderRadius="$2"
    padding="$2"
    gap="$2"
  >
    <CaptionText>{title}</CaptionText>
    {children}
  </YStack>
);

const CaptionText = styled(SizableText, {
  size: `$1`,
  textAlign: `center`,
  color: `$color10`,
});

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

    <Theme name="success">
      <ExampleStack title="success">
        <RectButton2Variants accent {...props} />
      </ExampleStack>
    </Theme>

    <Theme name="danger">
      <ExampleStack title="danger">
        <RectButton2Variants accent {...props} />
      </ExampleStack>
    </Theme>

    <ExampleStack title="normal (disabled)">
      <RectButton2Variants disabled {...props} />
    </ExampleStack>

    <ExampleStack title="accent (disabled)">
      <RectButton2Variants accent disabled {...props} />
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
