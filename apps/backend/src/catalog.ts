import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { parse } from "yaml";
import type { UAVSystem } from "../../../packages/configuration/schemas/UAVSchema.js";
import type { Mission } from "../../../packages/configuration/entities/Mission.js";

export interface CatalogEntry extends UAVSystem {
  source: string;
}

export interface Recommendation {
  uav: CatalogEntry;
  score: number;
  reasons: string[];
  gaps: string[];
}

interface RawUavRecord {
  identity?: { manufacturer?: string; model?: string; category?: string; generation?: string };
  architecture?: Record<string, string>;
  modules?: Record<string, unknown> | string[];
  performance?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  energy?: Record<string, unknown>;
  sensing?: Record<string, unknown>;
  configuration?: { variables?: string[] };
}

const categoryMap: Record<string, CatalogEntry["identity"]["category"]> = {
  agricultural_uav: "agricultural",
  agricultural: "agricultural",
  mapping: "mapping",
  inspection: "inspection",
  transport: "transport"
};

function numberAt(value: unknown, ...keys: string[]): number | undefined {
  let current = value;
  for (const key of keys) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "number" ? current : undefined;
}

function normalizeRecord(raw: RawUavRecord, source: string): CatalogEntry {
  const identity = raw.identity ?? {};
  const performance = raw.performance ?? {};
  const payload = raw.payload ?? {};
  const liquid = (payload.liquid ?? {}) as Record<string, unknown>;
  const solid = (payload.solid ?? {}) as Record<string, unknown>;
  const architecture = raw.architecture ?? {};
  const sensing = raw.sensing ?? {};
  const modules = Array.isArray(raw.modules)
    ? raw.modules
    : Object.entries(raw.modules ?? {})
      .filter(([, value]) => typeof value !== "object" || (value as Record<string, unknown>).enabled !== false)
      .map(([key]) => key);

  return {
    id: `${identity.manufacturer ?? "unknown"}-${identity.model ?? source}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    identity: {
      manufacturer: identity.manufacturer ?? "Unknown",
      model: identity.model ?? source,
      category: categoryMap[identity.category ?? ""] ?? "custom",
      generation: identity.generation
    },
    source,
    architecture: {
      platformType: architecture.platformType ?? architecture.type,
      configurationPhilosophy: architecture.configurationPhilosophy ?? architecture.configuration
    },
    modules,
    performance: {
      weight: numberAt(performance, "weight", "aircraft_kg") ?? numberAt(performance, "weight", "with_battery_kg"),
      maximumTakeoffWeight: numberAt(performance, "max_takeoff_weight", "spraying_kg") ?? numberAt(performance, "max_takeoff_weight", "spreading_kg"),
      flightRadius: numberAt(performance, "flight_radius_m")
    },
    payload: {
      liquid: { capacity: numberAt(liquid, "capacity_l") },
      solid: { capacity: numberAt(solid, "capacity_l") }
    },
    energySystem: raw.energy?.battery && typeof raw.energy.battery === "object" ? "battery" : undefined,
    sensingCapabilities: Object.keys(sensing).flatMap((group) => {
      const value = sensing[group];
      return value && typeof value === "object" ? Object.keys(value).filter((key) => Boolean((value as Record<string, unknown>)[key])).map((key) => `${group}.${key}`) : [];
    }),
    fieldKnowledge: raw.configuration?.variables
  };
}

export async function loadCatalog(dataDirectory: string): Promise<CatalogEntry[]> {
  const manufacturers = await readdir(dataDirectory, { withFileTypes: true });
  const files = (await Promise.all(manufacturers.filter((entry) => entry.isDirectory()).map(async (manufacturer) => {
    const entries = await readdir(join(dataDirectory, manufacturer.name), { withFileTypes: true });
    return entries.filter((entry) => entry.isFile() && entry.name.endsWith(".yaml")).map((entry) => join(dataDirectory, manufacturer.name, entry.name));
  }))).flat();

  return Promise.all(files.map(async (file) => {
    const raw = parse(await readFile(file, "utf8")) as RawUavRecord;
    return normalizeRecord(raw, relative(dataDirectory, file).replaceAll("\\", "/"));
  }));
}

export function recommend(catalog: CatalogEntry[], mission: Mission): Recommendation[] {
  return catalog.map((uav) => {
    const reasons: string[] = [];
    const gaps: string[] = [];
    let score = 0;
    if (uav.identity.category === (mission.type === "application" ? "agricultural" : mission.type)) {
      score += 50;
      reasons.push("La categoría del sistema coincide con la misión.");
    } else {
      gaps.push("La categoría no coincide exactamente con la misión.");
    }
    const requiredCapacity = mission.requirements.performanceTargets?.area;
    const liquidCapacity = uav.payload?.liquid?.capacity;
    const solidCapacity = uav.payload?.solid?.capacity;
    if (mission.requirements.requiredCapabilities.some((capability) => capability.includes("liquid")) && liquidCapacity) {
      score += 25;
      reasons.push(`Dispone de ${liquidCapacity} L de capacidad líquida.`);
    }
    if (mission.requirements.requiredCapabilities.some((capability) => capability.includes("solid")) && solidCapacity) {
      score += 25;
      reasons.push(`Dispone de ${solidCapacity} L de capacidad sólida.`);
    }
    if (requiredCapacity && !uav.performance?.coverageRate) gaps.push("No hay una tasa de cobertura normalizada para estimar el área.");
    if (!reasons.length) gaps.push("Faltan capacidades normalizadas para justificar una recomendación.");
    return { uav, score, reasons, gaps };
  }).sort((left, right) => right.score - left.score);
}