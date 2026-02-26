"use client"

import useSWR, { mutate as globalMutate } from "swr"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

async function fetchUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function fetchSettings() {
  const { data, error } = await supabase.from("settings").select("*").limit(1).single()
  if (error && error.code === "PGRST116") {
    // No settings found, create default
    const user = await fetchUser()
    if (!user) return null
    const { data: newSettings } = await supabase
      .from("settings")
      .insert({ user_id: user.id })
      .select()
      .single()
    return newSettings
  }
  return data
}

async function fetchTenants() {
  const { data } = await supabase.from("tenants").select("*").order("created_at", { ascending: false })
  return data || []
}

async function fetchLeases() {
  const { data } = await supabase.from("leases").select("*").order("created_at", { ascending: false })
  return data || []
}

async function fetchRentRecords() {
  const { data } = await supabase.from("rent_records").select("*").order("month_year", { ascending: false })
  return data || []
}

async function fetchPayments() {
  const { data } = await supabase.from("payments").select("*").order("created_at", { ascending: false })
  return data || []
}

export function useUser() {
  return useSWR("user", fetchUser)
}

export function useSettings() {
  return useSWR("settings", fetchSettings)
}

export function useTenants() {
  return useSWR("tenants", fetchTenants)
}

export function useLeases() {
  return useSWR("leases", fetchLeases)
}

export function useRentRecords() {
  return useSWR("rent_records", fetchRentRecords)
}

export function usePayments() {
  return useSWR("payments", fetchPayments)
}

// Mutation helpers
export async function addTenant(tenantData: Record<string, unknown>) {
  const user = await fetchUser()
  if (!user) throw new Error("Not authenticated")
  const { data, error } = await supabase
    .from("tenants")
    .insert({ ...tenantData, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  await globalMutate("tenants")
  return data
}

export async function updateTenant(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("tenants")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  await globalMutate("tenants")
  return data
}

export async function deleteTenant(id: string) {
  const { error } = await supabase.from("tenants").delete().eq("id", id)
  if (error) throw error
  await globalMutate("tenants")
}

export async function addLease(leaseData: Record<string, unknown>) {
  const user = await fetchUser()
  if (!user) throw new Error("Not authenticated")
  const { data, error } = await supabase
    .from("leases")
    .insert({ ...leaseData, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  await globalMutate("leases")
  return data
}

export async function updateLease(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("leases")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  await globalMutate("leases")
  return data
}

export async function addRentRecord(recordData: Record<string, unknown>) {
  const user = await fetchUser()
  if (!user) throw new Error("Not authenticated")
  const { data, error } = await supabase
    .from("rent_records")
    .insert({ ...recordData, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  await globalMutate("rent_records")
  return data
}

export async function updateRentRecord(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("rent_records")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  await globalMutate("rent_records")
  return data
}

export async function addPayment(paymentData: Record<string, unknown>) {
  const user = await fetchUser()
  if (!user) throw new Error("Not authenticated")
  const { data, error } = await supabase
    .from("payments")
    .insert({ ...paymentData, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  await globalMutate("payments")
  await globalMutate("rent_records")
  return data
}

export async function updateSettings(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("settings")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  await globalMutate("settings")
  return data
}

export async function deletePayment(id: string) {
  const { error } = await supabase.from("payments").delete().eq("id", id)
  if (error) throw error
  await globalMutate("payments")
  await globalMutate("rent_records")
}
