import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Job functions ──────────────────────────────────────────────────────────────

export async function saveJob(job: {
  chain_job_id: string
  title: string
  category: string
  budget: number
  deadline: string
  description: string
  evaluator: string
  poster_address: string
  tx_hash: string
}) {
  const { data, error } = await supabase
    .from('jobs')
    .insert([{ ...job, status: 'open' }])
    .select()

  if (error) console.error('Error saving job:', error)
  return data
}

export async function getJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) console.error('Error fetching jobs:', error)
  return data || []
}

// ── Agent functions ────────────────────────────────────────────────────────────

export async function saveAgent(agent: {
  chain_agent_id: string
  name: string
  wallet_address: string
  capabilities: string[]
  agent_type: string
  version: string
  metadata_uri: string
  tx_hash: string
}) {
  const { data, error } = await supabase
    .from('agents')
    .insert([agent])
    .select()

  if (error) console.error('Error saving agent:', error)
  return data
}

export async function getAgents() {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) console.error('Error fetching agents:', error)
  return data || []
}