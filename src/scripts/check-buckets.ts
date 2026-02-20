
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

// Try with service key if available (admin)
const supabase = createClient(supabaseUrl, serviceKey || supabaseKey);

async function listBuckets() {
    console.log('Checking buckets...');
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error listing buckets:', error.message);
        return;
    }

    console.log('Buckets found:');
    data.forEach(b => console.log(`- ${b.name} (public: ${b.public})`));

    const productsBucket = data.find(b => b.name === 'products');
    if (!productsBucket) {
        console.log('\n❌ "products" bucket NOT found.');
        if (serviceKey) {
            console.log('Attempting to create "products" bucket with service key...');
            const { data: bucket, error: createError } = await supabase.storage.createBucket('products', {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
            });
            if (createError) {
                console.error('Failed to create bucket:', createError.message);
            } else {
                console.log('✅ Successfully created "products" bucket!');
            }
        } else {
            console.log('No service key available to create bucket automatically.');
        }
    } else {
        console.log('\n✅ "products" bucket found.');
    }
}

console.log('Service Key Access:', !!serviceKey);
listBuckets();
