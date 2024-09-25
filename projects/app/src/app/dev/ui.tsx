import { RectButton2 } from "@/components/RectButton2";
import { RootView } from "@/components/RootView";
import { XStack, YStack } from "@/components/Stack";
import { PropsOf } from "@/components/types";
import { styled, Theme, View } from "@tamagui/core";
import { SizableText } from "@tamagui/text";
import { ReactNode } from "react";

export default function DesignSystemPage() {
  return (
    <RootView flexGrow={1}>
      <XStack>
        <Heading
          flexBasis={1}
          flexGrow={1}
          background="$color4"
          padding="$2"
          theme="light"
        >
          RectButton2
        </Heading>
        <View
          flexBasis={1}
          flexGrow={1}
          background="$color4"
          padding="$2"
          theme="dark"
        />
      </XStack>

      <XStack>
        <ExamplesStack theme="light">
          <RectButton2Examples />
        </ExamplesStack>

        <ExamplesStack theme="dark">
          <RectButton2Examples />
        </ExamplesStack>
      </XStack>

      <XStack flexGrow={1}>
        <ExamplesStack theme="light" />

        <ExamplesStack theme="dark" />
      </XStack>
    </RootView>
  );
}

const ExamplesStack = styled(XStack, {
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
    <SizableText size="$1" textAlign="center" color="$color10">
      {title}
    </SizableText>
    {children}
  </YStack>
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
