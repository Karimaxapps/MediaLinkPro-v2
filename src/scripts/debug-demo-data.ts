
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugDemoData() {
    console.log('Debugging Demo Data Visibility...');

    const slug = 'streamcore-v4';

    console.log(`\nFetching product with slug: ${slug}...`);
    const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
      *,
      organizations (
        id,
        name,
        slug,
        logo_url
      )
    `)
        .eq('slug', slug)
        .single();

    if (productError) {
        console.error('Error fetching product:', productError);
    } else {
        // Concise logging
        console.log(`Product: ${product?.name} (ID: ${product?.id})`);
        console.log(`Organization: ${product?.organizations?.name} (ID: ${product?.organizations?.id})`);
        console.log(`Org Logo: ${product?.organizations?.logo_url}`);

        if (product) {
            // 2. Fetch Product Experts
            const { data: experts, error: expertsError } = await supabase
                .from('product_experts')
                .select('id, user_id, expertise_level')
                .eq('product_id', product.id);

            if (expertsError) console.error('Error fetching experts:', expertsError);
            else {
                console.log(`Experts Found: ${experts?.length}`);
                experts?.forEach(e => console.log(`- ExpertUser: ${e.user_id} (${e.expertise_level})`));
            }

            // 3. Check Organization Members
            if (product.organization_id) {
                const { data: members, error: membersError } = await supabase
                    .from('organization_members')
                    .select('user_id, role')
                    .eq('organization_id', product.organization_id);

                if (membersError) console.error('Error fetching members:', membersError);
                else {
                    console.log(`Org Members Found: ${members?.length}`);
                    members?.forEach(m => console.log(`- MemberUser: ${m.user_id} (${m.role})`));
                }
            }
        }
    }
}

debugDemoData();
