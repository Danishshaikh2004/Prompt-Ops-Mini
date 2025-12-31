import { NextResponse } from "next/server";
import { readEvaluations, writeEvaluations } from "@/lib/store";
import { CreateEvaluationPayload, Evaluation } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const model = searchParams.get('model') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');

  let evaluations = readEvaluations();

  if (search) {
    evaluations = evaluations.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.prompt.toLowerCase().includes(search.toLowerCase())
    );
  }

  
  if (status) {
    evaluations = evaluations.filter(e => e.status === status);
  }

  
  if (model) {
    evaluations = evaluations.filter(e => e.models.includes(model));
  }

  evaluations.sort((a, b) => {
    let aValue: any, bValue: any;
    if (sort === 'score') {
      aValue = a.results ? Math.max(...a.results.map(r => r.overall)) : 0;
      bValue = b.results ? Math.max(...b.results.map(r => r.overall)) : 0;
    } else {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    }

    if (order === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  
  const startIndex = (page - 1) * pageSize;
  const paginatedEvaluations = evaluations.slice(startIndex, startIndex + pageSize);

  return NextResponse.json({
    evaluations: paginatedEvaluations,
    total: evaluations.length,
    page,
    pageSize
  });
}

export async function POST(request: Request) {
  try {
    const body: CreateEvaluationPayload = await request.json();

    
    if (!body.name || !body.prompt || !body.models || !body.weights) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const evaluations = readEvaluations();

    const newEvaluation: Evaluation = {
      id: Date.now().toString(),
      name: body.name,
      prompt: body.prompt,
      models: body.models,
      weights: body.weights,
      status: "QUEUED",
      createdAt: new Date().toISOString(),
    };

    evaluations.push(newEvaluation);
    writeEvaluations(evaluations);

    return NextResponse.json({ evaluation: newEvaluation });
  } catch (error) {
    console.error("Error creating evaluation:", error);
    return NextResponse.json({ error: "Failed to create evaluation" }, { status: 500 });
  }
}
