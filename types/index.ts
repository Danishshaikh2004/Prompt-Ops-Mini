

export type MigrationStatus = "DRAFT" | "RUNNING" | "COMPLETED" | "FAILED";

export type EvaluationStatus = "QUEUED" | "RUNNING" | "DONE" | "ERROR";

export type Migration = {
  id: string;
  name: string;
  sourceModel: string;
  targetModel: string;
  status: MigrationStatus;
  createdAt: string;
  prompts: { id: string; source: string; migrated?: string }[];
};

export type Evaluation = {
  id: string;
  name: string;
  prompt: string;
  models: string[];
  weights: { clarity: number; specificity: number; safety: number };
  status: EvaluationStatus;
  results?: { model: string; clarity: number; specificity: number; safety: number; overall: number }[];
  createdAt: string;
};



export type CreateMigrationPayload = {
  name: string;
  sourceModel: string;
  targetModel: string;
  notes?: string;
  prompts: string[];
};

export type CreateEvaluationPayload = {
  name: string;
  prompt: string;
  models: string[];
  weights: { clarity: number; specificity: number; safety: number };
};

export type MigrationResponse = {
  migration: Migration;
};

export type EvaluationResponse = {
  evaluation: Evaluation;
};

export type MigrationListResponse = {
  migrations: Migration[];
};

export type EvaluationListResponse = {
  evaluations: Evaluation[];
};
