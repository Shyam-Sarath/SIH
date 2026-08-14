/**
 * KrishiBundle Cargo Compatibility Engine
 *
 * Architecture:
 *   1. Rule-based knowledge base (curated for ~20 crops) — fast, deterministic
 *   2. Score & structured result returned from rules
 *   3. LLM (Groq) called ONLY to produce a human-readable explanation
 *      of the rule-engine's result — it does NOT make the compatibility decision.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Crop profiles
// ─────────────────────────────────────────────────────────────────────────────

export interface CropProfile {
  name: string;
  /** Ideal temp range in °C */
  tempMin: number;
  tempMax: number;
  /** Does it emit ethylene? Triggers ripening in sensitive crops */
  ethyleneProducer: boolean;
  /** Is it sensitive to ethylene from other crops? */
  ethyleneSensitive: boolean;
  /** Requires high humidity (>85%) */
  highHumidity: boolean;
  /** Strong odour that transfers to other produce */
  strongOdour: boolean;
  /** Requires ventilation (can't be tightly packed with other heavy items) */
  needsVentilation: boolean;
  /** Very delicate — bruises under weight */
  delicate: boolean;
}

export const CROP_PROFILES: Record<string, CropProfile> = {
  tomato: {
    name: 'Tomato', tempMin: 10, tempMax: 20,
    ethyleneProducer: true, ethyleneSensitive: false,
    highHumidity: false, strongOdour: false,
    needsVentilation: true, delicate: true,
  },
  onion: {
    name: 'Onion', tempMin: 0, tempMax: 25,
    ethyleneProducer: false, ethyleneSensitive: false,
    highHumidity: false, strongOdour: true,
    needsVentilation: true, delicate: false,
  },
  potato: {
    name: 'Potato', tempMin: 4, tempMax: 10,
    ethyleneProducer: false, ethyleneSensitive: true,
    highHumidity: true, strongOdour: false,
    needsVentilation: false, delicate: false,
  },
  banana: {
    name: 'Banana', tempMin: 13, tempMax: 18,
    ethyleneProducer: true, ethyleneSensitive: true,
    highHumidity: true, strongOdour: false,
    needsVentilation: true, delicate: true,
  },
  mango: {
    name: 'Mango', tempMin: 8, tempMax: 15,
    ethyleneProducer: true, ethyleneSensitive: true,
    highHumidity: false, strongOdour: false,
    needsVentilation: true, delicate: true,
  },
  carrot: {
    name: 'Carrot', tempMin: 0, tempMax: 5,
    ethyleneProducer: false, ethyleneSensitive: true,
    highHumidity: true, strongOdour: false,
    needsVentilation: false, delicate: false,
  },
  cabbage: {
    name: 'Cabbage', tempMin: 0, tempMax: 5,
    ethyleneProducer: false, ethyleneSensitive: true,
    highHumidity: true, strongOdour: true,
    needsVentilation: true, delicate: false,
  },
  brinjal: {
    name: 'Brinjal (Eggplant)', tempMin: 10, tempMax: 15,
    ethyleneProducer: false, ethyleneSensitive: true,
    highHumidity: false, strongOdour: false,
    needsVentilation: false, delicate: true,
  },
  chilli: {
    name: 'Chilli', tempMin: 7, tempMax: 13,
    ethyleneProducer: false, ethyleneSensitive: false,
    highHumidity: false, strongOdour: true,
    needsVentilation: false, delicate: false,
  },
  coconut: {
    name: 'Coconut', tempMin: 15, tempMax: 35,
    ethyleneProducer: false, ethyleneSensitive: false,
    highHumidity: false, strongOdour: false,
    needsVentilation: false, delicate: false,
  },
  okra: {
    name: 'Okra (Lady Finger)', tempMin: 7, tempMax: 10,
    ethyleneProducer: false, ethyleneSensitive: true,
    highHumidity: true, strongOdour: false,
    needsVentilation: true, delicate: true,
  },
  spinach: {
    name: 'Spinach', tempMin: 0, tempMax: 5,
    ethyleneProducer: false, ethyleneSensitive: true,
    highHumidity: true, strongOdour: false,
    needsVentilation: true, delicate: true,
  },
  garlic: {
    name: 'Garlic', tempMin: 0, tempMax: 10,
    ethyleneProducer: false, ethyleneSensitive: false,
    highHumidity: false, strongOdour: true,
    needsVentilation: true, delicate: false,
  },
  ginger: {
    name: 'Ginger', tempMin: 13, tempMax: 15,
    ethyleneProducer: false, ethyleneSensitive: false,
    highHumidity: true, strongOdour: true,
    needsVentilation: false, delicate: false,
  },
  watermelon: {
    name: 'Watermelon', tempMin: 10, tempMax: 15,
    ethyleneProducer: false, ethyleneSensitive: true,
    highHumidity: false, strongOdour: false,
    needsVentilation: false, delicate: true,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Compatibility Result
// ─────────────────────────────────────────────────────────────────────────────

export interface CompatibilityResult {
  compatible: boolean;
  score: number;               // 0–100
  reasons: string[];           // What the rules found (structured)
  warnings: string[];          // Issues that reduce score but don't block
  /** Populated later by LLM call */
  explanation?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Rule Engine
// ─────────────────────────────────────────────────────────────────────────────

function normalizeCropName(crop: string): string {
  return crop.toLowerCase().trim().replace(/\s+/g, '_');
}

export function checkCompatibility(
  crop1: string,
  crop2: string,
  transitDurationHours = 4,
): CompatibilityResult {
  const key1 = normalizeCropName(crop1);
  const key2 = normalizeCropName(crop2);

  const profile1 = CROP_PROFILES[key1];
  const profile2 = CROP_PROFILES[key2];

  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 100;
  let compatible = true;

  // ── Rule 1: Unknown crops — allow with warning
  if (!profile1 || !profile2) {
    const unknowns = [!profile1 && crop1, !profile2 && crop2].filter(Boolean);
    warnings.push(`No profile found for: ${unknowns.join(', ')}. Defaulting to compatible.`);
    return { compatible: true, score: 70, reasons, warnings };
  }

  // ── Rule 2: Temperature range overlap
  const tempOverlapMin = Math.max(profile1.tempMin, profile2.tempMin);
  const tempOverlapMax = Math.min(profile1.tempMax, profile2.tempMax);

  if (tempOverlapMin > tempOverlapMax) {
    reasons.push(
      `Temperature conflict: ${profile1.name} needs ${profile1.tempMin}–${profile1.tempMax}°C, ` +
      `${profile2.name} needs ${profile2.tempMin}–${profile2.tempMax}°C — no overlap.`
    );
    score -= 40;
    compatible = false;
  }

  // ── Rule 3: Ethylene — producer + sensitive combination
  if (profile1.ethyleneProducer && profile2.ethyleneSensitive) {
    const penalty = transitDurationHours > 3 ? 35 : 15;
    reasons.push(
      `${profile1.name} produces ethylene which accelerates ripening of ${profile2.name}. ` +
      `Risk increases with transit > 3h.`
    );
    score -= penalty;
    if (penalty >= 35) compatible = false;
  }

  if (profile2.ethyleneProducer && profile1.ethyleneSensitive) {
    const penalty = transitDurationHours > 3 ? 35 : 15;
    reasons.push(
      `${profile2.name} produces ethylene which accelerates ripening of ${profile1.name}. ` +
      `Risk increases with transit > 3h.`
    );
    score -= penalty;
    if (penalty >= 35) compatible = false;
  }

  // ── Rule 4: Odour transfer
  if (profile1.strongOdour || profile2.strongOdour) {
    const odourSource = profile1.strongOdour ? profile1.name : profile2.name;
    const odourTarget = profile1.strongOdour ? profile2.name : profile1.name;
    warnings.push(
      `${odourSource} has a strong odour that may transfer to ${odourTarget}. ` +
      `Recommend physical separation within vehicle.`
    );
    score -= 10;
  }

  // ── Rule 5: Humidity conflict
  const oneNeedsHigh = profile1.highHumidity !== profile2.highHumidity;
  if (oneNeedsHigh) {
    const highHumidCrop = profile1.highHumidity ? profile1.name : profile2.name;
    const lowHumidCrop = profile1.highHumidity ? profile2.name : profile1.name;
    warnings.push(
      `${highHumidCrop} requires high humidity (>85%) while ${lowHumidCrop} prefers lower humidity. ` +
      `Compatible for short transit (<3h).`
    );
    score -= 5;
  }

  // ── Rule 6: Delicate items under heavy load
  if ((profile1.delicate || profile2.delicate) && !(profile1.delicate && profile2.delicate)) {
    const delicateCrop = profile1.delicate ? profile1.name : profile2.name;
    warnings.push(
      `${delicateCrop} is delicate — ensure it's loaded on top and not under heavy cargo.`
    );
    score -= 5;
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Final compatibility decision
  if (score < 50) compatible = false;

  return { compatible, score, reasons, warnings };
}

/**
 * Check a full bundle of multiple crops.
 * Returns the minimum pairwise compatibility.
 */
export function checkBundleCompatibility(crops: string[], transitHours = 4): CompatibilityResult {
  if (crops.length <= 1) {
    return { compatible: true, score: 100, reasons: [], warnings: [] };
  }

  let worstScore = 100;
  let worstResult: CompatibilityResult = { compatible: true, score: 100, reasons: [], warnings: [] };
  const allReasons: string[] = [];
  const allWarnings: string[] = [];

  for (let i = 0; i < crops.length; i++) {
    for (let j = i + 1; j < crops.length; j++) {
      const result = checkCompatibility(crops[i], crops[j], transitHours);
      allReasons.push(...result.reasons);
      allWarnings.push(...result.warnings);
      if (result.score < worstScore) {
        worstScore = result.score;
        worstResult = result;
      }
    }
  }

  return {
    compatible: worstScore >= 50,
    score: worstScore,
    reasons: [...new Set(allReasons)],
    warnings: [...new Set(allWarnings)],
  };
}
