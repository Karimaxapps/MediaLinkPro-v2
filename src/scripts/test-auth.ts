import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function test() {
    console.log('Testing listUsers...');
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('List users error:', error);
    } else {
        console.log('Users found:', data.users.length);
        data.users.forEach(u => console.log(u.email, u.id));
    }
}

test();
