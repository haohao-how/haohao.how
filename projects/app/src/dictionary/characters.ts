import { invariant } from "@/util/invariant";

interface CharacterDatum {
  char: string;
  mnemonic?: string;
  names: string | string[];
  pronunciations?: string[];
  radicals?: string[];
}

export interface Character {
  char: string;
  mnemonic?: string;
  name: string;
  nameAlts?: string[];
  pronunciations?: string[];
  radicals?: string[];
}

const characterData: CharacterDatum[] = [
  { char: `一`, names: [`one`], radicals: [`一`] },
  { char: `丨`, names: [`line`], radicals: [`丨`] },
  { char: `丶`, names: [`dot`], radicals: [`丶`] },
  { char: `丿`, names: [`slash`], radicals: [`丿`] },
  { char: `乙`, names: [`second`], radicals: [`乙`] },
  { char: `亅`, names: [`hook`], radicals: [`亅`] },
  { char: `二`, names: [`two`], radicals: [`二`] },
  { char: `亠`, names: [`lid`], radicals: [`亠`] },
  { char: `人`, names: [`man`], radicals: [`人`] },
  { char: `儿`, names: [`son,legs`], radicals: [`儿`] },
  { char: `入`, names: [`enter`], radicals: [`入`] },
  { char: `八`, names: [`eight`], radicals: [`八`] },
  { char: `冂`, names: [`wide`], radicals: [`冂`] },
  { char: `冖`, names: [`cloth cover`], radicals: [`冖`] },
  { char: `冫`, names: [`ice`], radicals: [`冫`] },
  { char: `几`, names: [`table`], radicals: [`几`] },
  { char: `凵`, names: [`receptacle`], radicals: [`凵`] },
  { char: `刀`, names: [`knife`], radicals: [`刀`] },
  { char: `力`, names: [`power`], radicals: [`力`] },
  { char: `勹`, names: [`wrap`], radicals: [`勹`] },
  { char: `匕`, names: [`spoon`], radicals: [`匕`] },
  { char: `匚`, names: [`box`], radicals: [`匚`] },
  { char: `匸`, names: [`hiding enclosure`], radicals: [`匸`] },
  { char: `十`, names: [`ten`], radicals: [`十`] },
  { char: `卜`, names: [`divination`], radicals: [`卜`] },
  { char: `卩`, names: [`seal (device)`], radicals: [`卩`] },
  { char: `厂`, names: [`cliff`], radicals: [`厂`] },
  { char: `厶`, names: [`private`], radicals: [`厶`] },
  { char: `又`, names: [`again`], radicals: [`又`] },
  { char: `口`, names: [`mouth`], radicals: [`口`] },
  { char: `囗`, names: [`enclosure`], radicals: [`囗`] },
  { char: `土`, names: [`earth`], radicals: [`土`] },
  { char: `士`, names: [`scholar`], radicals: [`士`] },
  { char: `夂`, names: [`go`], radicals: [`夂`] },
  { char: `夊`, names: [`go slowly`], radicals: [`夊`] },
  { char: `夕`, names: [`evening`], radicals: [`夕`] },
  { char: `大`, names: [`big`], radicals: [`大`] },
  { char: `女`, names: [`woman`], radicals: [`女`] },
  { char: `子`, names: [`child`], radicals: [`子`] },
  { char: `宀`, names: [`roof`], radicals: [`宀`] },
  { char: `寸`, names: [`inch`], radicals: [`寸`] },
  { char: `小`, names: [`small`], radicals: [`小`] },
  { char: `尢`, names: [`lame`], radicals: [`尢`] },
  { char: `尸`, names: [`corpse`], radicals: [`尸`] },
  { char: `屮`, names: [`sprout`], radicals: [`屮`] },
  { char: `山`, names: [`mountain`], radicals: [`山`] },
  { char: `巛`, names: [`river`], radicals: [`巛`] },
  { char: `工`, names: [`work`], radicals: [`工`] },
  { char: `己`, names: [`oneself`], radicals: [`己`] },
  { char: `巾`, names: [`turban`], radicals: [`巾`] },
  { char: `干`, names: [`dry`], radicals: [`干`] },
  { char: `幺`, names: [`short thread`], radicals: [`幺`] },
  { char: `广`, names: [`dotted cliff`], radicals: [`广`] },
  { char: `廴`, names: [`long stride`], radicals: [`廴`] },
  { char: `廾`, names: [`arch`], radicals: [`廾`] },
  { char: `弋`, names: [`shoot`], radicals: [`弋`] },
  { char: `弓`, names: [`bow`], radicals: [`弓`] },
  { char: `彐`, names: [`snout`], radicals: [`彐`] },
  { char: `彡`, names: [`bristle`], radicals: [`彡`] },
  { char: `彳`, names: [`step`], radicals: [`彳`] },
  { char: `心`, names: [`heart`], radicals: [`心`] },
  { char: `戈`, names: [`halberd`], radicals: [`戈`] },
  { char: `戶`, names: [`door`], radicals: [`戶`] },
  { char: `手`, names: [`hand`], pronunciations: [`shǒu`], radicals: [`手`] },
  { char: `支`, names: [`branch`], radicals: [`支`] },
  { char: `攴`, names: [`rap, tap`], radicals: [`攴`] },
  { char: `文`, names: [`script`], radicals: [`文`] },
  { char: `斗`, names: [`dipper`], radicals: [`斗`] },
  { char: `斤`, names: [`axe`], radicals: [`斤`] },
  { char: `方`, names: [`square`], radicals: [`方`] },
  { char: `无`, names: [`not`], radicals: [`无`] },
  { char: `日`, names: [`sun`], radicals: [`日`] },
  { char: `曰`, names: [`say`], radicals: [`曰`] },
  { char: `月`, names: [`moon`], radicals: [`月`] },
  { char: `木`, names: [`tree`], radicals: [`木`] },
  { char: `欠`, names: [`lack`], radicals: [`欠`] },
  { char: `止`, names: [`stop`], radicals: [`止`] },
  { char: `歹`, names: [`death`], radicals: [`歹`] },
  { char: `殳`, names: [`weapon`], radicals: [`殳`] },
  { char: `毋`, names: [`do not`], radicals: [`毋`] },
  { char: `比`, names: [`compare`], radicals: [`比`] },
  { char: `毛`, names: [`fur`], radicals: [`毛`] },
  { char: `氏`, names: [`clan`], radicals: [`氏`] },
  { char: `气`, names: [`steam`], radicals: [`气`] },
  { char: `水`, names: [`water`], radicals: [`水`] },
  { char: `火`, names: [`fire`], radicals: [`火`] },
  { char: `爪`, names: [`claw`], radicals: [`爪`] },
  { char: `父`, names: [`father`], radicals: [`父`] },
  { char: `爻`, names: [`Trigrams`], radicals: [`爻`] },
  { char: `爿`, names: [`split wood`], radicals: [`爿`] },
  { char: `片`, names: [`slice`], radicals: [`片`] },
  { char: `牙`, names: [`fang`], radicals: [`牙`] },
  { char: `牛`, names: [`cow`], radicals: [`牛`] },
  { char: `犬`, names: [`dog`], radicals: [`犬`] },
  { char: `玄`, names: [`profound`], radicals: [`玄`] },
  { char: `玉`, names: [`jade`], radicals: [`玉`] },
  { char: `瓜`, names: [`melon`], radicals: [`瓜`] },
  { char: `瓦`, names: [`tile`], radicals: [`瓦`] },
  { char: `甘`, names: [`sweet`], radicals: [`甘`] },
  { char: `生`, names: [`life`], radicals: [`生`] },
  { char: `用`, names: [`use`], radicals: [`用`] },
  { char: `田`, names: [`field`], radicals: [`田`] },
  { char: `疋`, names: [`bolt of cloth`], radicals: [`疋`] },
  { char: `疒`, names: [`sickness`], radicals: [`疒`] },
  { char: `癶`, names: [`footsteps`], radicals: [`癶`] },
  { char: `白`, names: [`white`], radicals: [`白`] },
  { char: `皮`, names: [`skin`], radicals: [`皮`] },
  { char: `皿`, names: [`dish`], radicals: [`皿`] },
  { char: `目`, names: [`eye`], radicals: [`目`] },
  { char: `矛`, names: [`spear`], radicals: [`矛`] },
  { char: `矢`, names: [`arrow`], radicals: [`矢`] },
  { char: `石`, names: [`stone`], radicals: [`石`] },
  { char: `示`, names: [`spirit`], radicals: [`示`] },
  { char: `禸`, names: [`track`], radicals: [`禸`] },
  { char: `禾`, names: [`grain`], radicals: [`禾`] },
  { char: `穴`, names: [`cave`], radicals: [`穴`] },
  { char: `立`, names: [`stand`], radicals: [`立`] },
  { char: `竹`, names: [`bamboo`], radicals: [`竹`] },
  { char: `米`, names: [`rice`], radicals: [`米`] },
  { char: `糸`, names: [`silk`], radicals: [`糸`] },
  { char: `缶`, names: [`jar`], radicals: [`缶`] },
  { char: `网`, names: [`net`], radicals: [`网`] },
  { char: `羊`, names: [`sheep`], radicals: [`羊`] },
  { char: `羽`, names: [`feather`], radicals: [`羽`] },
  { char: `老`, names: [`old`], radicals: [`老`] },
  { char: `而`, names: [`and`], radicals: [`而`] },
  { char: `耒`, names: [`plough`], radicals: [`耒`] },
  { char: `耳`, names: [`ear`], radicals: [`耳`] },
  { char: `聿`, names: [`brush`], radicals: [`聿`] },
  { char: `肉`, names: [`meat`], radicals: [`肉`] },
  { char: `臣`, names: [`minister`], radicals: [`臣`] },
  { char: `自`, names: [`self`], radicals: [`自`] },
  { char: `至`, names: [`arrive`], radicals: [`至`] },
  { char: `臼`, names: [`mortar`], radicals: [`臼`] },
  { char: `舌`, names: [`tongue`], radicals: [`舌`] },
  { char: `舛`, names: [`oppose`], radicals: [`舛`] },
  { char: `舟`, names: [`boat`], radicals: [`舟`] },
  { char: `艮`, names: [`stopping`], radicals: [`艮`] },
  { char: `色`, names: [`colour`], radicals: [`色`] },
  { char: `艸`, names: [`grass`], radicals: [`艸`] },
  { char: `虍`, names: [`tiger`], radicals: [`虍`] },
  { char: `虫`, names: [`insect`], radicals: [`虫`] },
  { char: `血`, names: [`blood`], radicals: [`血`] },
  { char: `行`, names: [`walk enclosure`], radicals: [`行`] },
  { char: `衣`, names: [`clothes`], radicals: [`衣`] },
  { char: `襾`, names: [`cover`], radicals: [`襾`] },
  { char: `見`, names: [`see`], radicals: [`見`] },
  { char: `角`, names: [`horn`], radicals: [`角`] },
  { char: `言`, names: [`speech`], radicals: [`言`] },
  { char: `谷`, names: [`valley`], radicals: [`谷`] },
  { char: `豆`, names: [`bean`], radicals: [`豆`] },
  { char: `豕`, names: [`pig`], radicals: [`豕`] },
  { char: `豸`, names: [`badger`], radicals: [`豸`] },
  { char: `貝`, names: [`shell`], radicals: [`貝`] },
  { char: `赤`, names: [`red`], radicals: [`赤`] },
  { char: `走`, names: [`run`], radicals: [`走`] },
  { char: `足`, names: [`foot`], radicals: [`足`] },
  { char: `身`, names: [`body`], radicals: [`身`] },
  { char: `車`, names: [`cart`], radicals: [`車`] },
  { char: `辛`, names: [`bitter`], radicals: [`辛`] },
  { char: `辰`, names: [`morning`], radicals: [`辰`] },
  { char: `辵`, names: [`walk`], radicals: [`辵`] },
  { char: `邑`, names: [`city`], radicals: [`邑`] },
  { char: `酉`, names: [`wine`], radicals: [`酉`] },
  { char: `釆`, names: [`distinguish`], radicals: [`釆`] },
  { char: `里`, names: [`village`], radicals: [`里`] },
  { char: `金`, names: [`gold`], radicals: [`金`] },
  { char: `長`, names: [`long`], radicals: [`長`] },
  { char: `門`, names: [`gate`], radicals: [`門`] },
  { char: `阜`, names: [`mound`], radicals: [`阜`] },
  { char: `隶`, names: [`slave`], radicals: [`隶`] },
  { char: `隹`, names: [`short-tailed bird`], radicals: [`隹`] },
  { char: `雨`, names: [`rain`], radicals: [`雨`] },
  { char: `靑`, names: [`blue`], radicals: [`靑`] },
  { char: `非`, names: [`wrong`], radicals: [`非`] },
  { char: `面`, names: [`face`], radicals: [`面`] },
  { char: `革`, names: [`leather`], radicals: [`革`] },
  { char: `韋`, names: [`tanned leather`], radicals: [`韋`] },
  { char: `韭`, names: [`leek`], radicals: [`韭`] },
  { char: `音`, names: [`sound`], radicals: [`音`] },
  { char: `頁`, names: [`leaf`], radicals: [`頁`] },
  { char: `風`, names: [`wind`], radicals: [`風`] },
  { char: `飛`, names: [`fly`], radicals: [`飛`] },
  { char: `食`, names: [`eat`], radicals: [`食`] },
  { char: `首`, names: [`head`], radicals: [`首`] },
  { char: `香`, names: [`fragrant`], radicals: [`香`] },
  { char: `馬`, names: [`horse`], radicals: [`馬`] },
  { char: `骨`, names: [`bone`], radicals: [`骨`] },
  { char: `高`, names: [`tall`], radicals: [`高`] },
  { char: `髟`, names: [`hair`], radicals: [`髟`] },
  { char: `鬥`, names: [`fight`], radicals: [`鬥`] },
  { char: `鬯`, names: [`sacrificial wine`], radicals: [`鬯`] },
  { char: `鬲`, names: [`cauldron`], radicals: [`鬲`] },
  { char: `鬼`, names: [`ghost`], radicals: [`鬼`] },
  { char: `魚`, names: [`fish`], radicals: [`魚`] },
  { char: `鳥`, names: [`bird`], radicals: [`鳥`] },
  { char: `鹵`, names: [`salt`], radicals: [`鹵`] },
  { char: `鹿`, names: [`deer`], radicals: [`鹿`] },
  { char: `麥`, names: [`wheat`], radicals: [`麥`] },
  { char: `麻`, names: [`hemp`], radicals: [`麻`] },
  { char: `黃`, names: [`yellow`], radicals: [`黃`] },
  { char: `黍`, names: [`millet`], radicals: [`黍`] },
  { char: `黑`, names: [`black`], radicals: [`黑`] },
  { char: `黹`, names: [`embroidery`], radicals: [`黹`] },
  { char: `黽`, names: [`frog`], radicals: [`黽`] },
  { char: `鼎`, names: [`tripod`], radicals: [`鼎`] },
  { char: `鼓`, names: [`drum`], radicals: [`鼓`] },
  { char: `鼠`, names: [`rat`], radicals: [`鼠`] },
  { char: `鼻`, names: [`nose`], radicals: [`鼻`] },
  { char: `齊`, names: [`even`], radicals: [`齊`] },
  { char: `齒`, names: [`tooth`], radicals: [`齒`] },
  { char: `龍`, names: [`dragon`], radicals: [`龍`] },
  { char: `龜`, names: [`turtle`], radicals: [`龜`] },
  { char: `龠`, names: [`flute`], radicals: [`龠`] },
];

// Transform data into an easier shape to work with.
const characters = characterData.map(
  ({ char, names, pronunciations, mnemonic, radicals }) => {
    const [name, ...altNames] = names;
    invariant(name !== undefined, `expected at least one name`);

    const character: Character = {
      char,
      name,
    };

    if (altNames.length > 0) {
      character.nameAlts = altNames;
    }

    if (pronunciations !== undefined && pronunciations.length > 0) {
      character.pronunciations = pronunciations;
    }

    if (mnemonic !== undefined) {
      character.mnemonic = mnemonic;
    }

    if (radicals !== undefined && radicals.length > 0) {
      character.radicals = radicals;
    }

    return character;
  },
);

/**
 * Lookup by character.
 */
export const characterLookupByHanzi: ReadonlyMap<string, Character> = new Map(
  characters.map((c) => [c.char, c]),
);
