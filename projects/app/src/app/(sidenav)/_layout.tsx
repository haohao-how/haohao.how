import { Link, Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, View } from "react-native";
import { useMediaQuery } from "react-responsive";

export default function SideNavLayout() {
  const isLg = useMediaQuery({ minWidth: 1024 });

  return (
    <View className="flex-1 flex-col-reverse items-stretch self-stretch lg:flex-row">
      <View className="min-w-[200px] flex-row items-center justify-center gap-4 border-t-2 border-primary-4 pt-2 pb-safe-or-2 px-safe-or-4 lg:max-h-full lg:max-w-[200px] lg:flex-col lg:items-start lg:justify-start lg:border-r-2 lg:border-t-0 lg:px-4 lg:pt-4">
        <Link
          href="/"
          className="px-2 py-1 text-2xl font-bold tracking-wide text-primary-10"
        >
          {isLg ? `haohaohow` : `好`}
        </Link>

        <Link
          href="/dev/ui"
          className="items-center rounded-md px-2 py-1 text-xl font-bold tracking-wide text-text hover:bg-primary-4 lg:self-stretch"
        >
          UI
        </Link>

        <Link
          href="/history"
          className="items-center rounded-md px-2 py-1 text-xl font-bold tracking-wide text-text hover:bg-primary-4 lg:self-stretch"
        >
          History
        </Link>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-safe-offset-4 px-safe-or-4 items-center gap-[10px] padding-[10px]"
      >
        <Slot />
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}
