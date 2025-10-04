import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

interface DiagnosticsRequest {
  userId: string;
  symptom: string;
  aiSummary: string;
  hospital: string;
  scheduledDate: string;
  testName?: string;
}

interface DiagnosticsRecord {
  id: string;
  user_id: string;
  symptom: string;
  ai_summary: string;
  hospital: string;
  scheduled_date: string;
  test_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DiagnosticsRequest = await request.json();

    // Validate required fields
    if (
      !body.userId ||
      !body.symptom ||
      !body.aiSummary ||
      !body.hospital ||
      !body.scheduledDate
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: userId, symptom, aiSummary, hospital, scheduledDate",
        },
        { status: 400 }
      );
    }

    // Create Supabase server client
    const supabase = createSupabaseServerClient();

    // Prepare data for insertion
    const diagnosticData = {
      user_id: body.userId,
      symptom: body.symptom,
      ai_summary: body.aiSummary,
      hospital: body.hospital,
      scheduled_date: body.scheduledDate,
      test_name: body.testName || null,
      status: "scheduled",
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from("diagnostics")
      .insert(diagnosticData)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          error: "Failed to create diagnostic record",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Return the created record
    return NextResponse.json({
      id: data.id,
      userId: data.user_id,
      symptom: data.symptom,
      aiSummary: data.ai_summary,
      hospital: data.hospital,
      scheduledDate: data.scheduled_date,
      testName: data.test_name,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (error) {
    console.error("Error creating diagnostic record:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      );
    }

    // Create Supabase server client
    const supabase = createSupabaseServerClient();

    // Fetch diagnostics for the user
    const { data, error } = await supabase
      .from("diagnostics")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch diagnostic records",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Transform data to match frontend interface
    const transformedData = data.map((record: DiagnosticsRecord) => ({
      id: record.id,
      userId: record.user_id,
      symptom: record.symptom,
      aiSummary: record.ai_summary,
      hospital: record.hospital,
      scheduledDate: record.scheduled_date,
      testName: record.test_name,
      status: record.status,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching diagnostic records:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
