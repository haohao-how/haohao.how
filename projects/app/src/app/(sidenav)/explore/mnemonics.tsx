import { loadMmPinyinChart } from "@/dictionary/dictionary";
import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import { ScrollView, Text, View } from "react-native";

const associations = {
  tones: [
    { tone: 1, desc: `high and level` },
    { tone: 2, desc: `rising and questioning` },
    { tone: 3, desc: `mid-level and neutral` },
    { tone: 4, desc: `falling and definitive` },
    { tone: 5, desc: `light and short` },
  ],
  initials: [
    { prefix: ``, n: ` ` },
    { prefix: `b`, n: `Batman `, desc: `strong and iconic` },
    { prefix: `p`, n: `Pikachu `, desc: `playful and electric` },
    { prefix: `m`, n: `Mickey Mouse `, desc: `cheerful and classic` },
    { prefix: `f`, n: `Frodo `, desc: `adventurous and brave` },
    { prefix: `d`, n: `Darth Vader `, desc: `dark and commanding` },
    { prefix: `t`, n: `Thor `, desc: `mighty and thunderous` },
    { prefix: `n`, n: `Nemo `, desc: `from Finding Nemo, small and curious` },
    { prefix: `l`, n: `Leonardo da Vinci `, desc: `intellectual and creative` },
    { prefix: `g`, n: `Gandalf `, desc: `wise and magical` },
    { prefix: `k`, n: `King Kong `, desc: `strong and primal` },
    { prefix: `h`, n: `Harry Potter `, desc: `magical and iconic` },
    { prefix: `j`, n: `Joker `, desc: `mischievous and unpredictable` },
    { prefix: `q`, n: `Queen Elizabeth `, desc: `royal and dignified` },
    { prefix: `x`, n: `Xena `, desc: `warrior and fierce` },
    { prefix: `zh`, n: `Zorro `, desc: `mysterious and dashing` },
    { prefix: `ch`, n: `Charlie Chaplin `, desc: `comical and quirky` },
    { prefix: `sh`, n: `Sherlock Holmes `, desc: `observant and logical` },
    { prefix: `r`, n: `Robin Hood `, desc: `heroic and altruistic` },
    { prefix: `z`, n: `Zeus `, desc: `powerful and godly` },
    { prefix: `c`, n: `Captain America `, desc: `patriotic and honorable` },
    { prefix: `s`, n: `Spider-Man `, desc: `agile and friendly` },
    { prefix: `y`, n: `Yoda `, desc: `wise and small` },
    { prefix: `w`, n: `Wonder Woman `, desc: `strong and inspirational` },
  ],
  finals: [
    {
      suffix: `a`,
      location: `Africa`,
      rationale: `Open, expansive sound like vast African plains.`,
    },
    {
      suffix: `ai`,
      location: `Eiffel Tower, Paris`,
      rationale: `Sounds like 'I,' associated with romance and Paris.`,
    },
    {
      suffix: `ao`,
      location: `Australia`,
      rationale: `Open vowel echoes wide Australian Outback or iconic Opera House.`,
    },
    {
      suffix: `an`,
      location: `Andes Mountains`,
      rationale: `'An' in Andes Mountains is easy to connect.`,
    },
    {
      suffix: `ang`,
      location: `Amazon Rainforest`,
      rationale: `Wide, nasal sound evokes the dense, expansive rainforest.`,
    },
    {
      suffix: `ei`,
      location: `Eiffel Tower, Paris`,
      rationale: `'Ei' sound aligns with elegance and height.`,
    },
    {
      suffix: `en`,
      location: `England`,
      rationale: `Soft nasal sound feels refined, like England.`,
    },
    {
      suffix: `eng`,
      location: `Everest, Mount`,
      rationale: `Nasal tone resonates with the vast, towering presence of Mount Everest.`,
    },
    {
      suffix: `er`,
      location: `Earth`,
      rationale: `Sounds like 'er,' symbolic of the whole planet.`,
    },
    {
      suffix: `i`,
      location: `Italy`,
      rationale: `Simple, elegant, and evokes the narrow shape of Italy on a map.`,
    },
    {
      suffix: `ia`,
      location: `Ibiza`,
      rationale: `Fun, open sound matches the vibrant atmosphere of Ibiza.`,
    },
    {
      suffix: `ie`,
      location: `Vienna, Austria`,
      rationale: `Soft, refined 'ie' sound connects with classical Vienna.`,
    },
    {
      suffix: `iao`,
      location: `Amazon River`,
      rationale: `'iao' flows like the sound of a river.`,
    },
    {
      suffix: `iu`,
      location: `Iguazu Falls`,
      rationale: `Combines vowels like the cascading nature of Iguazu Falls.`,
    },
    {
      suffix: `ian`,
      location: `Indiana, USA`,
      rationale: `Familiar and relatable place name.`,
    },
    {
      suffix: `iang`,
      location: `Yangtze River, China`,
      rationale: `Close match phonetically and culturally significant.`,
    },
    {
      suffix: `in`,
      location: `India`,
      rationale: `Resonates with the nasal tone and cultural richness.`,
    },
    {
      suffix: `ing`,
      location: `Singapore`,
      rationale: `The nasal and forward tone aligns with Singapore's modern cityscape.`,
    },
    {
      suffix: `iong`,
      location: `Hong Kong`,
      rationale: `Close phonetic similarity to 'iong'.`,
    },
    {
      suffix: `o`,
      location: `Oslo`,
      rationale: `Simple and rounded, matches the vowel sound.`,
    },
    {
      suffix: `ong`,
      location: `Oregon, USA`,
      rationale: `Nasal quality matches the open, natural landscapes of Oregon.`,
    },
    {
      suffix: `ou`,
      location: `Outer Space`,
      rationale: `'Ou' feels vast and mysterious, like space.`,
    },
    {
      suffix: `u`,
      location: `Utah, USA`,
      rationale: `Rounded, simple sound like the landscapes of Utah.`,
    },
    {
      suffix: `ua`,
      location: `Hawaii`,
      rationale: `Open and exotic sound matches the islands.`,
    },
    {
      suffix: `uai`,
      location: `Dubai`,
      rationale: `Dynamic, modern sound resonates with Dubai's atmosphere.`,
    },
    {
      suffix: `uan`,
      location: `Taiwan`,
      rationale: `Close phonetic and geographical connection.`,
    },
    {
      suffix: `uang`,
      location: `Guangxi, China`,
      rationale: `Phonetic similarity to the region in China.`,
    },
    {
      suffix: `ui`,
      location: `Waikiki Beach, Hawaii`,
      rationale: `Relaxed, playful sound matches Hawaii’s famous beach.`,
    },
    {
      suffix: `un`,
      location: `London`,
      rationale: `Simple and iconic nasal sound matches London’s aura.`,
    },
    {
      suffix: `uo`,
      location: `Morocco`,
      rationale: `Rounded, exotic sound fits Morocco’s vibe.`,
    },
    {
      suffix: `ü`,
      location: `Munich, Germany`,
      rationale: `'ü' sound matches the German umlaut, a cultural fit.`,
    },
    {
      suffix: `üe`,
      location: `Quebec, Canada`,
      rationale: `'ü' sound pairs well with French influence in Quebec.`,
    },
    {
      suffix: `üan`,
      location: `Yuanmingyuan, China`,
      rationale: `Direct cultural and phonetic connection to a Chinese location.`,
    },
    {
      suffix: `ün`,
      location: `Kyoto, Japan`,
      rationale: `Soft and nasal sound aligns with Kyoto’s serene atmosphere.`,
    },
  ],
};

