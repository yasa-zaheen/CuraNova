import { NextRequest, NextResponse } from "next/server";

interface DiabetesPredictionRequest {
  testId: string;
  pregnancies: number;
  glucose: number;
  blood_pressure: number;
  skin_thickness: number;
  insulin: number;
  bmi: number;
  diabetes_pedigree: number;
  age: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: DiabetesPredictionRequest = await request.json();

    // Validate required fields
    const {
      testId,
      pregnancies,
      glucose,
      blood_pressure,
      skin_thickness,
      insulin,
      bmi,
      diabetes_pedigree,
      age,
    } = body;

    if (
      testId === undefined ||
      pregnancies === undefined ||
      glucose === undefined ||
      blood_pressure === undefined ||
      skin_thickness === undefined ||
      insulin === undefined ||
      bmi === undefined ||
      diabetes_pedigree === undefined ||
      age === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields for diabetes prediction" },
        { status: 400 }
      );
    }

    // Call your FastAPI ML backend
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";

    const mlResponse = await fetch(`${fastApiUrl}/predict-diabetes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pregnancies,
        glucose,
        blood_pressure,
        skin_thickness,
        insulin,
        bmi,
        diabetes_pedigree,
        age,
      }),
    });

    if (!mlResponse.ok) {
      throw new Error(`ML API responded with status: ${mlResponse.status}`);
    }

    const mlResult = await mlResponse.json();

    // Return the ML prediction result
    return NextResponse.json({
      testId,
      prediction: mlResult.prediction,
      probability: mlResult.probability,
      message: "Diabetes prediction completed successfully",
      inputData: {
        pregnancies,
        glucose,
        blood_pressure,
        skin_thickness,
        insulin,
        bmi,
        diabetes_pedigree,
        age,
      },
    });
  } catch (error) {
    console.error("Error in diabetes prediction:", error);
    return NextResponse.json(
      {
        error: "Failed to process diabetes prediction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
