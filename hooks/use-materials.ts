import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";

import type { Item } from "@/backend/schema";
import type { AllMaterialInfo } from "@/data/types";
import { sortStringAsNumber } from "@/lib/utils";
import type { SelectOption } from "@/components/ui/select";

// NOTE: exported atoms are initialized with useHydrateAtom

export const materialNameToInfoAtom = atom<AllMaterialInfo["nameToInfo"]>({});

// ASCENSION/LEVEL
export const levelOptionsAtom = atom<SelectOption<number>[]>([]);
export const levelMatsAtom = atom<Item[][]>([]);

const levelMinAtom = atom<SelectOption<number>>(getMinMatOption());
export const levelMaxAtom = atom<SelectOption<number>>({
  label: "90",
  value: 13,
});

// TALENTS
export const talentOptionsAtom = atom<SelectOption<number>[]>([]);
export const talentMatsAtom = atom<Item[][]>([]);

const attackMinAtom = atom<SelectOption<number>>(getMinMatOption());
export const attackMaxAtom = atom<SelectOption<number>>({
  label: "10",
  value: 9,
});

const skillMinAtom = atom<SelectOption<number>>(getMinMatOption());
export const skillMaxAtom = atom<SelectOption<number>>({
  label: "10",
  value: 9,
});

const burstMinAtom = atom<SelectOption<number>>(getMinMatOption());
export const burstMaxAtom = atom<SelectOption<number>>({
  label: "10",
  value: 9,
});

// MATERIALS
const characterMaterialsAtom = atom((get) =>
  calculateMaterialsRange(
    get(levelMatsAtom),
    get(levelMinAtom).value,
    get(levelMaxAtom).value,
  ),
);

const talentMaterialsAtom = atom((get) =>
  mergeMaterials(
    calculateMaterialsRange(
      get(talentMatsAtom),
      get(attackMinAtom).value,
      get(attackMaxAtom).value,
    ),
    calculateMaterialsRange(
      get(talentMatsAtom),
      get(skillMinAtom).value,
      get(skillMaxAtom).value,
    ),
    calculateMaterialsRange(
      get(talentMatsAtom),
      get(burstMinAtom).value,
      get(burstMaxAtom).value,
    ),
  ),
);

const calculatedMaterialsAtom = atom((get) => {
  const characterMaterials = get(characterMaterialsAtom);
  const materialNameToInfo = get(materialNameToInfoAtom);

  return Object.entries(
    mergeMaterials(get(characterMaterialsAtom), get(talentMaterialsAtom)),
  ).sort(([aName], [bName]) => {
    // give characterMaterials priority in sort
    const aIsCharMat = characterMaterials[aName] !== undefined;
    const bIsCharMat = characterMaterials[bName] !== undefined;

    if (aIsCharMat === bIsCharMat) {
      const aSortorder = materialNameToInfo[aName]!.sortorder;
      const bSortorder = materialNameToInfo[bName]!.sortorder;

      if (aSortorder === bSortorder) {
        const aRarity = materialNameToInfo[aName]!.rarity;
        const bRarity = materialNameToInfo[bName]!.rarity;

        return sortStringAsNumber(aRarity, bRarity);
      } else {
        return aSortorder - bSortorder;
      }
    } else if (aIsCharMat) {
      return -1; // sort a before b
    } else {
      return 1; // sort b before a
    }
  });
});

function calculateMaterialsRange(
  costs: Item[][],
  start: number, // min is 0
  end: number, // max is len of array (not max index)
) {
  const materials: Record<string, number> = {};

  if (start < end) {
    for (const value of costs.slice(start + 1, end + 1)) {
      for (const { name, count } of value) {
        if (count > 0) {
          if (materials[name]) {
            materials[name] += count;
          } else {
            materials[name] = count;
          }
        }
      }
    }
  }

  return materials;
}

function mergeMaterials(...materials: Record<string, number>[]) {
  const merged: Record<string, number> = {};

  materials.forEach((material) => {
    for (const [name, count] of Object.entries(material)) {
      if (merged[name]) {
        merged[name] += count;
      } else {
        merged[name] = count;
      }
    }
  });

  return merged;
}

export function getMinMatOption() {
  return { label: "1", value: 0 };
}

function getRecommendedMatOption(
  options: SelectOption<number>[],
  nToLast: number,
) {
  return options.at(-nToLast) ?? getMinMatOption();
}

function getMaxMatOption(options: SelectOption<number>[]) {
  return options.at(-1) ?? getMinMatOption();
}

// STATE TEMPLATE SETTERS
const setNoLevelsAtom = atom(null, (_get, set) => {
  set(levelMinAtom, getMinMatOption());
  set(levelMaxAtom, getMinMatOption());
  set(attackMinAtom, getMinMatOption());
  set(attackMaxAtom, getMinMatOption());
  set(skillMinAtom, getMinMatOption());
  set(skillMaxAtom, getMinMatOption());
  set(burstMinAtom, getMinMatOption());
  set(burstMaxAtom, getMinMatOption());
});

const setRecommendedLevelsAtom = atom(null, (get, set) => {
  set(levelMaxAtom, getRecommendedMatOption(get(levelOptionsAtom), 1)); // 80+
  set(attackMaxAtom, getRecommendedMatOption(get(talentOptionsAtom), 2)); // 8
  set(skillMaxAtom, getRecommendedMatOption(get(talentOptionsAtom), 2)); // 8
  set(burstMaxAtom, getRecommendedMatOption(get(talentOptionsAtom), 2)); // 8
});

const setMaxLevelsAtom = atom(null, (get, set) => {
  set(levelMaxAtom, getMaxMatOption(get(levelOptionsAtom)));
  set(attackMaxAtom, getMaxMatOption(get(talentOptionsAtom)));
  set(skillMaxAtom, getMaxMatOption(get(talentOptionsAtom)));
  set(burstMaxAtom, getMaxMatOption(get(talentOptionsAtom)));
});

// HOOK FUNCTIONS
export function useMaterialNameToInfo() {
  return useAtomValue(materialNameToInfoAtom);
}

export function useLevelOptions() {
  return useAtomValue(levelOptionsAtom);
}

export function useLevelMin() {
  return useAtom(levelMinAtom);
}

export function useLevelMax() {
  return useAtom(levelMaxAtom);
}

export function useTalentOptions() {
  return useAtomValue(talentOptionsAtom);
}

export function useAttackMin() {
  return useAtom(attackMinAtom);
}

export function useAttackMax() {
  return useAtom(attackMaxAtom);
}

export function useSkillMin() {
  return useAtom(skillMinAtom);
}

export function useSkillMax() {
  return useAtom(skillMaxAtom);
}

export function useBurstMin() {
  return useAtom(burstMinAtom);
}

export function useBurstMax() {
  return useAtom(burstMaxAtom);
}

export function useCalculatedMaterials() {
  return useAtomValue(calculatedMaterialsAtom);
}

export function useSetNoLevels() {
  return useSetAtom(setNoLevelsAtom);
}

export function useSetRecommendedLevels() {
  return useSetAtom(setRecommendedLevelsAtom);
}

export function useSetMaxLevels() {
  return useSetAtom(setMaxLevelsAtom);
}
