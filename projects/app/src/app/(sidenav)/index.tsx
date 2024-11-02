import { CircleButton } from "@/components/CircleButton";
import {
  SectionHeaderButton,
  SectionHeaderButtonProps,
} from "@/components/SectionHeaderButton";
import { GradientAqua, GradientPurple, GradientRed } from "@/components/styles";
import { Link } from "expo-router";
import { ColorValue, ScrollView, View } from "react-native";

export default function IndexPage() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="pt-safe-offset-4 px-safe-or-4 items-center gap-[10px] padding-[10px]"
    >
      <Section
        title="Section 4, Unit 1"
        subtitle="Chat over dinner, communicate travel issues, describe people, talk about people"
        color="#53ADF0"
      />
      <Section
        title="Section 4, Unit 2"
        subtitle="Identify tableware, describe health issues, refer to body parts, refer to colors"
        color="#EF8CCD"
      />
      <Section
        title="Section 4, Unit 3"
        subtitle="Ask someone out, shop for clothes, talk about the weather, discuss sport events"
        color="#78C93D"
      />
      <Section
        title="Section 4, Unit 4"
        subtitle="Talk about seasons, describe travel needs, make plans, talk about hobbies"
        color="#F19B38"
      />
      <Section
        title="Section 4, Unit 5"
        subtitle="Communicate at school, talk about habits, express feelings, describe the environment"
        color="#E95952"
      />
      <Section
        title="Section 4, Unit 6"
        subtitle="Learn useful phrases, discuss communication, refer to business documents, tell time"
        color="#78C93D"
      />
    </ScrollView>
  );
}

const Section = ({
  title,
  color,
  subtitle,
}: Pick<SectionHeaderButtonProps, `title` | `subtitle` | `color`>) => {
  const disabledColor: ColorValue = `#AAA`;
  return (
    <>
      <View className="flex-1 self-stretch lg:self-center">
        <SectionHeaderButton title={title} subtitle={subtitle} color={color} />
      </View>
      <CircleButton color={color} />
      <Link href="/learn" asChild>
        <CircleButton
          color={disabledColor}
          style={{ transform: [{ translateX: 20 }] }}
        />
      </Link>
      <Link href="/radical/手" asChild>
        <CircleButton color={GradientAqua[0]} />
      </Link>
      <Link href="/character/手" asChild>
        <CircleButton color={GradientRed[0]} />
      </Link>
      <Link href="/word/手" asChild>
        <CircleButton color={GradientPurple[0]} />
      </Link>
      <Link href="/login" asChild>
        <CircleButton color={GradientPurple[0]} />
      </Link>
      <Link href="/dev/ui" asChild>
        <CircleButton
          color={disabledColor}
          style={{ transform: [{ translateX: -20 }] }}
        />
      </Link>
      <CircleButton color={disabledColor} />
      <View style={{ height: 50 }} />
    </>
  );
};
