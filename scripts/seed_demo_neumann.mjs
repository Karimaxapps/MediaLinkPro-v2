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
    console.log('🎙️  Starting stub seed: Neumann...');

    try {
        console.log('\n🏢 Upserting organization Neumann...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Neumann',
                    slug: 'neumann',
                    logo_url:
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Georg_Neumann_GmbH_Logo.svg/1200px-Georg_Neumann_GmbH_Logo.svg.png',
                    tagline: 'Made in Germany. Trusted in studios worldwide.',
                    type: 'Solution Provider',
                    main_activity:
                        'High-end studio microphones, studio monitors and measurement microphones for recording, broadcast and mastering.',
                    description:
                        "Georg Neumann GmbH, founded in Berlin in 1928, is the world's leading manufacturer of studio condenser microphones. A Sennheiser company since 1991, Neumann is responsible for some of the most iconic microphone designs in history — the U 47, M 49, U 67 and U 87 — which have shaped the sound of recorded music, broadcast and cinema for nearly a century. Today Neumann continues that legacy with the U 87 Ai, TLM 103, TLM 49 and KM series small-diaphragm microphones, all hand-assembled in Berlin to exacting standards. Neumann microphones are found in every major recording studio, broadcast facility, post-production house and mastering suite in the world, trusted by producers, engineers and artists who demand absolute sonic accuracy and long-term reliability.",
                    website: 'https://www.neumann.com',
                    contact_email: 'info@neumann.com',
                    phone: '+49 30 417724 0',
                    country: 'Germany',
                    address: 'Ollenhauerstraße 98, 13403 Berlin, Germany',
                    linkedin_url: 'https://linkedin.com/company/neumann-berlin',
                    x_url: 'https://x.com/neumannberlin',
                    facebook_url: 'https://facebook.com/GeorgNeumannGmbH',
                    instagram_url: 'https://instagram.com/neumannberlin',
                    youtube_url: 'https://youtube.com/@NeumannBerlin',
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

        console.log('\n📦 Upserting products for Neumann...');
        const products = [
            {
                name: 'U 87 Ai',
                slug: 'neumann-u-87-ai',
                short_description:
                    'The world\'s most iconic large-diaphragm studio condenser microphone. Three polar patterns, transformerless output, and decades of proven performance.',
                description:
                    '<p>The <strong>Neumann U 87 Ai</strong> is the definitive large-diaphragm condenser microphone — a studio standard found in virtually every professional recording facility in the world. Evolved from the original U 87 introduced in 1967, the U 87 Ai delivers the warm, detailed Neumann sound that has defined countless classic recordings across every genre.</p><ul><li>Three switchable polar patterns: omnidirectional, cardioid, figure-8</li><li>Large dual-diaphragm capsule for natural, detailed transient response</li><li>Transformerless output for extremely low noise and high dynamic range</li><li>Self-noise: 12 dB-A — suitable for the quietest acoustic sources</li><li>Max SPL: 117 dB (127 dB with -10 dB pad)</li><li>High-pass filter at 80 Hz for proximity effect control</li><li>Available in nickel and matte black finishes</li></ul>',
                logo_url:
                    'https://assets.neumann.com/img/products/u87ai/u87ai_front_large.jpg',
                product_type: 'Hardware',
                main_category: 'Audio',
                sub_category: 'Microphones',
                gallery: [
                    'https://assets.neumann.com/img/products/u87ai/u87ai_front_large.jpg'
                ],
                price: 3599,
                pricing_model: 'One-time',
                price_upon_request: false,
                currency: 'USD'
            },
            {
                name: 'TLM 103',
                slug: 'neumann-tlm-103',
                short_description:
                    'Transformerless large-diaphragm cardioid condenser with extremely low self-noise. The studio workhorse for vocals, voiceover and acoustic instruments.',
                description:
                    '<p>The <strong>Neumann TLM 103</strong> is the professional studio condenser that brings legendary Neumann quality to a wider range of applications. Featuring the same capsule technology as the acclaimed U 87 Ai in a transformerless, cardioid-only design, the TLM 103 delivers extraordinarily low self-noise in a compact, versatile body.</p><ul><li>Cardioid polar pattern — optimised for vocals, voiceover and instruments</li><li>Transformerless circuit for extremely low noise: 7 dB-A self-noise</li><li>Max SPL: 138 dB — handles loud sources with ease</li><li>Subtle presence boost around 8–12 kHz adds clarity and air</li><li>Robust construction with elastic-mounted capsule for reduced handling noise</li><li>Ships with EA 1 elastic suspension shockmount</li></ul>',
                logo_url:
                    'https://assets.neumann.com/img/products/u87ai/u87ai_front_large.jpg',
                product_type: 'Hardware',
                main_category: 'Audio',
                sub_category: 'Microphones',
                gallery: [
                    'https://assets.neumann.com/img/products/u87ai/u87ai_front_large.jpg'
                ],
                price: 1699,
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
                        external_url: 'https://www.neumann.com/en-us/products',
                        support_url: 'https://www.neumann.com/en-us/service',
                        documentation_url: 'https://www.neumann.com/en-us/service/downloads',
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
        console.log(`Organization : Neumann`);
        console.log(`Slug         : neumann`);
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
