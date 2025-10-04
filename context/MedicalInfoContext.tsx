/**
 * Medical Information Context
 * 
 * This context provides a centralized way to manage patient medical information
 * across the application, particularly between the Medical Information form
 * and the Recommended Medical Tests modal.
 * 
 * Purpose:
 * - Share patient data between components without prop drilling
 * - Maintain form state across navigation and modal interactions
 * - Provide a single source of truth for medical information
 * - Enable the scheduling workflow to access complete patient data
 * 
 * Usage:
 * - Wrap pages/layouts that contain medical forms with MedicalInfoProvider
 * - Use useMedicalInfo hook in components that need to read/write medical data
 * - The form component writes to context, the scheduling modal reads from it
 * 
 * Integration Points:
 * - Medical Information form (writes patient data to context)
 * - Recommended Medical Tests modal (reads patient data from context)
 * - Diagnostic scheduling workflow (consumes complete patient information)
 */

'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { MedicalInfo } from '@/types/medical'

/**
 * Context value interface
 * Provides both the current medical info and functions to update it
 */
interface MedicalInfoContextValue {
  medicalInfo: MedicalInfo
  setMedicalInfo: (info: MedicalInfo) => void
  updateField: (field: keyof MedicalInfo, value: string) => void
  clearMedicalInfo: () => void
}

/**
 * Default/empty medical information state
 * Used as initial state and for resetting the form
 */
const defaultMedicalInfo: MedicalInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dob: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  insuranceProvider: '',
  insuranceId: '',
  groupNumber: '',
}

/**
 * Medical Info Context
 * Provides access to medical information state and update functions
 */
const MedicalInfoContext = createContext<MedicalInfoContextValue | undefined>(undefined)

/**
 * Medical Info Provider Component
 * 
 * Wraps components that need access to medical information state.
 * Should be placed high enough in the component tree to encompass
 * both the form (where data is entered) and the modal (where data is consumed).
 */
export function MedicalInfoProvider({ children }: { children: ReactNode }) {
  // Central state for medical information
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>(defaultMedicalInfo)

  /**
   * Update a single field in the medical information
   * Useful for form inputs that update one field at a time
   */
  const updateField = (field: keyof MedicalInfo, value: string) => {
    setMedicalInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  /**
   * Clear all medical information
   * Useful for starting fresh or after successful submission
   */
  const clearMedicalInfo = () => {
    setMedicalInfo(defaultMedicalInfo)
  }

  const value: MedicalInfoContextValue = {
    medicalInfo,
    setMedicalInfo,
    updateField,
    clearMedicalInfo,
  }

  return (
    <MedicalInfoContext.Provider value={value}>
      {children}
    </MedicalInfoContext.Provider>
  )
}

/**
 * Hook to access medical information context
 * 
 * Provides easy access to medical info state and update functions.
 * Throws an error if used outside of MedicalInfoProvider to help
 * catch integration issues early.
 * 
 * @returns Medical info context value with state and update functions
 * @throws Error if used outside of MedicalInfoProvider
 */
export function useMedicalInfo(): MedicalInfoContextValue {
  const context = useContext(MedicalInfoContext)
  
  if (context === undefined) {
    throw new Error('useMedicalInfo must be used within a MedicalInfoProvider')
  }
  
  return context
}