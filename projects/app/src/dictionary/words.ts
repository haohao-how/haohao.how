import { invariant } from "@haohaohow/lib/invariant";

interface WordDatum {
  text: string;
  mnemonic?: string;
  names: string | string[];
  pronunciations?: string[];
  characters?: string[];
}

export interface Word {
  text: string;
  mnemonic?: string;
  name: string;
  nameAlts?: string[];
  pronunciations?: string[];
  characters?: string[];
}

const wordData: WordDatum[] = [
  { text: `一`, names: [`one`], characters: [`一`] },
  { text: `丨`, names: [`line`], characters: [`丨`] },
  { text: `丶`, names: [`dot`], characters: [`丶`] },
  { text: `丿`, names: [`slash`], characters: [`丿`] },
  { text: `乙`, names: [`second`], characters: [`乙`] },
  { text: `亅`, names: [`hook`], characters: [`亅`] },
  { text: `二`, names: [`two`], characters: [`二`] },
  { text: `亠`, names: [`lid`], characters: [`亠`] },
  { text: `人`, names: [`man`], characters: [`人`] },
  { text: `儿`, names: [`son,legs`], characters: [`儿`] },
  { text: `入`, names: [`enter`], characters: [`入`] },
  { text: `八`, names: [`eight`], characters: [`八`] },
  { text: `冂`, names: [`wide`], characters: [`冂`] },
  { text: `冖`, names: [`cloth cover`], characters: [`冖`] },
  { text: `冫`, names: [`ice`], characters: [`冫`] },
  { text: `几`, names: [`table`], characters: [`几`] },
  { text: `凵`, names: [`receptacle`], characters: [`凵`] },
  { text: `刀`, names: [`knife`], characters: [`刀`] },
  { text: `力`, names: [`power`], characters: [`力`] },
  { text: `勹`, names: [`wrap`], characters: [`勹`] },
  { text: `匕`, names: [`spoon`], characters: [`匕`] },
  { text: `匚`, names: [`box`], characters: [`匚`] },
  { text: `匸`, names: [`hiding enclosure`], characters: [`匸`] },
  { text: `十`, names: [`ten`], characters: [`十`] },
  { text: `卜`, names: [`divination`], characters: [`卜`] },
  { text: `卩`, names: [`seal (device)`], characters: [`卩`] },
  { text: `厂`, names: [`cliff`], characters: [`厂`] },
  { text: `厶`, names: [`private`], characters: [`厶`] },
  { text: `又`, names: [`again`], characters: [`又`] },
  { text: `口`, names: [`mouth`], characters: [`口`] },
  { text: `囗`, names: [`enclosure`], characters: [`囗`] },
  { text: `土`, names: [`earth`], characters: [`土`] },
  { text: `士`, names: [`scholar`], characters: [`士`] },
  { text: `夂`, names: [`go`], characters: [`夂`] },
  { text: `夊`, names: [`go slowly`], characters: [`夊`] },
  { text: `夕`, names: [`evening`], characters: [`夕`] },
  { text: `大`, names: [`big`], characters: [`大`] },
  { text: `女`, names: [`woman`], characters: [`女`] },
  { text: `子`, names: [`child`], characters: [`子`] },
  { text: `宀`, names: [`roof`], characters: [`宀`] },
  { text: `寸`, names: [`inch`], characters: [`寸`] },
  { text: `小`, names: [`small`], characters: [`小`] },
  { text: `尢`, names: [`lame`], characters: [`尢`] },
  { text: `尸`, names: [`corpse`], characters: [`尸`] },
  { text: `屮`, names: [`sprout`], characters: [`屮`] },
  { text: `山`, names: [`mountain`], characters: [`山`] },
  { text: `巛`, names: [`river`], characters: [`巛`] },
  { text: `工`, names: [`work`], characters: [`工`] },
  { text: `己`, names: [`oneself`], characters: [`己`] },
  { text: `巾`, names: [`turban`], characters: [`巾`] },
  { text: `干`, names: [`dry`], characters: [`干`] },
  { text: `幺`, names: [`short thread`], characters: [`幺`] },
  { text: `广`, names: [`dotted cliff`], characters: [`广`] },
  { text: `廴`, names: [`long stride`], characters: [`廴`] },
  { text: `廾`, names: [`arch`], characters: [`廾`] },
  { text: `弋`, names: [`shoot`], characters: [`弋`] },
  { text: `弓`, names: [`bow`], characters: [`弓`] },
  { text: `彐`, names: [`snout`], characters: [`彐`] },
  { text: `彡`, names: [`bristle`], characters: [`彡`] },
  { text: `彳`, names: [`step`], characters: [`彳`] },
  { text: `心`, names: [`heart`], characters: [`心`] },
  { text: `戈`, names: [`halberd`], characters: [`戈`] },
  { text: `戶`, names: [`door`], characters: [`戶`] },
  { text: `手`, names: [`hand`], pronunciations: [`shǒu`], characters: [`手`] },
  { text: `支`, names: [`branch`], characters: [`支`] },
  { text: `攴`, names: [`rap, tap`], characters: [`攴`] },
  { text: `文`, names: [`script`], characters: [`文`] },
  { text: `斗`, names: [`dipper`], characters: [`斗`] },
  { text: `斤`, names: [`axe`], characters: [`斤`] },
  { text: `方`, names: [`square`], characters: [`方`] },
  { text: `无`, names: [`not`], characters: [`无`] },
  { text: `日`, names: [`sun`], characters: [`日`] },
  { text: `曰`, names: [`say`], characters: [`曰`] },
  { text: `月`, names: [`moon`], characters: [`月`] },
  { text: `木`, names: [`tree`], characters: [`木`] },
  { text: `欠`, names: [`lack`], characters: [`欠`] },
  { text: `止`, names: [`stop`], characters: [`止`] },
  { text: `歹`, names: [`death`], characters: [`歹`] },
  { text: `殳`, names: [`weapon`], characters: [`殳`] },
  { text: `毋`, names: [`do not`], characters: [`毋`] },
  { text: `比`, names: [`compare`], characters: [`比`] },
  { text: `毛`, names: [`fur`], characters: [`毛`] },
  { text: `氏`, names: [`clan`], characters: [`氏`] },
  { text: `气`, names: [`steam`], characters: [`气`] },
  { text: `水`, names: [`water`], characters: [`水`] },
  { text: `火`, names: [`fire`], characters: [`火`] },
  { text: `爪`, names: [`claw`], characters: [`爪`] },
  { text: `父`, names: [`father`], characters: [`父`] },
  { text: `爻`, names: [`Trigrams`], characters: [`爻`] },
  { text: `爿`, names: [`split wood`], characters: [`爿`] },
  { text: `片`, names: [`slice`], characters: [`片`] },
  { text: `牙`, names: [`fang`], characters: [`牙`] },
  { text: `牛`, names: [`cow`], characters: [`牛`] },
  { text: `犬`, names: [`dog`], characters: [`犬`] },
  { text: `玄`, names: [`profound`], characters: [`玄`] },
  { text: `玉`, names: [`jade`], characters: [`玉`] },
  { text: `瓜`, names: [`melon`], characters: [`瓜`] },
  { text: `瓦`, names: [`tile`], characters: [`瓦`] },
  { text: `甘`, names: [`sweet`], characters: [`甘`] },
  { text: `生`, names: [`life`], characters: [`生`] },
  { text: `用`, names: [`use`], characters: [`用`] },
  { text: `田`, names: [`field`], characters: [`田`] },
  { text: `疋`, names: [`bolt of cloth`], characters: [`疋`] },
  { text: `疒`, names: [`sickness`], characters: [`疒`] },
  { text: `癶`, names: [`footsteps`], characters: [`癶`] },
  { text: `白`, names: [`white`], characters: [`白`] },
  { text: `皮`, names: [`skin`], characters: [`皮`] },
  { text: `皿`, names: [`dish`], characters: [`皿`] },
  { text: `目`, names: [`eye`], characters: [`目`] },
  { text: `矛`, names: [`spear`], characters: [`矛`] },
  { text: `矢`, names: [`arrow`], characters: [`矢`] },
  { text: `石`, names: [`stone`], characters: [`石`] },
  { text: `示`, names: [`spirit`], characters: [`示`] },
  { text: `禸`, names: [`track`], characters: [`禸`] },
  { text: `禾`, names: [`grain`], characters: [`禾`] },
  { text: `穴`, names: [`cave`], characters: [`穴`] },
  { text: `立`, names: [`stand`], characters: [`立`] },
  { text: `竹`, names: [`bamboo`], characters: [`竹`] },
  { text: `米`, names: [`rice`], characters: [`米`] },
  { text: `糸`, names: [`silk`], characters: [`糸`] },
  { text: `缶`, names: [`jar`], characters: [`缶`] },
  { text: `网`, names: [`net`], characters: [`网`] },
  { text: `羊`, names: [`sheep`], characters: [`羊`] },
  { text: `羽`, names: [`feather`], characters: [`羽`] },
  { text: `老`, names: [`old`], characters: [`老`] },
  { text: `而`, names: [`and`], characters: [`而`] },
  { text: `耒`, names: [`plough`], characters: [`耒`] },
  { text: `耳`, names: [`ear`], characters: [`耳`] },
  { text: `聿`, names: [`brush`], characters: [`聿`] },
  { text: `肉`, names: [`meat`], characters: [`肉`] },
  { text: `臣`, names: [`minister`], characters: [`臣`] },
  { text: `自`, names: [`self`], characters: [`自`] },
  { text: `至`, names: [`arrive`], characters: [`至`] },
  { text: `臼`, names: [`mortar`], characters: [`臼`] },
  { text: `舌`, names: [`tongue`], characters: [`舌`] },
  { text: `舛`, names: [`oppose`], characters: [`舛`] },
  { text: `舟`, names: [`boat`], characters: [`舟`] },
  { text: `艮`, names: [`stopping`], characters: [`艮`] },
  { text: `色`, names: [`colour`], characters: [`色`] },
  { text: `艸`, names: [`grass`], characters: [`艸`] },
  { text: `虍`, names: [`tiger`], characters: [`虍`] },
  { text: `虫`, names: [`insect`], characters: [`虫`] },
  { text: `血`, names: [`blood`], characters: [`血`] },
  { text: `行`, names: [`walk enclosure`], characters: [`行`] },
  { text: `衣`, names: [`clothes`], characters: [`衣`] },
  { text: `襾`, names: [`cover`], characters: [`襾`] },
  { text: `見`, names: [`see`], characters: [`見`] },
  { text: `角`, names: [`horn`], characters: [`角`] },
  { text: `言`, names: [`speech`], characters: [`言`] },
  { text: `谷`, names: [`valley`], characters: [`谷`] },
  { text: `豆`, names: [`bean`], characters: [`豆`] },
  { text: `豕`, names: [`pig`], characters: [`豕`] },
  { text: `豸`, names: [`badger`], characters: [`豸`] },
  { text: `貝`, names: [`shell`], characters: [`貝`] },
  { text: `赤`, names: [`red`], characters: [`赤`] },
  { text: `走`, names: [`run`], characters: [`走`] },
  { text: `足`, names: [`foot`], characters: [`足`] },
  { text: `身`, names: [`body`], characters: [`身`] },
  { text: `車`, names: [`cart`], characters: [`車`] },
  { text: `辛`, names: [`bitter`], characters: [`辛`] },
  { text: `辰`, names: [`morning`], characters: [`辰`] },
  { text: `辵`, names: [`walk`], characters: [`辵`] },
  { text: `邑`, names: [`city`], characters: [`邑`] },
  { text: `酉`, names: [`wine`], characters: [`酉`] },
  { text: `釆`, names: [`distinguish`], characters: [`釆`] },
  { text: `里`, names: [`village`], characters: [`里`] },
  { text: `金`, names: [`gold`], characters: [`金`] },
  { text: `長`, names: [`long`], characters: [`長`] },
  { text: `門`, names: [`gate`], characters: [`門`] },
  { text: `阜`, names: [`mound`], characters: [`阜`] },
  { text: `隶`, names: [`slave`], characters: [`隶`] },
  { text: `隹`, names: [`short-tailed bird`], characters: [`隹`] },
  { text: `雨`, names: [`rain`], characters: [`雨`] },
  { text: `靑`, names: [`blue`], characters: [`靑`] },
  { text: `非`, names: [`wrong`], characters: [`非`] },
  { text: `面`, names: [`face`], characters: [`面`] },
  { text: `革`, names: [`leather`], characters: [`革`] },
  { text: `韋`, names: [`tanned leather`], characters: [`韋`] },
  { text: `韭`, names: [`leek`], characters: [`韭`] },
  { text: `音`, names: [`sound`], characters: [`音`] },
  { text: `頁`, names: [`leaf`], characters: [`頁`] },
  { text: `風`, names: [`wind`], characters: [`風`] },
  { text: `飛`, names: [`fly`], characters: [`飛`] },
  { text: `食`, names: [`eat`], characters: [`食`] },
  { text: `首`, names: [`head`], characters: [`首`] },
  { text: `香`, names: [`fragrant`], characters: [`香`] },
  { text: `馬`, names: [`horse`], characters: [`馬`] },
  { text: `骨`, names: [`bone`], characters: [`骨`] },
  { text: `高`, names: [`tall`], characters: [`高`] },
  { text: `髟`, names: [`hair`], characters: [`髟`] },
  { text: `鬥`, names: [`fight`], characters: [`鬥`] },
  { text: `鬯`, names: [`sacrificial wine`], characters: [`鬯`] },
  { text: `鬲`, names: [`cauldron`], characters: [`鬲`] },
  { text: `鬼`, names: [`ghost`], characters: [`鬼`] },
  { text: `魚`, names: [`fish`], characters: [`魚`] },
  { text: `鳥`, names: [`bird`], characters: [`鳥`] },
  { text: `鹵`, names: [`salt`], characters: [`鹵`] },
  { text: `鹿`, names: [`deer`], characters: [`鹿`] },
  { text: `麥`, names: [`wheat`], characters: [`麥`] },
  { text: `麻`, names: [`hemp`], characters: [`麻`] },
  { text: `黃`, names: [`yellow`], characters: [`黃`] },
  { text: `黍`, names: [`millet`], characters: [`黍`] },
  { text: `黑`, names: [`black`], characters: [`黑`] },
  { text: `黹`, names: [`embroidery`], characters: [`黹`] },
  { text: `黽`, names: [`frog`], characters: [`黽`] },
  { text: `鼎`, names: [`tripod`], characters: [`鼎`] },
  { text: `鼓`, names: [`drum`], characters: [`鼓`] },
  { text: `鼠`, names: [`rat`], characters: [`鼠`] },
  { text: `鼻`, names: [`nose`], characters: [`鼻`] },
  { text: `齊`, names: [`even`], characters: [`齊`] },
  { text: `齒`, names: [`tooth`], characters: [`齒`] },
  { text: `龍`, names: [`dragon`], characters: [`龍`] },
  { text: `龜`, names: [`turtle`], characters: [`龜`] },
  { text: `龠`, names: [`flute`], characters: [`龠`] },
];

// Transform data into an easier shape to work with.
const words = wordData.map(
  ({ text: char, names, pronunciations, mnemonic, characters: radicals }) => {
    const [name, ...altNames] = names;
    invariant(name !== undefined, `expected at least one name`);

    const word: Word = {
      text: char,
      name,
    };

    if (altNames.length > 0) {
      word.nameAlts = altNames;
    }

    if (pronunciations !== undefined && pronunciations.length > 0) {
      word.pronunciations = pronunciations;
    }

    if (mnemonic !== undefined) {
      word.mnemonic = mnemonic;
    }

    if (radicals !== undefined && radicals.length > 0) {
      word.characters = radicals;
    }

    return word;
  },
);

/**
 * Lookup by the word's characters.
 */
export const wordLookupByHanzi: ReadonlyMap<string, Word> = new Map(
  words.map((w) => [w.text, w]),
);
