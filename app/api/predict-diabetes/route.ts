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
  console.log("🩺 Diabetes prediction API called");
  try {
    const body: DiabetesPredictionRequest = await request.json();
    console.log("📝 Received request body:", body);

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
    const fastApiUrl = process.env.FAST_API_URL || "http://localhost:8000";
    console.log("🔗 FastAPI URL:", fastApiUrl);

    // Note: If you get connection errors, make sure your FastAPI is running with HTTP not HTTPS
    // Your .env.local has HTTPS but localhost typically uses HTTP

    const featuresArray = [
      pregnancies,
      glucose,
      blood_pressure,
      skin_thickness,
      insulin,
      bmi,
      diabetes_pedigree,
      age,
    ];

    const requestPayload = { features: featuresArray };
    console.log("📊 Sending to ML model:", requestPayload);

    const mlResponse = await fetch(`${fastApiUrl}/predict-diabetes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      console.error(`ML API Error (${mlResponse.status}):`, errorText);
      throw new Error(
        `ML API responded with status: ${mlResponse.status} - ${errorText}`
      );
    }

    const mlResult = await mlResponse.json();
    console.log("🤖 ML Model Response:", mlResult);

    // Return the ML prediction result
    // Your FastAPI returns {"prediction": value} where value is 0 or 1
    return NextResponse.json({
      testId,
      prediction: mlResult.prediction,
      probability: mlResult.probability, // Use prediction as probability (0 or 1)
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
      rawResponse: mlResult,
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
