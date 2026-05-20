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

async function runSeed() {
    console.log('🎤  Starting stub seed: Shure...');

    try {
        console.log('\n🏢 Upserting organization Shure...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Shure',
                    slug: 'shure',
                    logo_url:
                        'https://ejuqifpwfrtiwyzeytax.supabase.co/storage/v1/object/public/organizations/logos/shure_logo.png',
                    tagline: 'Quality. Reliability. Trust.',
                    type: 'Solution Provider',
                    main_activity:
                        'Professional microphones, wireless systems, in-ear monitoring and audio networking solutions for broadcast, live sound, recording and conferencing.',
                    description:
                        "Shure Incorporated is the world's leading manufacturer of microphones and audio electronics, founded in Chicago in 1925 by Sidney N. Shure. For 100 years, Shure has built a reputation for uncompromising audio quality, legendary reliability and relentless innovation. From the SM57 and SM58 — the best-selling microphones in history — to the Axient Digital wireless system and the QLXD and ULXD professional wireless series, Shure products are trusted by broadcasters, musicians, houses of worship, corporate AV professionals and audio engineers in over 100 countries. The company's portfolio spans wired and wireless microphones, in-ear monitors, network audio and conferencing systems, all backed by Shure's century-long commitment to engineering excellence and customer support.",
                    website: 'https://www.shure.com/en-US/professional',
                    contact_email: 'info@shure.com',
                    phone: '+1 847-600-2000',
                    country: 'United States',
                    address: '5800 W Touhy Ave, Niles, IL 60714, USA',
                    linkedin_url: 'https://linkedin.com/company/shure',
                    x_url: 'https://x.com/shure',
                    facebook_url: 'https://facebook.com/shure',
                    instagram_url: 'https://instagram.com/shure',
                    youtube_url: 'https://youtube.com/@shure',
                    is_stub: true,
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

        console.log('\n📦 Upserting products for Shure...');
        const products = [
            {
                name: 'SM7B',
                slug: 'shure-sm7b',
                short_description:
                    'Legendary cardioid dynamic microphone with A/D converter and switchable high-pass filter. The gold standard for voiceover, podcast and broadcast.',
                description:
                    '<p>The <strong>Shure SM7B</strong> is one of the most recognizable and widely used broadcast microphones in the world. A broadcast-quality dynamic microphone with a smooth, flat, wide-range frequency response, the SM7B has been the choice of broadcasters, podcasters and voiceover artists for decades — most famously used to record Michael Jackson\'s <em>Thriller</em> album.</p><ul><li>Cardioid dynamic cartridge — wide frequency response (50 Hz – 20 kHz)</li><li>Air suspension shock isolation eliminates mechanical noise and vibration</li><li>Advanced electromagnetic shielding rejects hum from computer monitors and other electrical devices</li><li>Switchable bass roll-off and mid-range presence boost</li><li>Detachable close-talk windscreen and stand adapter included</li><li>Yoke mount for precise positioning on boom arms and studio stands</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&auto=format&fit=crop',
                product_type: 'Hardware',
                main_category: 'Audio',
                sub_category: 'Microphones',
                gallery: [
                    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=1200&auto=format&fit=crop'
                ],
                price: 399,
                pricing_model: 'One-time',
                price_upon_request: false,
                currency: 'USD'
            },
            {
                name: 'Axient Digital',
                slug: 'shure-axient-digital',
                short_description:
                    'Professional digital wireless with ShowLink remote control, AES-256 encryption and Quadversity diversity for broadcast and touring.',
                description:
                    '<p>The <strong>Shure Axient Digital</strong> is the pinnacle of Shure\'s professional wireless portfolio, designed for the most demanding broadcast, theatrical and large-scale live production environments. Axient Digital combines pristine 24-bit digital audio with the industry\'s most advanced RF management features, including Quadversity antenna diversity and real-time ShowLink remote control of transmitters — even during a live performance.</p><ul><li>24-bit/48 kHz digital audio with Shure\'s proprietary codec</li><li>Quadversity (4-antenna) diversity for maximum RF reliability in RF-congested environments</li><li>ShowLink remote control: adjust transmitter gain, mute, and RF power mid-show</li><li>AES-256 encryption for secure mission-critical applications</li><li>Automatic frequency management and Interference Detection &amp; Avoidance (IDA)</li><li>Compatible with Shure Wireless Workbench and Shure Designer software</li><li>Interchangeable with ULX-D bodypack and handheld transmitters</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&auto=format&fit=crop',
                product_type: 'Hardware',
                main_category: 'Audio',
                sub_category: 'Wireless Systems',
                gallery: [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop'
                ],
                price: null,
                pricing_model: 'Custom Quote',
                price_upon_request: true,
                currency: 'USD'
            }
        ];

        for (const p of products) {
            const { error: prodError } = await supabase
                .from('products')
                .upsert(
                    {
                        id: crypto.randomUUID(),
                        organization_id: orgId,
                        name: p.name,
                        slug: p.slug,
                        description: p.description,
                        logo_url: p.logo_url,
                        is_public: true,
                        product_type: p.product_type,
                        main_category: p.main_category,
                        sub_category: p.sub_category,
                        short_description: p.short_description,
                        gallery_urls: p.gallery,
                        external_url: 'https://www.shure.com/en-US/professional',
                        support_url: 'https://www.shure.com/en-US/support',
                        documentation_url: 'https://www.shure.com/en-US/support/find-an-answer',
                        availability_status: 'Available',
                        price: p.price,
                        currency: p.currency,
                        price_upon_request: p.price_upon_request,
                        pricing_model: p.pricing_model,
                        status: 'published',
                        views_count: Math.floor(Math.random() * 7000) + 2500,
                        bookmarks_count: Math.floor(Math.random() * 180) + 30,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    },
                    { onConflict: 'organization_id,slug' }
                );
            if (prodError) throw prodError;
            console.log(`   ✅ Product upserted: ${p.name}`);
        }

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Organization : Shure`);
        console.log(`Slug         : shure`);
        console.log(`Org ID       : ${orgId}`);
        console.log(`Status       : Stub (unclaimed, claimable)`);
        console.log(`Products     : ${products.length} upserted`);
        console.log('---------------------------------------------');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }
}

runSeed();
