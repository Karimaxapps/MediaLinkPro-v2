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
    console.log('🎧  Starting stub seed: Sennheiser...');

    try {
        console.log('\n🏢 Upserting organization Sennheiser...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Sennheiser',
                    slug: 'sennheiser',
                    logo_url:
                        'https://ejuqifpwfrtiwyzeytax.supabase.co/storage/v1/object/public/organizations/logos/sennheiser_logo.png',
                    tagline: 'Shaping the future of audio.',
                    type: 'Solution Provider',
                    main_activity:
                        'Professional microphones, headphones and wireless audio systems for broadcast, live sound, recording studios and cinema.',
                    description:
                        "Sennheiser is a world-leading audio company founded in 1945 in Wedemark, Germany. With over 75 years of innovation, Sennheiser develops and manufactures professional microphones, wireless systems, headphones and conferencing solutions trusted by broadcast engineers, sound designers, musicians and audio professionals worldwide. From the iconic MKH 416 shotgun microphone to the Evolution Wireless Digital system, Sennheiser products are deployed on film sets, broadcast studios, live stages and houses of worship across every continent. The company's professional division serves broadcasters, rental companies, post-production facilities and live event operators with products engineered to deliver exceptional reliability and sonic performance in the most demanding environments.",
                    website: 'https://www.sennheiser.com/en-US/professional',
                    contact_email: 'pro@sennheiser.com',
                    phone: '+49 5130 600 0',
                    country: 'Germany',
                    address: 'Am Labor 1, 30900 Wedemark, Germany',
                    linkedin_url: 'https://linkedin.com/company/sennheiser',
                    x_url: 'https://x.com/sennheiser',
                    facebook_url: 'https://facebook.com/sennheiser',
                    instagram_url: 'https://instagram.com/sennheiser',
                    youtube_url: 'https://youtube.com/@sennheiser',
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

        console.log('\n📦 Upserting products for Sennheiser...');
        const products = [
            {
                name: 'MKH 416',
                slug: 'sennheiser-mkh-416',
                short_description:
                    'Industry-standard short shotgun interference-tube microphone for broadcast, film and ENG. The most widely used on-location microphone in the world.',
                description:
                    '<p>The <strong>Sennheiser MKH 416</strong> is the benchmark short shotgun microphone for professional film, broadcast and ENG production. Its interference-tube design delivers precise directional pickup with outstanding rejection of off-axis noise, making it the first choice of location sound recordists and boom operators worldwide for over four decades.</p><ul><li>Supercardioid/lobar polar pattern via interference tube principle</li><li>Frequency response: 40 Hz – 20 kHz</li><li>High RF condenser capsule — extremely low sensitivity to humidity and temperature</li><li>Low self-noise: 13 dB(A)</li><li>Max SPL: 130 dB (with 10 dB pad: 140 dB)</li><li>Compact, lightweight design ideal for boom pole and camera mounting</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&auto=format&fit=crop',
                product_type: 'Hardware',
                main_category: 'Audio',
                sub_category: 'Microphones',
                gallery: [
                    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=1200&auto=format&fit=crop'
                ],
                price: 999,
                pricing_model: 'One-time',
                price_upon_request: false,
                currency: 'USD'
            },
            {
                name: 'Evolution Wireless Digital (EW-D)',
                slug: 'sennheiser-ew-d',
                short_description:
                    'Next-generation digital wireless system with auto-scan, AES-256 encryption and seamless channel switching for broadcast and live production.',
                description:
                    '<p>The <strong>Sennheiser Evolution Wireless Digital (EW-D)</strong> is the professional digital wireless system designed for broadcast, live event and theatre applications. Building on decades of wireless expertise, EW-D delivers pristine 24-bit/48 kHz audio, robust RF performance and an intuitive workflow engineered for professional rental and touring environments.</p><ul><li>24-bit/48 kHz audio codec for broadcast-quality wireless audio</li><li>Dynamic frequency selection and auto-scan for fast deployment</li><li>AES-256 encryption for secure transmission</li><li>Latency: 1.9 ms for transparent sound reinforcement</li><li>Up to 90 m range (line of sight)</li><li>Available in handheld, bodypack, headset and instrument configurations</li><li>Control and monitoring via Smart Assist app or Sennheiser Control Cockpit software</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&auto=format&fit=crop',
                product_type: 'Hardware',
                main_category: 'Audio',
                sub_category: 'Wireless Systems',
                gallery: [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=1200&auto=format&fit=crop'
                ],
                price: 1199,
                pricing_model: 'One-time',
                price_upon_request: false,
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
                        external_url: 'https://www.sennheiser.com/en-US/professional',
                        support_url: 'https://www.sennheiser.com/en-US/support',
                        documentation_url: 'https://www.sennheiser.com/en-US/downloads',
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
        console.log(`Organization : Sennheiser`);
        console.log(`Slug         : sennheiser`);
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
