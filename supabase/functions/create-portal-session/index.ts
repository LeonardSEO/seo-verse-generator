import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header')
      throw new Error('No authorization header')
    }

    // Create Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from the JWT token
    const token = authHeader.replace('Bearer ', '')
    console.log('Attempting to get user with token:', token.substring(0, 10) + '...')
    
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError) {
      console.error('User fetch error:', userError)
      throw new Error('Unauthorized')
    }

    if (!user) {
      console.error('No user found')
      throw new Error('No user found')
    }

    console.log('Authenticated user:', user.id)

    // Get customer from database
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (customerError) {
      console.error('Customer fetch error:', customerError)
      throw new Error('No customer found')
    }

    if (!customer?.stripe_customer_id) {
      console.error('No Stripe customer ID found')
      throw new Error('No Stripe customer found')
    }

    console.log('Found customer:', customer.stripe_customer_id)

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Get the origin from the request headers or use the production URL as fallback
    const origin = req.headers.get('origin') || 'https://seo-verse-generator.lovable.app'
    console.log('Using return URL with origin:', origin)

    // Create portal session
    const { url } = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${origin}/settings`,
    })

    console.log('Created portal session with URL:', url)

    return new Response(
      JSON.stringify({ url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Portal session error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' ? 401 : 400,
      }
    )
  }
})