import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      throw new Error('Unauthorized')
    }

    if (!user.email) {
      console.error('No email found for user:', user.id)
      throw new Error('User email is required')
    }

    const { priceId } = await req.json()

    if (!priceId) {
      throw new Error('Price ID is required')
    }

    console.log('Initializing Stripe...')
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // First check if customer exists in our database
    console.log('Checking for existing customer in database...')
    const { data: existingCustomer, error: customerError } = await supabaseClient
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    if (customerError) {
      console.error('Error fetching customer from database:', customerError)
      throw new Error('Failed to check existing customer')
    }

    let customerId = existingCustomer?.stripe_customer_id

    if (!customerId) {
      console.log('No existing customer found, checking Stripe for existing customer with email:', user.email)
      
      // Check if customer already exists in Stripe
      const existingStripeCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      })

      if (existingStripeCustomers.data.length > 0) {
        console.log('Found existing Stripe customer')
        customerId = existingStripeCustomers.data[0].id
      } else {
        console.log('Creating new Stripe customer...')
        try {
          const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
              supabase_user_id: user.id,
            },
          })
          customerId = customer.id
          console.log('Stripe customer created successfully:', customerId)
        } catch (stripeError) {
          console.error('Stripe customer creation error:', stripeError)
          throw new Error(`Failed to create Stripe customer: ${stripeError.message}`)
        }
      }

      // Store the customer ID in our database
      console.log('Saving customer ID to database...')
      const { error: insertError } = await supabaseClient
        .from('customers')
        .insert([{ 
          id: user.id, 
          stripe_customer_id: customerId 
        }])

      if (insertError) {
        console.error('Error saving customer to database:', insertError)
        throw new Error(`Failed to save customer to database: ${insertError.message}`)
      }
    }

    console.log('Creating checkout session for customer:', customerId)
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/pricing`,
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          supabase_user_id: user.id,
        },
      },
    })

    console.log('Checkout session created:', session.id)
    
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in create-checkout function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})