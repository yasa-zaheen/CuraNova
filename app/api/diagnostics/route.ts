import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

interface DiagnosticsRequest {
  userId: string;
  symptom: string;
  aiSummary: string;
  hospital: string;
  scheduledDate: string;
  testName?: string;
  testId?: string;
  selectedTests?: string[]; // Array of selected test IDs/names
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
    const diagnosticInsertData = {
      user_id: body.userId,
      symptom: body.symptom,
      ai_summary: body.aiSummary,
      hospital: body.hospital,
      scheduled_date: body.scheduledDate,
      test_name: body.testName || null,
      status: "scheduled",
    };

    // Insert into Supabase diagnostics table
    const { data: diagnosticRecord, error: diagnosticError } = await supabase
      .from("diagnostics")
      .insert(diagnosticInsertData)
      .select()
      .single();

    if (diagnosticError) {
      console.error("Supabase diagnostic error:", diagnosticError);
      return NextResponse.json(
        {
          error: "Failed to create diagnostic record",
          details: diagnosticError.message,
        },
        { status: 500 }
      );
    }

    // Create test records in tests table for each selected test
    let testData: Record<string, unknown>[] = [];
    const testsToCreate =
      body.selectedTests || (body.testName ? [body.testName] : []);

    if (testsToCreate.length > 0) {
      // Create multiple test records
      const testRecords = testsToCreate.map((testName) => ({
        diagnostic_id: diagnosticRecord.id,
        test_name: testName,
        test_id: body.testId || testName, // Use testId from request, fallback to testName
        status: "pending", // Initial status
        result_file: null, // No result file initially
      }));

      const { data: createdTests, error: testError } = await supabase
        .from("tests")
        .insert(testRecords)
        .select();

      if (testError) {
        console.error("Supabase test creation error:", testError);
        // Don't fail the whole request, but log the error
        console.warn(
          "Failed to create test records, but diagnostic was created successfully"
        );
      } else {
        testData = createdTests.map((test) => ({
          id: test.id,
          diagnosticId: test.diagnostic_id,
          testName: test.test_name,
          testId: test.test_id,
          status: test.status,
          resultFile: test.result_file,
          createdAt: test.created_at,
          updatedAt: test.updated_at,
        }));
        console.log(
          `${testData.length} test records created successfully:`,
          testData
        );
      }
    }

    // Return the created record with test information
    return NextResponse.json({
      id: diagnosticRecord.id,
      userId: diagnosticRecord.user_id,
      symptom: diagnosticRecord.symptom,
      aiSummary: diagnosticRecord.ai_summary,
      hospital: diagnosticRecord.hospital,
      scheduledDate: diagnosticRecord.scheduled_date,
      testName: diagnosticRecord.test_name,
      status: diagnosticRecord.status,
      createdAt: diagnosticRecord.created_at,
      updatedAt: diagnosticRecord.updated_at,
      tests: testData, // Include created test data (array)
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
