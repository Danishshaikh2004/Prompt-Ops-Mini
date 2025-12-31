import { NextResponse } from "next/server";
import { readEvaluations, writeEvaluations } from "@/lib/store";
import { Evaluation } from "@/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const evaluations = readEvaluations();
  const evaluation = evaluations.find((e: Evaluation) => e.id === id);

  if (!evaluation) {
    return NextResponse.json(
      { error: "Evaluation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(evaluation);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const evaluations = readEvaluations();
  const index = evaluations.findIndex((e: Evaluation) => e.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: "Evaluation not found" },
      { status: 404 }
    );
  }

  evaluations.splice(index, 1);
  writeEvaluations(evaluations);

  return NextResponse.json({ message: "Evaluation deleted successfully" });
}