const widths = [
  `w-[25%]`,
  `w-[0%]`,
  `w-[0%]`,
  `w-[10%]`,
  `w-[0%]`,
  `w-[0%]`,
  `w-[0%]`,
  `w-[75%]`,
  `w-[84%]`,
  `w-[0%]`,
  `w-[0%]`,
  `w-[5%]`,
  `w-[100%]`,
  `w-[43%]`,
];

export default function MnemonicsPage() {
  const query = useQuery({
    queryKey: [MnemonicsPage.name, `chart`],
    queryFn: async () => {
      return await loadMmPinyinChart();
    },
    throwOnError: true,
  });

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="py-safe-offset-4 items-center"
    >
      <View className="max-w-[600px] gap-4 px-safe-or-4">
        <View className="gap-2 lg:px-0">
          <Text className="text-center text-2xl font-bold text-text">
            Mnemonics
          </Text>
        </View>

        {query.data == null ? (
          query.isLoading ? (
            <Text className="text-text">Loading</Text>
          ) : query.isError ? (
            <Text className="text-text">Error</Text>
          ) : (
            <Text className="text-text">unexpected state</Text>
          )
        ) : (
          <>
            <View className="">
              <Text className="text-lg font-bold text-text">Tones</Text>
            </View>
            <View className="flex-row flex-wrap gap-3.5 lg:gap-4">
              {associations.tones.map(({ tone, desc }, i) => (
                <View
                  key={tone}
                  className="size-24 justify-center gap-2 rounded-xl bg-primary-3 px-2 hover:bg-primary-5 lg:size-24"
                >
                  <Text className="text-center font-cursive text-2xl text-text">
                    {tone}
                  </Text>
                  <Text
                    className="text-md text-md text-center text-primary-10"
                    numberOfLines={1}
                  >
                    {desc}
                  </Text>
                  <View className="h-2 rounded bg-primary-5">
                    <View
                      className={`h-2 ${widths[3 + (i % widths.length)] ?? ``} rounded bg-[yellow]`}
                    ></View>
                  </View>
                </View>
              ))}
            </View>

            <View className="border-t-2 border-primary-5"></View>

            <View className="">
              <Text className="text-lg font-bold text-text">Initials</Text>
            </View>
            <View className="gap-3.5 lg:gap-4">
              {Object.entries(query.data.initialGrouping).map(
                ([, { initials, desc }], i) => (
                  <Fragment key={desc}>
                    <View className="flex-0">
                      <Text className="text-md text-text">{desc}</Text>
                    </View>
                    <View className="flex-0 flex-row flex-wrap gap-3.5">
                      {initials.map((prefix) => (
                        <View
                          key={prefix}
                          className="size-24 justify-center gap-2 rounded-xl bg-primary-3 px-2 hover:bg-primary-5 lg:size-24"
                        >
                          <Text className="text-center font-cursive text-2xl text-text">
                            {prefix}-
                          </Text>
                          <Text
                            className="text-md text-md text-center text-primary-10"
                            numberOfLines={1}
                          >
                            {`??`}
                          </Text>
                          <View className="h-2 rounded bg-primary-5">
                            <View
                              className={`h-2 ${widths[1 + (i % widths.length)] ?? ``} rounded bg-[yellow]`}
                            ></View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </Fragment>
                ),
              )}
            </View>

            <View className="border-t-2 border-primary-5"></View>

            <View className="">
              <Text className="text-lg font-bold text-text">Finals</Text>
            </View>
            <View className="flex-row flex-wrap gap-3.5 lg:gap-4">
              {query.data.finals.map(([final, ...alts], i) => (
                <View
                  key={i}
                  className="size-24 justify-center gap-1 rounded-xl bg-primary-3 px-2 hover:bg-primary-5 lg:size-24"
                >
                  <Text className="text-center font-cursive text-2xl text-text">
                    -{final}
                  </Text>
                  <Text
                    className="text-center text-xs text-primary-10"
                    numberOfLines={1}
                  >
                    {alts
                      .filter((x) => x.length > 0)
                      .map((x) => `` + x)
                      .join(` `)}
                  </Text>
                  <View className="mt-2 h-2 rounded bg-primary-5">
                    <View
                      className={`h-2 ${widths[5 + (i % widths.length)] ?? ``} rounded bg-[yellow]`}
                    ></View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
