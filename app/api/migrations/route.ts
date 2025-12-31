import { NextResponse } from "next/server";
import { readMigrations, writeMigrations } from "@/lib/store";
import crypto from "crypto";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const model = searchParams.get("model") || "";
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  let migrations = readMigrations();

  
  if (search) {
    migrations = migrations.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  
  if (status) {
    migrations = migrations.filter(m => m.status === status);
  }

  
  if (model) {
    migrations = migrations.filter(m =>
      m.sourceModel === model || m.targetModel === model
    );
  }

  
  migrations.sort((a, b) => {
    let aValue, bValue;

    if (sort === "name") {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    } else {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    }

    if (order === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  
  const total = migrations.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMigrations = migrations.slice(startIndex, endIndex);

  return NextResponse.json({
    migrations: paginatedMigrations,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const migrations = readMigrations();

  const migration = {
    id: crypto.randomUUID(),
    name: body.name,
    sourceModel: body.sourceModel,
    targetModel: body.targetModel,
    prompts: (body.prompts || []).map((p: string) => ({ source: p, migrated: undefined })),
    status: "DRAFT",
    createdAt: new Date().toISOString(),
    notes: body.notes || "",
  };

  migrations.push(migration);
  writeMigrations(migrations);

  return NextResponse.json(migration, { status: 201 });
}
