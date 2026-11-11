import {createClient} from 'npm:@supabase/supabase-js@2';
import {paymentHandler} from './handler.ts';
Deno.serve(paymentHandler({db:createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!),env:name=>Deno.env.get(name),fetch}));
