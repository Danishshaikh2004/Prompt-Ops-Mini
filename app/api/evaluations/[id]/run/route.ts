import { NextResponse } from "next/server";
import { readEvaluations, writeEvaluations } from "@/lib/store";
import { generateMockScores } from "@/utils/scoring";
import { Evaluation } from "@/types";

export async function POST(
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

  if (evaluation.status !== "QUEUED") {
    return NextResponse.json(
      { error: "Evaluation is not in QUEUED status" },
      { status: 400 }
    );
  }

  evaluation.status = "RUNNING";
  writeEvaluations(evaluations);

  setTimeout(() => {
    const evaluationsAgain = readEvaluations();
    const evalAgain = evaluationsAgain.find((e: Evaluation) => e.id === id);
    if (evalAgain) {

      evalAgain.results = evalAgain.models.map((model: string) => ({
        model,
        ...generateMockScores(evalAgain.weights)
      }));
      evalAgain.status = "DONE";
      writeEvaluations(evaluationsAgain);
    }
  }, 2000 + Math.random() * 3000); 

  return NextResponse.json({ message: "Evaluation started" });
}
