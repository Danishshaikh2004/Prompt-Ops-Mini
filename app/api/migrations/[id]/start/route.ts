import { NextResponse } from "next/server";
import { readMigrations, writeMigrations } from "@/lib/store";

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
    const updatedMigrations = readMigrations();
    const updatedIndex = updatedMigrations.findIndex((m: any) => m.id === id);
    if (updatedIndex !== -1) {
      updatedMigrations[updatedIndex].status = "COMPLETED";
  
      
      updatedMigrations[updatedIndex].prompts = updatedMigrations[updatedIndex].prompts.map((p: any) => ({
        source: typeof p === 'string' ? p : p.source,
        migrated: typeof p === 'string' ? `${p} (migrated to ${updatedMigrations[updatedIndex].targetModel})` : p.migrated
      }));
      writeMigrations(updatedMigrations);
    }
  }, 2000); 
  

  return NextResponse.json({ migration });
}
