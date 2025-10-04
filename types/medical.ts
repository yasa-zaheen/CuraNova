/**
 * Type definitions for medical information and diagnostic workflow
 * 
 * These types ensure type safety across the application when handling
 * patient information, test selections, and appointment scheduling.
 * 
 * Usage:
 * - Import these types in components that handle medical data
 * - Use MedicalInfo for patient demographic and contact information
 * - Use DiagnosticPayload for the complete scheduling workflow
 * - Maintain consistency between form inputs and database storage
 */

/**
 * Complete medical information for a patient
 * Includes both required and optional fields for comprehensive patient data
 */
export type MedicalInfo = {
  // Required patient identification fields
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;  // Date of birth in YYYY-MM-DD format
  
  // Optional address fields for enhanced care coordination
  street: string;
  city: string;
  state: string;
  zip: string;
  
  // Optional insurance fields for billing integration
  insuranceProvider: string;
  insuranceId: string;
  groupNumber: string;
}

/**
 * Test selection information for diagnostic workflow
 * Contains selected tests and metadata about the selection
 */
export type TestSelection = {
  selectedTests: string[];        // Array of test IDs
  recommendedBy: string;          // Who/what recommended these tests
  notes: string;                  // Additional notes or context
}

/**
 * Appointment scheduling input
 * Contains scheduling preferences and details
 */
export type AppointmentInput = {
  preferredDate: string;          // ISO date string (YYYY-MM-DD)
  timeSlot: string;              // Preferred time slot (e.g., 'morning', 'afternoon')
  notes: string;                 // Additional appointment notes
}

/**
 * Complete payload for diagnostic creation
 * Combines patient info, test selections, and appointment details
 */
export type DiagnosticPayload = {
  medicalInfo: MedicalInfo;
  testSelection: TestSelection;
  appointmentInput: AppointmentInput;
  userSymptom: string;
  aiSummary: string;
}