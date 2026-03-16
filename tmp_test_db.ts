
import { createClient } from './src/lib/supabase/server'

async function test() {
  const supabase = await createClient()
  
  console.log('Testing connection...')
  const { data: profiles, error: pError } = await supabase.from('profiles').select('count').limit(1)
  if (pError) console.error('Profiles error:', pError)
  else console.log('Profiles check: OK')

  console.log('Testing memberships...')
  const { data: mems, error: mError } = await supabase.from('memberships').select('count', { count: 'exact' }).limit(1)
  if (mError) console.error('Memberships error:', mError)
  else console.log('Memberships check: OK', mems)

  console.log('Testing payment_receipts...')
  const { data: receipts, error: rError } = await supabase.from('payment_receipts').select('count').limit(1)
  if (rError) console.error('Payment Receipts error (mismatch?):', rError)
  else console.log('Payment Receipts check: OK')
}

// Note: This won't run directly because it uses imports and server-side logic
// but I'm thinking about how to test.
