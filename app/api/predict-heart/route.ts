import { NextRequest, NextResponse } from "next/server";

interface HeartPredictionRequest {
  testId: string;
  age: number;
  sex: string;
  is_smoking: string;
  cigsPerDay: number;
  BPMeds: number;
  prevalentStroke: number;
  prevalentHyp: number;
  diabetes: number;
  totChol: number;
  sysBP: number;
  diaBP: number;
  BMI: number;
  heartRate: number;
}

export async function POST(request: NextRequest) {
  console.log("🫀 Heart disease prediction API called");
  try {
    const body: HeartPredictionRequest = await request.json();
    console.log("📝 Received request body:", body);

    // Validate required fields
    const {
      testId,
      age,
      sex,
      is_smoking,
      cigsPerDay,
      BPMeds,
      prevalentStroke,
      prevalentHyp,
      diabetes,
      totChol,
      sysBP,
      diaBP,
      BMI,
      heartRate,
    } = body;

    if (
      testId === undefined ||
      age === undefined ||
      sex === undefined ||
      is_smoking === undefined ||
      cigsPerDay === undefined ||
      BPMeds === undefined ||
      prevalentStroke === undefined ||
      prevalentHyp === undefined ||
      diabetes === undefined ||
      totChol === undefined ||
      sysBP === undefined ||
      diaBP === undefined ||
      BMI === undefined ||
      heartRate === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields for heart disease prediction" },
        { status: 400 }
      );
    }

    // Call your FastAPI ML backend
    const fastApiUrl = process.env.FAST_API_URL || "http://localhost:8000";
    console.log("🔗 FastAPI URL:", fastApiUrl);

    // Convert string values to numeric for ML model
    const sexNumeric = sex === "M" ? 1 : 0;
    const smokingNumeric = is_smoking === "YES" ? 1 : 0;

    // Create features array in the order your ML model expects
    const featuresArray = [
      age,
      sexNumeric,
      smokingNumeric,
      cigsPerDay,
      BPMeds,
      prevalentStroke,
      prevalentHyp,
      diabetes,
      totChol,
      sysBP,
      diaBP,
      BMI,
      heartRate,
    ];

    const requestPayload = { features: featuresArray };
    console.log("📊 Sending to ML model:", requestPayload);

    const mlResponse = await fetch(`${fastApiUrl}/predict-heart`, {
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
      message: "Heart disease prediction completed successfully",
      inputData: {
        age,
        sex,
        is_smoking,
        cigsPerDay,
        BPMeds,
        prevalentStroke,
        prevalentHyp,
        diabetes,
        totChol,
        sysBP,
        diaBP,
        BMI,
        heartRate,
      },
      rawResponse: mlResult,
    });
  } catch (error) {
    console.error("Error in heart disease prediction:", error);
    return NextResponse.json(
      {
        error: "Failed to process heart disease prediction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
