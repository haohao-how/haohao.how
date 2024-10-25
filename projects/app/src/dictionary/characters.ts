import { invariant } from "@haohaohow/lib/invariant";

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
  {
    char: `一`,
    names: [`one`],
    radicals: [`一`],
    mnemonic: `Imagine a single horizontal line representing the number one, simple and straight.`,
  },
  {
    char: `丨`,
    names: [`line`],
    radicals: [`丨`],
    mnemonic: `Visualize a vertical line standing upright like a pole.`,
  },
  {
    char: `丶`,
    names: [`dot`],
    radicals: [`丶`],
    mnemonic: `A small dot, like a drop of water or a speck of dust.`,
  },
  {
    char: `丿`,
    names: [`slash`],
    radicals: [`丿`],
    mnemonic: `Think of this as a sweeping stroke, like a slash across the sky.`,
  },
  {
    char: `乙`,
    names: [`second`],
    radicals: [`乙`],
    mnemonic: `Picture this as a curved hook, similar to the tail of a fish.`,
  },
  {
    char: `亅`,
    names: [`hook`],
    radicals: [`亅`],
    mnemonic: `A hook extending from a vertical line, like the bottom of a fishing hook.`,
  },
  {
    char: `二`,
    names: [`two`],
    radicals: [`二`],
    mnemonic: `Two horizontal lines stacked like layers of a cake.`,
  },
  {
    char: `亠`,
    names: [`lid`],
    radicals: [`亠`],
    mnemonic: `A top hat with a brim, covering the head.`,
  },
  {
    char: `人`,
    names: [`man`],
    radicals: [`人`],
    mnemonic: `A person standing upright, legs slightly apart.`,
  },
  {
    char: `儿`,
    names: [`son,legs`],
    radicals: [`儿`],
    mnemonic: `Picture legs walking or a child toddling.`,
  },
  {
    char: `入`,
    names: [`enter`],
    radicals: [`入`],
    mnemonic: `Someone stepping into a doorway, or an arrow pointing inward.`,
  },
  {
    char: `八`,
    names: [`eight`],
    radicals: [`八`],
    mnemonic: `Think of this as two lines diverging, representing something splitting in two.`,
  },
  {
    char: `冂`,
    names: [`wide`],
    radicals: [`冂`],
    mnemonic: `A wide open mouth or a window frame without glass.`,
  },
  {
    char: `冖`,
    names: [`cloth cover`],
    radicals: [`冖`],
    mnemonic: `A roof or a cover placed over something.`,
  },
  {
    char: `冫`,
    names: [`ice`],
    radicals: [`冫`],
    mnemonic: `Two small icicles hanging down, symbolizing coldness.`,
  },
  {
    char: `几`,
    names: [`table`],
    radicals: [`几`],
    mnemonic: `A small table or a person sitting on the floor with knees bent.`,
  },
  {
    char: `凵`,
    names: [`receptacle`],
    radicals: [`凵`],
    mnemonic: `A receptacle or a box with an open top, ready to be filled.`,
  },
  {
    char: `刀`,
    names: [`knife`],
    radicals: [`刀`],
    mnemonic: `The blade of a knife or a dagger.`,
  },
  {
    char: `力`,
    names: [`power`],
    radicals: [`力`],
    mnemonic: `A muscular arm flexing, showing strength.`,
  },
  {
    char: `勹`,
    names: [`wrap`],
    radicals: [`勹`],
    mnemonic: `An arm wrapping around something, holding it close.`,
  },
  {
    char: `匕`,
    names: [`spoon`],
    radicals: [`匕`],
    mnemonic: `A spoon or a small knife with a handle.`,
  },
  {
    char: `匚`,
    names: [`box`],
    radicals: [`匚`],
    mnemonic: `A box or chest, half-open, ready to store something.`,
  },
  {
    char: `匸`,
    names: [`hiding enclosure`],
    radicals: [`匸`],
    mnemonic: `A secret hiding place or a container hidden behind a wall.`,
  },
  {
    char: `十`,
    names: [`ten`],
    radicals: [`十`],
    mnemonic: `The number ten, resembling a cross.`,
  },
  {
    char: `卜`,
    names: [`divination`],
    radicals: [`卜`],
    mnemonic: `A divining rod or a tool used to predict the future.`,
  },
  {
    char: `卩`,
    names: [`seal (device)`],
    radicals: [`卩`],
    mnemonic: `A seal or stamp used for approval, curling at the edge.`,
  },
  {
    char: `厂`,
    names: [`cliff`],
    radicals: [`厂`],
    mnemonic: `A cliff or overhang, with something hanging beneath it.`,
  },
  {
    char: `厶`,
    names: [`private`],
    radicals: [`厶`],
    mnemonic: `A private enclosure, something secret and hidden.`,
  },
  {
    char: `又`,
    names: [`again`],
    radicals: [`又`],
    mnemonic: `An outstretched hand, ready to grasp something.`,
  },
  {
    char: `口`,
    names: [`mouth`],
    radicals: [`口`],
    mnemonic: `A wide open mouth, ready to speak or eat.`,
  },
  {
    char: `囗`,
    names: [`enclosure`],
    radicals: [`囗`],
    mnemonic: `An enclosure or boundary, like a walled city.`,
  },
  {
    char: `土`,
    names: [`earth`],
    radicals: [`土`],
    mnemonic: `A mound of earth with plants growing, symbolizing land.`,
  },
  {
    char: `士`,
    names: [`scholar`],
    radicals: [`士`],
    mnemonic: `A scholar standing upright, firm and noble.`,
  },
  {
    char: `夂`,
    names: [`go`],
    radicals: [`夂`],
    mnemonic: `A person walking slowly, as if dragging something behind them.`,
  },
  {
    char: `夊`,
    names: [`go slowly`],
    radicals: [`夊`],
    mnemonic: `Someone moving carefully, with legs bent in a slow motion.`,
  },
  {
    char: `夕`,
    names: [`evening`],
    radicals: [`夕`],
    mnemonic: `A crescent moon, representing evening.`,
  },
  {
    char: `大`,
    names: [`big`],
    radicals: [`大`],
    mnemonic: `A person stretching out their arms wide, symbolizing largeness.`,
  },
  {
    char: `女`,
    names: [`woman`],
    radicals: [`女`],
    mnemonic: `A woman bowing gracefully, with crossed legs.`,
  },
  {
    char: `子`,
    names: [`child`],
    radicals: [`子`],
    mnemonic: `A child, small and dependent, wrapped in a blanket.`,
  },
  {
    char: `宀`,
    names: [`roof`],
    radicals: [`宀`],
    mnemonic: `A roof protecting those inside, a safe shelter.`,
  },
  {
    char: `寸`,
    names: [`inch`],
    radicals: [`寸`],
    mnemonic: `A thumb held up, measuring a small distance.`,
  },
  {
    char: `小`,
    names: [`small`],
    radicals: [`小`],
    mnemonic: `Small particles or seeds scattering, indicating something tiny.`,
  },
  {
    char: `尢`,
    names: [`lame`],
    radicals: [`尢`],
    mnemonic: `A person with a bent leg, walking with a limp or cane.`,
  },
  {
    char: `尸`,
    names: [`corpse`],
    radicals: [`尸`],
    mnemonic: `A person reclining, as if lying down or resting.`,
  },
  {
    char: `屮`,
    names: [`sprout`],
    radicals: [`屮`],
    mnemonic: `A sprout emerging from the ground, reaching upwards.`,
  },
  {
    char: `山`,
    names: [`mountain`],
    radicals: [`山`],
    mnemonic: `A towering mountain peak, strong and unmoving.`,
  },
  {
    char: `巛`,
    names: [`river`],
    radicals: [`巛`],
    mnemonic: `Flowing water, winding through the land like a river.`,
  },
  {
    char: `工`,
    names: [`work`],
    radicals: [`工`],
    mnemonic: `A carpenter’s square, symbolizing craftsmanship and labor.`,
  },
  {
    char: `己`,
    names: [`oneself`],
    radicals: [`己`],
    mnemonic: `A snake coiling, its body looping back on itself.`,
  },
  {
    char: `巾`,
    names: [`turban`],
    radicals: [`巾`],
    mnemonic: `A cloth or towel hanging, ready to be used.`,
  },
  {
    char: `干`,
    names: [`dry`],
    radicals: [`干`],
    mnemonic: `A dried-up tree branch, standing bare.`,
  },
  {
    char: `幺`,
    names: [`short thread`],
    radicals: [`幺`],
    mnemonic: `A thin thread, winding and fragile.`,
  },
  {
    char: `广`,
    names: [`dotted cliff`],
    radicals: [`广`],
    mnemonic: `A slanted roof of a small hut, offering shelter.`,
  },
  {
    char: `廴`,
    names: [`long stride`],
    radicals: [`廴`],
    mnemonic: `A long stride forward, symbolizing movement or progress.`,
  },
  {
    char: `廾`,
    names: [`arch`],
    radicals: [`廾`],
    mnemonic: `Two hands cupped together, ready to hold something.`,
  },
  {
    char: `弋`,
    names: [`shoot`],
    radicals: [`弋`],
    mnemonic: `A bow with an arrow, ready to shoot.`,
  },
  {
    char: `弓`,
    names: [`bow`],
    radicals: [`弓`],
    mnemonic: `A bow, curved and ready to launch an arrow.`,
  },
  {
    char: `彐`,
    names: [`snout`],
    radicals: [`彐`],
    mnemonic: `A snout or nose, sniffing around.`,
  },
  {
    char: `彡`,
    names: [`bristle`],
    radicals: [`彡`],
    mnemonic: `Three wisps of hair or fur, soft and flowing.`,
  },
  {
    char: `彳`,
    names: [`step`],
    radicals: [`彳`],
    mnemonic: `A person walking beside another, indicating companionship.`,
  },
  {
    char: `心`,
    names: [`heart`],
    radicals: [`心`],
    mnemonic: `Imagine a heart shape, which represents feelings and emotions.`,
  },
  {
    char: `戈`,
    names: [`halberd`],
    radicals: [`戈`],
    mnemonic: `Visualize an ancient weapon, a spear or dagger-axe, with a handle and blade.`,
  },
  {
    char: `戶`,
    names: [`door`],
    radicals: [`戶`],
    mnemonic: `Picture a door with a hinge, slightly ajar, representing an opening or house.`,
  },
  {
    char: `手`,
    names: [`hand`],
    pronunciations: [`shǒu`],
    radicals: [`手`],
    mnemonic: `See an open hand, palm facing forward, ready to grasp or gesture.`,
  },
  {
    char: `支`,
    names: [`branch`],
    radicals: [`支`],
    mnemonic: `Think of a branch extending outwards, supported by a tree trunk.`,
  },
  {
    char: `攴`,
    names: [`rap, tap`],
    radicals: [`攴`],
    mnemonic: `Imagine a hand holding a small rod or stick, about to strike or tap.`,
  },
  {
    char: `文`,
    names: [`script`],
    radicals: [`文`],
    mnemonic: `Visualize a brush or pen making graceful marks, representing writing or literature.`,
  },
  {
    char: `斗`,
    names: [`dipper`],
    radicals: [`斗`],
    mnemonic: `See a ladle used for scooping rice or grains, representing measurement.`,
  },
  {
    char: `斤`,
    names: [`axe`],
    radicals: [`斤`],
    mnemonic: `Picture an axe, with its distinctive sharp blade, ready to chop.`,
  },
  {
    char: `方`,
    names: [`square`],
    radicals: [`方`],
    mnemonic: `Visualize a compass tool used to measure and mark square angles.`,
  },
  {
    char: `无`,
    names: [`not`],
    radicals: [`无`],
    mnemonic: `See an empty space, representing the concept of nothingness or absence.`,
  },
  {
    char: `日`,
    names: [`sun`],
    radicals: [`日`],
    mnemonic: `Imagine the sun shining brightly, round and radiating light.`,
  },
  {
    char: `曰`,
    names: [`say`],
    radicals: [`曰`],
    mnemonic: `Picture a box with a small opening at the top, like the sun speaking or saying something.`,
  },
  {
    char: `月`,
    names: [`moon`],
    radicals: [`月`],
    mnemonic: `Visualize a crescent moon in the night sky, glowing softly.`,
  },
  {
    char: `木`,
    names: [`tree`],
    radicals: [`木`],
    mnemonic: `Imagine a tree trunk with branches, representing wood or a tree.`,
  },
  {
    char: `欠`,
    names: [`lack`],
    radicals: [`欠`],
    mnemonic: `See someone yawning with their mouth open, symbolizing the concept of lack or want.`,
  },
  {
    char: `止`,
    names: [`stop`],
    radicals: [`止`],
    mnemonic: `Picture a foot stopping abruptly, as if halting in place.`,
  },
  {
    char: `歹`,
    names: [`death`],
    radicals: [`歹`],
    mnemonic: `Visualize a fragment of a bone, symbolizing death or decay.`,
  },
  {
    char: `殳`,
    names: [`weapon`],
    radicals: [`殳`],
    mnemonic: `Imagine a hand holding a long weapon, ready to strike or defend.`,
  },
  {
    char: `毋`,
    names: [`do not`],
    radicals: [`毋`],
    mnemonic: `See a hand gesturing 'no' or 'don't,' representing negation or prohibition.`,
  },
  {
    char: `比`,
    names: [`compare`],
    radicals: [`比`],
    mnemonic: `Visualize two people standing side by side, representing comparison or togetherness.`,
  },
  {
    char: `毛`,
    names: [`fur`],
    radicals: [`毛`],
    mnemonic: `Imagine strands of fur or hair flowing softly, symbolizing texture.`,
  },
  {
    char: `氏`,
    names: [`clan`],
    radicals: [`氏`],
    mnemonic: `Picture a family crest or a banner, representing a clan or surname.`,
  },
  {
    char: `气`,
    names: [`steam`],
    radicals: [`气`],
    mnemonic: `Visualize wisps of air or breath rising upward, symbolizing energy or air.`,
  },
  {
    char: `水`,
    names: [`water`],
    radicals: [`水`],
    mnemonic: `Imagine flowing water, like a stream or river, representing fluidity and life.`,
  },
  {
    char: `火`,
    names: [`fire`],
    radicals: [`火`],
    mnemonic: `Picture bright flames rising up, symbolizing fire and heat.`,
  },
  {
    char: `爪`,
    names: [`claw`],
    radicals: [`爪`],
    mnemonic: `See a claw or talon reaching out, ready to grab something.`,
  },
  {
    char: `父`,
    names: [`father`],
    radicals: [`父`],
    mnemonic: `Visualize a father figure, holding a stick, representing authority or guidance.`,
  },
  {
    char: `爻`,
    names: [`Trigrams`],
    radicals: [`爻`],
    mnemonic: `Picture interlocking lines like crossed threads, symbolizing interaction or change.`,
  },
  {
    char: `爿`,
    names: [`split wood`],
    radicals: [`爿`],
    mnemonic: `Imagine a plank of wood cut in half, symbolizing a side or part.`,
  },
  {
    char: `片`,
    names: [`slice`],
    radicals: [`片`],
    mnemonic: `Visualize a thin slice of something, like a piece of wood or a leaf.`,
  },
  {
    char: `牙`,
    names: [`fang`],
    radicals: [`牙`],
    mnemonic: `See a sharp tooth or fang, representing strength or aggression.`,
  },
  {
    char: `牛`,
    names: [`cow`],
    radicals: [`牛`],
    mnemonic: `Imagine a cow, with its horns and large body, representing cattle.`,
  },
  {
    char: `犬`,
    names: [`dog`],
    radicals: [`犬`],
    mnemonic: `Picture a dog barking, symbolizing loyalty or protection.`,
  },
  {
    char: `玄`,
    names: [`profound`],
    radicals: [`玄`],
    mnemonic: `See a dark, mysterious thread stretching into the unknown, symbolizing profound or mystical things.`,
  },
  {
    char: `玉`,
    names: [`jade`],
    radicals: [`玉`],
    mnemonic: `Visualize a precious jade stone, smooth and glimmering, symbolizing wealth and beauty.`,
  },
  {
    char: `瓜`,
    names: [`melon`],
    radicals: [`瓜`],
    mnemonic: `Picture a large, round melon, representing a fruit or vegetable.`,
  },
  {
    char: `瓦`,
    names: [`tile`],
    radicals: [`瓦`],
    mnemonic: `See a curved roof tile made of clay, symbolizing a building material.`,
  },
  {
    char: `甘`,
    names: [`sweet`],
    radicals: [`甘`],
    mnemonic: `Visualize a piece of candy or fruit, representing sweetness or pleasantness.`,
  },
  {
    char: `生`,
    names: [`life`],
    radicals: [`生`],
    mnemonic: `Picture a sprout emerging from the ground, symbolizing life or growth.`,
  },
  {
    char: `用`,
    names: [`use`],
    radicals: [`用`],
    mnemonic: `Imagine a tool being picked up and used, symbolizing utility or function.`,
  },
  {
    char: `田`,
    names: [`field`],
    radicals: [`田`],
    mnemonic: `See a patchwork of rice fields, symbolizing cultivation and farming.`,
  },
  {
    char: `疋`,
    names: [`bolt of cloth`],
    radicals: [`疋`],
    mnemonic: `Visualize a bolt of cloth, rolled up and ready to be cut.`,
  },
  {
    char: `疒`,
    names: [`sickness`],
    radicals: [`疒`],
    mnemonic: `Imagine a person lying in bed, representing illness or affliction.`,
  },
  {
    char: `癶`,
    names: [`footsteps`],
    radicals: [`癶`],
    mnemonic: `Picture two feet stepping up, symbolizing movement or progress.`,
  },
  {
    char: `白`,
    names: [`white`],
    radicals: [`白`],
    mnemonic: `Visualize a clean, blank sheet of paper, symbolizing purity or clarity.`,
  },
  {
    char: `皮`,
    names: [`skin`],
    radicals: [`皮`],
    mnemonic: `Imagine a piece of skin or leather, rough to the touch.`,
  },
  {
    char: `皿`,
    names: [`dish`],
    radicals: [`皿`],
    mnemonic: `Picture a shallow dish or bowl, representing containers or vessels.`,
  },
  {
    char: `目`,
    names: [`eye`],
    radicals: [`目`],
    mnemonic: `Visualize a wide-open eye, observing everything, symbolizing vision or awareness.`,
  },
  {
    char: `矛`,
    names: [`spear`],
    radicals: [`矛`],
    mnemonic: `See a long spear with a pointed tip, ready for battle or defense.`,
  },
  {
    char: `矢`,
    names: [`arrow`],
    radicals: [`矢`],
    mnemonic: `Picture a sharp arrow flying through the air, symbolizing accuracy or speed.`,
  },
  {
    char: `石`,
    names: [`stone`],
    radicals: [`石`],
    mnemonic: `Imagine a solid, heavy stone, symbolizing strength or stability.`,
  },
  {
    char: `示`,
    names: [`spirit`],
    radicals: [`示`],
    mnemonic: `Visualize an altar with offerings, symbolizing worship or demonstration.`,
  },
  {
    char: `禸`,
    names: [`track`],
    radicals: [`禸`],
    mnemonic: `Picture an animal's paw with visible claws, leaving tracks behind.`,
  },
  {
    char: `禾`,
    names: [`grain`],
    radicals: [`禾`],
    mnemonic: `See stalks of grain bending in the wind, symbolizing harvest or abundance.`,
  },
  {
    char: `穴`,
    names: [`cave`],
    radicals: [`穴`],
    mnemonic: `Visualize a small cave or hole, symbolizing a dwelling or hiding place.`,
  },
  {
    char: `立`,
    names: [`stand`],
    radicals: [`立`],
    mnemonic: `Imagine someone standing tall and firm, symbolizing stability or position.`,
  },
  {
    char: `竹`,
    names: [`bamboo`],
    radicals: [`竹`],
    mnemonic: `Picture tall, slender bamboo stalks swaying gently in the breeze.`,
  },
  {
    char: `米`,
    names: [`rice`],
    radicals: [`米`],
    mnemonic: `Visualize grains of rice scattered across a surface, symbolizing food or nourishment.`,
  },
  {
    char: `糸`,
    names: [`silk`],
    radicals: [`糸`],
    mnemonic: `See thin, delicate threads wound together, symbolizing connections or continuity.`,
  },
  {
    char: `缶`,
    names: [`jar`],
    radicals: [`缶`],
    mnemonic: `Picture a ceramic jar used for storage or cooking, symbolizing containment.`,
  },
  {
    char: `网`,
    names: [`net`],
    radicals: [`网`],
    mnemonic: `Imagine a net, with its woven lines ready to catch something.`,
  },
  {
    char: `羊`,
    names: [`sheep`],
    radicals: [`羊`],
    mnemonic: `Picture a sheep, with its fluffy wool, symbolizing gentleness or livelihood.`,
  },
  {
    char: `羽`,
    names: [`feather`],
    radicals: [`羽`],
    mnemonic: `Visualize soft feathers falling from the sky, symbolizing lightness or flight.`,
  },
  {
    char: `老`,
    names: [`old`],
    radicals: [`老`],
    mnemonic: `See an elderly person walking slowly with a cane, symbolizing age or wisdom.`,
  },
  {
    char: `而`,
    names: [`and`],
    radicals: [`而`],
    mnemonic: `Picture a flowing beard or whiskers, symbolizing maturity or transition.`,
  },
  {
    char: `耒`,
    names: [`plough`],
    radicals: [`耒`],
    mnemonic: `Imagine an ancient farming tool, a plow, used for tilling the soil.`,
  },
  {
    char: `耳`,
    names: [`ear`],
    radicals: [`耳`],
    mnemonic: `Visualize an ear, listening closely, symbolizing hearing or attention.`,
  },
  {
    char: `聿`,
    names: [`brush`],
    radicals: [`聿`],
    mnemonic: `Picture a brush used for writing, symbolizing literary or scholarly work.`,
  },
  {
    char: `肉`,
    names: [`meat`],
    radicals: [`肉`],
    mnemonic: `See a piece of meat, symbolizing flesh or sustenance.`,
  },
  {
    char: `臣`,
    names: [`minister`],
    radicals: [`臣`],
    mnemonic: `Visualize a loyal servant bowing before a ruler, symbolizing duty or submission.`,
  },
  {
    char: `自`,
    names: [`self`],
    radicals: [`自`],
    mnemonic: `Picture someone pointing to their nose, symbolizing the concept of self.`,
  },
  {
    char: `至`,
    names: [`arrive`],
    radicals: [`至`],
    mnemonic: `Imagine an arrow reaching its target, symbolizing arrival or achievement.`,
  },
  {
    char: `臼`,
    names: [`mortar`],
    radicals: [`臼`],
    mnemonic: `Picture a mortar used for grinding grains, symbolizing preparation or work.`,
  },
  {
    char: `舌`,
    names: [`tongue`],
    radicals: [`舌`],
    mnemonic: `Visualize a tongue sticking out, symbolizing speech or taste.`,
  },
  {
    char: `舛`,
    names: [`oppose`],
    radicals: [`舛`],
    mnemonic: `Picture two feet walking in opposite directions, symbolizing conflict or opposition.`,
  },
  {
    char: `舟`,
    names: [`boat`],
    radicals: [`舟`],
    mnemonic: `See a small boat floating on the water, symbolizing travel or adventure.`,
  },
  {
    char: `艮`,
    names: [`stopping`],
    radicals: [`艮`],
    mnemonic: `Visualize someone standing still, facing forward, symbolizing firmness or resistance.`,
  },
  {
    char: `色`,
    names: [`colour`],
    radicals: [`色`],
    mnemonic: `Picture a rainbow of vibrant colors, symbolizing diversity or variety.`,
  },
  {
    char: `艸`,
    names: [`grass`],
    radicals: [`艸`],
    mnemonic: `Imagine blades of grass swaying in the wind, symbolizing nature or simplicity.`,
  },
  {
    char: `虍`,
    names: [`tiger`],
    radicals: [`虍`],
    mnemonic: `Picture a fierce tiger with stripes, symbolizing power or ferocity.`,
  },
  {
    char: `虫`,
    names: [`insect`],
    radicals: [`虫`],
    mnemonic: `See a wriggling insect, symbolizing small creatures or persistence.`,
  },
  {
    char: `血`,
    names: [`blood`],
    radicals: [`血`],
    mnemonic: `Visualize a drop of red blood, symbolizing life or vitality.`,
  },
  {
    char: `行`,
    names: [`walk enclosure`],
    radicals: [`行`],
    mnemonic: `Picture a road stretching ahead, symbolizing movement or progress.`,
  },
  {
    char: `衣`,
    names: [`clothes`],
    radicals: [`衣`],
    mnemonic: `Visualize a flowing garment, symbolizing clothing or protection.`,
  },
  {
    char: `襾`,
    names: [`cover`],
    radicals: [`襾`],
    mnemonic: `Picture a closed lid or cover, symbolizing protection or enclosure.`,
  },
  {
    char: `見`,
    names: [`see`],
    radicals: [`見`],
    mnemonic: `See an eye looking out from behind something, symbolizing vision or sight.`,
  },
  {
    char: `角`,
    names: [`horn`],
    radicals: [`角`],
    mnemonic: `Picture an animal's horn, sharp and curved, symbolizing strength or defense.`,
  },
  {
    char: `言`,
    names: [`speech`],
    radicals: [`言`],
    mnemonic: `Visualize speech bubbles with words inside, symbolizing communication.`,
  },
  {
    char: `谷`,
    names: [`valley`],
    radicals: [`谷`],
    mnemonic: `Picture a valley between mountains, symbolizing fertility or shelter.`,
  },
  {
    char: `豆`,
    names: [`bean`],
    radicals: [`豆`],
    mnemonic: `See a small bean sprout emerging from the soil, symbolizing growth or food.`,
  },
  {
    char: `豕`,
    names: [`pig`],
    radicals: [`豕`],
    mnemonic: `Picture a pig with a curly tail, symbolizing livestock or abundance.`,
  },
  {
    char: `豸`,
    names: [`badger`],
    radicals: [`豸`],
    mnemonic: `See a wild animal lurking, symbolizing fierceness or stealth.`,
  },
  {
    char: `貝`,
    names: [`shell`],
    radicals: [`貝`],
    mnemonic: `Visualize a seashell, symbolizing wealth or value (as ancient money).`,
  },
  {
    char: `赤`,
    names: [`red`],
    radicals: [`赤`],
    mnemonic: `Picture the color red, symbolizing fire, passion, or danger.`,
  },
  {
    char: `走`,
    names: [`run`],
    radicals: [`走`],
    mnemonic: `See a person running quickly, symbolizing movement or haste.`,
  },
  {
    char: `足`,
    names: [`foot`],
    radicals: [`足`],
    mnemonic: `Picture a foot stepping forward, symbolizing action or progress.`,
  },
  {
    char: `身`,
    names: [`body`],
    radicals: [`身`],
    mnemonic: `Visualize a human body standing tall, symbolizing self or identity.`,
  },
  {
    char: `車`,
    names: [`cart`],
    radicals: [`車`],
    mnemonic: `Imagine a cart with wheels, symbolizing transportation or movement.`,
  },
  {
    char: `辛`,
    names: [`bitter`],
    radicals: [`辛`],
    mnemonic: `Picture a sharp knife, symbolizing suffering or difficulty.`,
  },
  {
    char: `辰`,
    names: [`morning`],
    radicals: [`辰`],
    mnemonic: `See the outline of a dragon, symbolizing time or the celestial.`,
  },
  {
    char: `辵`,
    names: [`walk`],
    radicals: [`辵`],
    mnemonic: `Picture a road with intermittent breaks, symbolizing paths or journeys.`,
  },
  {
    char: `邑`,
    names: [`city`],
    radicals: [`邑`],
    mnemonic: `See a small town with walls around it, symbolizing community or settlement.`,
  },
  {
    char: `酉`,
    names: [`wine`],
    radicals: [`酉`],
    mnemonic: `Imagine a wine jar filled with liquid, symbolizing alcohol or celebration.`,
  },
  {
    char: `釆`,
    names: [`distinguish`],
    radicals: [`釆`],
    mnemonic: `Picture hands sorting grains, symbolizing selection or separation.`,
  },
  {
    char: `里`,
    names: [`village`],
    radicals: [`里`],
    mnemonic: `See a village surrounded by fields, symbolizing distance or countryside.`,
  },
  {
    char: `金`,
    names: [`gold`],
    radicals: [`金`],
    mnemonic: `Visualize a shiny gold coin, symbolizing wealth or metal.`,
  },
  {
    char: `長`,
    names: [`long`],
    radicals: [`長`],
    mnemonic: `Picture long flowing hair, symbolizing length or longevity.`,
  },
  {
    char: `門`,
    names: [`gate`],
    radicals: [`門`],
    mnemonic: `Imagine a tall gate or doorway, symbolizing passage or entry.`,
  },
  {
    char: `阜`,
    names: [`mound`],
    radicals: [`阜`],
    mnemonic: `Visualize a mound or hill, symbolizing elevation or rise.`,
  },
  {
    char: `隶`,
    names: [`slave`],
    radicals: [`隶`],
    mnemonic: `See a servant carrying a burden, symbolizing subjugation or duty.`,
  },
  {
    char: `隹`,
    names: [`short-tailed bird`],
    radicals: [`隹`],
    mnemonic: `Picture a small bird perched on a branch, symbolizing agility or observation.`,
  },
  {
    char: `雨`,
    names: [`rain`],
    radicals: [`雨`],
    mnemonic: `Visualize raindrops falling from the sky, symbolizing weather or cleansing.`,
  },
  {
    char: `靑`,
    names: [`blue`],
    radicals: [`靑`],
    mnemonic: `Picture a clear blue sky, symbolizing clarity or youth.`,
  },
  {
    char: `非`,
    names: [`wrong`],
    radicals: [`非`],
    mnemonic: `See two wings flapping in opposition, symbolizing contradiction or denial.`,
  },
  {
    char: `面`,
    names: [`face`],
    radicals: [`面`],
    mnemonic: `Visualize a face looking straight ahead, symbolizing identity or appearance.`,
  },
  {
    char: `革`,
    names: [`leather`],
    radicals: [`革`],
    mnemonic: `Picture a strip of leather, symbolizing material or transformation.`,
  },
  {
    char: `韋`,
    names: [`tanned leather`],
    radicals: [`韋`],
    mnemonic: `See a tanned leather hide stretched out, symbolizing toughness or resilience.`,
  },
  {
    char: `韭`,
    names: [`leek`],
    radicals: [`韭`],
    mnemonic: `Visualize a bunch of green onions, symbolizing vegetables or harvest.`,
  },
  {
    char: `音`,
    names: [`sound`],
    radicals: [`音`],
    mnemonic: `Picture a musical note rising from a flute, symbolizing sound or music.`,
  },
  {
    char: `頁`,
    names: [`leaf`],
    radicals: [`頁`],
    mnemonic: `Imagine a single page of a book, symbolizing knowledge or counting.`,
  },
  {
    char: `風`,
    names: [`wind`],
    radicals: [`風`],
    mnemonic: `See wind swirling through trees, symbolizing movement or change.`,
  },
  {
    char: `飛`,
    names: [`fly`],
    radicals: [`飛`],
    mnemonic: `Picture a bird soaring through the sky, symbolizing flight or freedom.`,
  },
  {
    char: `食`,
    names: [`eat`],
    radicals: [`食`],
    mnemonic: `Visualize a bowl of food being served, symbolizing nourishment or sustenance.`,
  },
  {
    char: `首`,
    names: [`head`],
    radicals: [`首`],
    mnemonic: `Picture a head or leader, symbolizing direction or guidance.`,
  },
  {
    char: `香`,
    names: [`fragrant`],
    radicals: [`香`],
    mnemonic: `See a stick of incense burning, symbolizing fragrance or aroma.`,
  },
  {
    char: `馬`,
    names: [`horse`],
    radicals: [`馬`],
    mnemonic: `Picture a galloping horse, symbolizing speed or strength.`,
  },
  {
    char: `骨`,
    names: [`bone`],
    radicals: [`骨`],
    mnemonic: `See a skeleton with visible bones, symbolizing structure or death.`,
  },
  {
    char: `高`,
    names: [`tall`],
    radicals: [`高`],
    mnemonic: `Visualize a tall tower reaching into the sky, symbolizing height or achievement.`,
  },
  {
    char: `髟`,
    names: [`hair`],
    radicals: [`髟`],
    mnemonic: `Imagine long, flowing hair, symbolizing beauty or length.`,
  },
  {
    char: `鬥`,
    names: [`fight`],
    radicals: [`鬥`],
    mnemonic: `Picture two animals locked in combat, symbolizing struggle or competition.`,
  },
  {
    char: `鬯`,
    names: [`sacrificial wine`],
    radicals: [`鬯`],
    mnemonic: `See a ritual vessel with liquid, symbolizing sacrifice or ceremony.`,
  },
  {
    char: `鬲`,
    names: [`cauldron`],
    radicals: [`鬲`],
    mnemonic: `Picture a cooking pot with legs, symbolizing preparation or sustenance.`,
  },
  {
    char: `鬼`,
    names: [`ghost`],
    radicals: [`鬼`],
    mnemonic: `Visualize a ghostly figure with a menacing face, symbolizing spirits or the supernatural.`,
  },
  {
    char: `魚`,
    names: [`fish`],
    radicals: [`魚`],
    mnemonic: `Picture a fish swimming in the water, symbolizing life or fluidity.`,
  },
  {
    char: `鳥`,
    names: [`bird`],
    radicals: [`鳥`],
    mnemonic: `Imagine a bird with wings outstretched, symbolizing flight or freedom.`,
  },
  {
    char: `鹵`,
    names: [`salt`],
    radicals: [`鹵`],
    mnemonic: `See a lump of salt, symbolizing preservation or flavor.`,
  },
  {
    char: `鹿`,
    names: [`deer`],
    radicals: [`鹿`],
    mnemonic: `Picture a deer with antlers, symbolizing grace or speed.`,
  },
  {
    char: `麥`,
    names: [`wheat`],
    radicals: [`麥`],
    mnemonic: `Visualize stalks of wheat swaying in the breeze, symbolizing grain or food.`,
  },
  {
    char: `麻`,
    names: [`hemp`],
    radicals: [`麻`],
    mnemonic: `See a bundle of hemp fibers, symbolizing fabric or strength.`,
  },
  {
    char: `黃`,
    names: [`yellow`],
    radicals: [`黃`],
    mnemonic: `Picture a field of golden crops, symbolizing prosperity or abundance.`,
  },
  {
    char: `黍`,
    names: [`millet`],
    radicals: [`黍`],
    mnemonic: `Visualize a handful of millet, symbolizing agriculture or sustenance.`,
  },
  {
    char: `黑`,
    names: [`black`],
    radicals: [`黑`],
    mnemonic: `See a patch of darkness, symbolizing night or obscurity.`,
  },
  {
    char: `黹`,
    names: [`embroidery`],
    radicals: [`黹`],
    mnemonic: `Picture a needle threading fabric, symbolizing sewing or creation.`,
  },
  {
    char: `黽`,
    names: [`frog`],
    radicals: [`黽`],
    mnemonic: `Imagine a frog leaping forward, symbolizing persistence or adaptability.`,
  },
  {
    char: `鼎`,
    names: [`tripod`],
    radicals: [`鼎`],
    mnemonic: `Visualize a three-legged cauldron used in rituals, symbolizing power or authority.`,
  },
  {
    char: `鼓`,
    names: [`drum`],
    radicals: [`鼓`],
    mnemonic: `Picture a large drum being beaten, symbolizing rhythm or celebration.`,
  },
  {
    char: `鼠`,
    names: [`rat`],
    radicals: [`鼠`],
    mnemonic: `See a small mouse scurrying, symbolizing quickness or adaptability.`,
  },
  {
    char: `鼻`,
    names: [`nose`],
    radicals: [`鼻`],
    mnemonic: `Visualize a nose sniffing the air, symbolizing smell or instinct.`,
  },
  {
    char: `齊`,
    names: [`even`],
    radicals: [`齊`],
    mnemonic: `Picture rows of soldiers marching in formation, symbolizing unity or equality.`,
  },
  {
    char: `齒`,
    names: [`tooth`],
    radicals: [`齒`],
    mnemonic: `See a row of teeth in a wide smile, symbolizing health or speech.`,
  },
  {
    char: `龍`,
    names: [`dragon`],
    radicals: [`龍`],
    mnemonic: `Imagine a mighty dragon soaring through the clouds, symbolizing power or wisdom.`,
  },
  {
    char: `龜`,
    names: [`turtle`],
    radicals: [`龜`],
    mnemonic: `Picture a turtle slowly moving, symbolizing longevity or perseverance.`,
  },
  {
    char: `龠`,
    names: [`flute`],
    radicals: [`龠`],
    mnemonic: `Visualize a flute being played, symbolizing music or harmony.`,
  },
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
