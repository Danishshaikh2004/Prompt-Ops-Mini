import { NextResponse } from "next/server";
import { readMigrations, writeMigrations } from "@/lib/store";
import { Migration } from "@/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const migrations = readMigrations();
  const migrationIndex = migrations.findIndex((m: any) => m.id === id);

  if (migrationIndex === -1) {
    return NextResponse.json({ error: "Migration not found" }, { status: 404 });
  }

  const migration = migrations[migrationIndex];

  if (migration.status !== "DRAFT") {
    return NextResponse.json({ error: "Migration is not in DRAFT status" }, { status: 400 });
  }

  
  migration.status = "RUNNING";
  writeMigrations(migrations);

  
  setTimeout(() => {
    const updatedMigrations: Migration[] = readMigrations();
    const updatedIndex = updatedMigrations.findIndex((m: Migration) => m.id === id);
    if (updatedIndex !== -1) {
      updatedMigrations[updatedIndex].status = "COMPLETED";

      updatedMigrations[updatedIndex].prompts = updatedMigrations[updatedIndex].prompts.map((p: { id: string; source: string; migrated?: string }) => ({
        id: p.id,
        source: p.source,
        migrated: p.migrated || `${p.source} (migrated to ${updatedMigrations[updatedIndex].targetModel})`
      }));
      writeMigrations(updatedMigrations);
    }
  }, 2000); 
  

  return NextResponse.json({ migration });
}
