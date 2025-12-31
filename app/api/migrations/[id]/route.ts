import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Migration } from "@/types";

const dataFile = path.join(process.cwd(), "data", "migrations.json");

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const raw = fs.readFileSync(dataFile, "utf-8");
    const migrations: Migration[] = JSON.parse(raw);

    const migration = migrations.find(
      (m: Migration) => m.id === id
    );

    if (!migration) {
      return NextResponse.json(
        { error: "Migration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(migration);
  } catch {
    return NextResponse.json(
      { error: "Failed to read migrations" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const raw = fs.readFileSync(dataFile, "utf-8");
    const migrations: Migration[] = JSON.parse(raw);

    const index = migrations.findIndex(
      (m: Migration) => m.id === id
    );

    if (index === -1) {
      return NextResponse.json(
        { error: "Migration not found" },
        { status: 404 }
      );
    }

    migrations.splice(index, 1);
    fs.writeFileSync(dataFile, JSON.stringify(migrations, null, 2));

    return NextResponse.json({ message: "Migration deleted successfully" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete migration" },
      { status: 500 }
    );
  }
}
