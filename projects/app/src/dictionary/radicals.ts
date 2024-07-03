import { invariant } from "@haohaohow/lib/invariant";

interface RadicalDatum {
  chars: string | string[];
  mnemonic?: string;
  names: string | string[];
  pronunciations?: string[];
}

export interface Radical {
  char: string;
  charAlts?: string[];
  mnemonic?: string;
  name: string;
  nameAlts?: string[];
  pronunciations?: string[];
}

const radicalData: RadicalDatum[] = [
  { chars: `一`, names: [`one`] },
  { chars: `丨`, names: [`line`] },
  { chars: `丶`, names: [`dot`] },
  { chars: [`丿`, `乀`, `⺄`], names: [`slash`] },
  { chars: [`乙`, `乚`, `乛`], names: [`second`] },
  { chars: `亅`, names: [`hook`] },
  { chars: `二`, names: [`two`] },
  { chars: `亠`, names: [`lid`] },
  { chars: [`人`, `亻`], names: [`man`] },
  { chars: `儿`, names: [`son,legs`] },
  { chars: `入`, names: [`enter`] },
  { chars: [`八`, `丷`], names: [`eight`] },
  { chars: `冂`, names: [`wide`] },
  { chars: `冖`, names: [`cloth cover`] },
  { chars: `冫`, names: [`ice`] },
  { chars: `几`, names: [`table`] },
  { chars: `凵`, names: [`receptacle`] },
  { chars: [`刀`, `刂`, `⺈`], names: [`knife`] },
  { chars: `力`, names: [`power`] },
  { chars: `勹`, names: [`wrap`] },
  { chars: `匕`, names: [`spoon`] },
  { chars: `匚`, names: [`box`] },
  { chars: `匸`, names: [`hiding enclosure`] },
  { chars: `十`, names: [`ten`] },
  { chars: `卜`, names: [`divination`] },
  { chars: [`卩`, `㔾`], names: [`seal (device)`] },
  { chars: `厂`, names: [`cliff`] },
  { chars: `厶`, names: [`private`] },
  { chars: `又`, names: [`again`] },
  { chars: `口`, names: [`mouth`] },
  { chars: `囗`, names: [`enclosure`] },
  { chars: `土`, names: [`earth`] },
  { chars: `士`, names: [`scholar`] },
  { chars: `夂`, names: [`go`] },
  { chars: `夊`, names: [`go slowly`] },
  { chars: `夕`, names: [`evening`] },
  { chars: `大`, names: [`big`] },
  { chars: `女`, names: [`woman`] },
  { chars: `子`, names: [`child`] },
  { chars: `宀`, names: [`roof`] },
  { chars: `寸`, names: [`inch`] },
  { chars: [`小`, `⺌`, `⺍`], names: [`small`] },
  { chars: [`尢`, `尣`], names: [`lame`] },
  { chars: `尸`, names: [`corpse`] },
  { chars: `屮`, names: [`sprout`] },
  { chars: `山`, names: [`mountain`] },
  { chars: [`巛`, `川`], names: [`river`] },
  { chars: `工`, names: [`work`] },
  { chars: `己`, names: [`oneself`] },
  { chars: `巾`, names: [`turban`] },
  { chars: `干`, names: [`dry`] },
  { chars: [`幺`, `么`], names: [`short thread`] },
  { chars: `广`, names: [`dotted cliff`] },
  { chars: `廴`, names: [`long stride`] },
  { chars: `廾`, names: [`arch`] },
  { chars: `弋`, names: [`shoot`] },
  { chars: `弓`, names: [`bow`] },
  { chars: [`彐`, `彑`], names: [`snout`] },
  { chars: `彡`, names: [`bristle`] },
  { chars: `彳`, names: [`step`] },
  { chars: [`心`, `忄`, `⺗`], names: [`heart`] },
  { chars: `戈`, names: [`halberd`] },
  { chars: [`戶`, `户`, `戸`], names: [`door`] },
  { chars: [`手`, `扌`, `龵`], names: [`hand`], pronunciations: [`shǒu`] },
  { chars: `支`, names: [`branch`] },
  { chars: [`攴`, `攵`], names: [`rap, tap`] },
  { chars: `文`, names: [`script`] },
  { chars: `斗`, names: [`dipper`] },
  { chars: `斤`, names: [`axe`] },
  { chars: `方`, names: [`square`] },
  { chars: [`无`, `旡`], names: [`not`] },
  { chars: `日`, names: [`sun`] },
  { chars: `曰`, names: [`say`] },
  { chars: `月`, names: [`moon`] },
  { chars: `木`, names: [`tree`] },
  { chars: `欠`, names: [`lack`] },
  { chars: `止`, names: [`stop`] },
  { chars: [`歹`, `歺`], names: [`death`] },
  { chars: `殳`, names: [`weapon`] },
  { chars: [`毋`, `母`], names: [`do not`] },
  { chars: `比`, names: [`compare`] },
  { chars: `毛`, names: [`fur`] },
  { chars: `氏`, names: [`clan`] },
  { chars: `气`, names: [`steam`] },
  { chars: [`水`, `氵`, `氺`], names: [`water`] },
  { chars: [`火`, `灬`], names: [`fire`] },
  { chars: [`爪`, `爫`], names: [`claw`] },
  { chars: `父`, names: [`father`] },
  { chars: `爻`, names: [`Trigrams`] },
  { chars: [`爿`, `丬`], names: [`split wood`] },
  { chars: `片`, names: [`slice`] },
  { chars: `牙`, names: [`fang`] },
  { chars: [`牛`, `牜`, `⺧`], names: [`cow`] },
  { chars: [`犬`, `犭`], names: [`dog`] },
  { chars: `玄`, names: [`profound`] },
  { chars: [`玉`, `王`, `玊`], names: [`jade`] },
  { chars: `瓜`, names: [`melon`] },
  { chars: `瓦`, names: [`tile`] },
  { chars: `甘`, names: [`sweet`] },
  { chars: `生`, names: [`life`] },
  { chars: `用`, names: [`use`] },
  { chars: `田`, names: [`field`] },
  { chars: [`疋`, `⺪`], names: [`bolt of cloth`] },
  { chars: `疒`, names: [`sickness`] },
  { chars: `癶`, names: [`footsteps`] },
  { chars: `白`, names: [`white`] },
  { chars: `皮`, names: [`skin`] },
  { chars: `皿`, names: [`dish`] },
  { chars: [`目`, `⺫`], names: [`eye`] },
  { chars: `矛`, names: [`spear`] },
  { chars: `矢`, names: [`arrow`] },
  { chars: `石`, names: [`stone`] },
  { chars: [`示`, `礻`], names: [`spirit`] },
  { chars: `禸`, names: [`track`] },
  { chars: `禾`, names: [`grain`] },
  { chars: `穴`, names: [`cave`] },
  { chars: `立`, names: [`stand`] },
  { chars: [`竹`, `⺮`], names: [`bamboo`] },
  { chars: `米`, names: [`rice`] },
  { chars: [`糸`, `糹`], names: [`silk`] },
  { chars: `缶`, names: [`jar`] },
  { chars: [`网`, `罓`, `⺳`], names: [`net`] },
  { chars: [`羊`, `⺶`, `⺷`], names: [`sheep`] },
  { chars: `羽`, names: [`feather`] },
  { chars: [`老`, `耂`], names: [`old`] },
  { chars: `而`, names: [`and`] },
  { chars: `耒`, names: [`plough`] },
  { chars: `耳`, names: [`ear`] },
  { chars: [`聿`, `⺺`, `⺻`], names: [`brush`] },
  { chars: [`肉`, `⺼`], names: [`meat`] },
  { chars: `臣`, names: [`minister`] },
  { chars: `自`, names: [`self`] },
  { chars: `至`, names: [`arrive`] },
  { chars: `臼`, names: [`mortar`] },
  { chars: `舌`, names: [`tongue`] },
  { chars: `舛`, names: [`oppose`] },
  { chars: `舟`, names: [`boat`] },
  { chars: `艮`, names: [`stopping`] },
  { chars: `色`, names: [`colour`] },
  { chars: [`艸`, `⺿`], names: [`grass`] },
  { chars: `虍`, names: [`tiger`] },
  { chars: `虫`, names: [`insect`] },
  { chars: `血`, names: [`blood`] },
  { chars: `行`, names: [`walk enclosure`] },
  { chars: [`衣`, `⻂`], names: [`clothes`] },
  { chars: [`襾`, `西`, `覀`], names: [`cover`] },
  { chars: `見`, names: [`see`] },
  { chars: [`角`, `⻇`], names: [`horn`] },
  { chars: [`言`, `訁`], names: [`speech`] },
  { chars: `谷`, names: [`valley`] },
  { chars: `豆`, names: [`bean`] },
  { chars: `豕`, names: [`pig`] },
  { chars: `豸`, names: [`badger`] },
  { chars: `貝`, names: [`shell`] },
  { chars: `赤`, names: [`red`] },
  { chars: `走`, names: [`run`] },
  { chars: [`足`, `⻊`], names: [`foot`] },
  { chars: `身`, names: [`body`] },
  { chars: `車`, names: [`cart`] },
  { chars: `辛`, names: [`bitter`] },
  { chars: `辰`, names: [`morning`] },
  { chars: [`辵`, `⻍`, `⻎`], names: [`walk`] },
  { chars: [`邑`, `⻏`], names: [`city`] },
  { chars: `酉`, names: [`wine`] },
  { chars: `釆`, names: [`distinguish`] },
  { chars: `里`, names: [`village`] },
  { chars: [`金`, `釒`], names: [`gold`] },
  { chars: [`長`, `镸`], names: [`long`] },
  { chars: `門`, names: [`gate`] },
  { chars: [`阜`, `⻖`], names: [`mound`] },
  { chars: `隶`, names: [`slave`] },
  { chars: `隹`, names: [`short-tailed bird`] },
  { chars: `雨`, names: [`rain`] },
  { chars: [`靑`, `青`], names: [`blue`] },
  { chars: `非`, names: [`wrong`] },
  { chars: [`面`, `靣`], names: [`face`] },
  { chars: `革`, names: [`leather`] },
  { chars: `韋`, names: [`tanned leather`] },
  { chars: `韭`, names: [`leek`] },
  { chars: `音`, names: [`sound`] },
  { chars: `頁`, names: [`leaf`] },
  { chars: `風`, names: [`wind`] },
  { chars: `飛`, names: [`fly`] },
  { chars: [`食`, `飠`], names: [`eat`] },
  { chars: `首`, names: [`head`] },
  { chars: `香`, names: [`fragrant`] },
  { chars: `馬`, names: [`horse`] },
  { chars: `骨`, names: [`bone`] },
  { chars: [`高`, `髙`], names: [`tall`] },
  { chars: `髟`, names: [`hair`] },
  { chars: `鬥`, names: [`fight`] },
  { chars: `鬯`, names: [`sacrificial wine`] },
  { chars: `鬲`, names: [`cauldron`] },
  { chars: `鬼`, names: [`ghost`] },
  { chars: `魚`, names: [`fish`] },
  { chars: `鳥`, names: [`bird`] },
  { chars: `鹵`, names: [`salt`] },
  { chars: `鹿`, names: [`deer`] },
  { chars: `麥`, names: [`wheat`] },
  { chars: `麻`, names: [`hemp`] },
  { chars: `黃`, names: [`yellow`] },
  { chars: `黍`, names: [`millet`] },
  { chars: `黑`, names: [`black`] },
  { chars: `黹`, names: [`embroidery`] },
  { chars: `黽`, names: [`frog`] },
  { chars: `鼎`, names: [`tripod`] },
  { chars: `鼓`, names: [`drum`] },
  { chars: `鼠`, names: [`rat`] },
  { chars: `鼻`, names: [`nose`] },
  { chars: [`齊`, `斉`], names: [`even`] },
  { chars: `齒`, names: [`tooth`] },
  { chars: `龍`, names: [`dragon`] },
  { chars: `龜`, names: [`turtle`] },
  { chars: `龠`, names: [`flute`] },
];

// Transform data into an easier shape to work with.
const radicals = radicalData.map(
  ({ chars, names, pronunciations, mnemonic }) => {
    const [char, ...charAlts] = chars;
    invariant(char !== undefined, `expected at least one character`);

    const [name, ...nameAlts] = names;
    invariant(name !== undefined, `expected at least one name`);

    const radical: Radical = {
      char,
      name,
    };

    if (charAlts.length > 0) {
      radical.charAlts = charAlts;
    }

    if (nameAlts.length > 0) {
      radical.nameAlts = nameAlts;
    }

    if (pronunciations !== undefined && pronunciations.length > 0) {
      radical.pronunciations = pronunciations;
    }

    if (mnemonic !== undefined) {
      radical.mnemonic = mnemonic;
    }

    return radical;
  },
);

/**
 * Lookup by primary or alternative character.
 */
export const radicalLookupByHanzi: ReadonlyMap<string, Radical> = new Map(
  radicals.flatMap((r) => [r.char].concat(r.charAlts ?? []).map((c) => [c, r])),
);
