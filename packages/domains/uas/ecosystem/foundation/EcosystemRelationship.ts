export type EcosystemRelationshipType =
  | "distributes" | "operates" | "trains" | "supports" | "represents"
  | "researches" | "partners" | "provides" | "participates";

export interface EcosystemRelationship {
  id: string;
  source: string;
  target: string;
  type: EcosystemRelationshipType;
  evidence: string[];
  status: "observed" | "inferred" | "candidate";
}
