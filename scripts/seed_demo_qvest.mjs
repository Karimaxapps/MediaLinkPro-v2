import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Key. Please ensure .env.local is present.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const ADMIN_USER_ID = 'b713cc88-78fa-472a-bb8a-46eef3c1d5ea';

const LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Qvest_logo.svg/1200px-Qvest_logo.svg.png';
const LOGO_FALLBACK = 'https://pbs.twimg.com/profile_images/1544671555951091712/QYJr3YbZ_400x400.jpg';
const PRODUCT_IMAGE_URL = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80';

async function runSeed() {
    console.log('🌐  Starting stub seed: Qvest...');

    try {
        // 1. UPSERT ORGANIZATION
        console.log('\n🏢 Upserting organization Qvest...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Qvest',
                    slug: 'qvest',
                    logo_url: LOGO_URL,
                    tagline: 'Global media technology consultancy and system integrator delivering end-to-end broadcast infrastructure, IP media workflows, and digital transformation for the world\'s leading broadcasters and streaming platforms.',
                    type: 'System Integrator',
                    main_activity: 'Media Technology',
                    description:
                        'Global media technology consultancy and system integrator delivering end-to-end broadcast infrastructure, IP media workflows, and digital transformation for the world\'s leading broadcasters and streaming platforms.',
                    website: 'https://qvest.com',
                    is_stub: true,
                    claimed_at: null,
                    source: 'admin_seed',
                    seeded_by: ADMIN_USER_ID,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'slug' }
            )
            .select()
            .single();
        if (orgError) throw orgError;
        const orgId = orgData.id;
        console.log('   ✅ Organization upserted. ID:', orgId);

        // 2. UPSERT PRODUCT
        console.log('\n📦 Upserting product for Qvest...');
        const { error: prodError } = await supabase
            .from('products')
            .upsert(
                {
                    id: crypto.randomUUID(),
                    organization_id: orgId,
                    name: 'Media Technology Consulting & Integration',
                    slug: 'media-technology-consulting-integration',
                    short_description:
                        'End-to-end media technology consulting and system integration for broadcast, OTT, and media companies.',
                    description:
                        '<p><strong>Qvest Media Technology Consulting & Integration</strong> delivers end-to-end media technology expertise for the world\'s most complex broadcast and streaming environments.</p><ul><li>Broadcast infrastructure design and IP media workflow implementation</li><li>Cloud-native media architecture and OTT platform engineering</li><li>System integration for playout, production, and media asset management</li><li>Digital transformation strategy for broadcasters and streaming platforms</li><li>Project management and vendor-neutral technology selection</li><li>Post-implementation support and managed services</li></ul>',
                    logo_url: LOGO_URL,
                    product_type: 'Service',
                    main_category: 'Media Technology',
                    sub_category: 'Other',
                    gallery_urls: [PRODUCT_IMAGE_URL],
                    external_url: 'https://qvest.com/services',
                    support_url: 'https://qvest.com/contact',
                    availability_status: 'Available',
                    price: null,
                    currency: 'USD',
                    price_upon_request: true,
                    pricing_model: 'Custom Quote',
                    is_public: true,
                    status: 'published',
                    views_count: Math.floor(Math.random() * 4000) + 800,
                    bookmarks_count: Math.floor(Math.random() * 80) + 10,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'organization_id,slug' }
            );
        if (prodError) throw prodError;
        console.log('   ✅ Product upserted: Media Technology Consulting & Integration');

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Organization : Qvest`);
        console.log(`Slug         : qvest`);
        console.log(`Org ID       : ${orgId}`);
        console.log(`HQ           : Cologne, Germany`);
        console.log(`Status       : Stub (unclaimed, claimable)`);
        console.log(`Logo         : ${LOGO_URL}`);
        console.log(`Logo fallback: ${LOGO_FALLBACK}`);
        console.log(`Products     : 1 upserted`);
        console.log('---------------------------------------------');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }
}

runSeed();
