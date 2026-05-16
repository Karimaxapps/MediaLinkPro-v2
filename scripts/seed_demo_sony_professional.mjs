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

const shortId = () => crypto.randomBytes(4).toString('hex');

async function runSeed() {
    console.log('📷  Starting demo Sony Professional Solutions seed process...');

    const suffix = shortId();
    const demoEmail = `demo.sony_${suffix}@medialinkpro.com`;
    const demoPassword = 'password123';
    const orgId = crypto.randomUUID();

    try {
        // 1. CREATE USER
        console.log(`\n👤 Creating user account ${demoEmail}...`);
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email: demoEmail,
            password: demoPassword,
            email_confirm: true,
            user_metadata: {
                full_name: 'Kevin Yamamoto',
                avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop'
            }
        });
        if (userError) throw userError;
        const userId = userData.user.id;
        console.log('   ✅ User created.');

        await new Promise((r) => setTimeout(r, 1200));

        // 2. UPDATE PROFILE
        console.log('\n📋 Updating profile for Kevin Yamamoto...');
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                username: `kevinyamamoto_${suffix}`,
                full_name: 'Kevin Yamamoto',
                avatar_url:
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop',
                cover_url:
                    'https://images.unsplash.com/photo-1514896856000-91cb6de818e0?w=1600&auto=format&fit=crop',
                bio: 'Broadcast Solutions Specialist at Sony Professional Solutions, helping broadcasters, cinematographers and production facilities choose the right camera and production technology for their workflow.',
                about:
                    'I help broadcast and production clients find the right Sony Professional solutions — from cinema cameras and studio systems to IP live production infrastructure and production workflow servers. With a background in cinematography and 10+ years at Sony, I specialise in the Venice line of cinema cameras and the PWS production workflow server family, working closely with networks, studios and independent DPs across the US market.',
                headline: 'Broadcast Solutions Specialist · Sony Professional Solutions',
                company: 'Sony Professional Solutions',
                job_title: 'Broadcast Solutions Specialist',
                job_function: 'Business',
                website: 'https://pro.sony',
                portfolio_url: 'https://pro.sony/en_US/products',
                linkedin_url: 'https://linkedin.com/in/kevin-yamamoto-sony-demo',
                x_url: 'https://x.com/kevinyamamoto_pro',
                instagram_url: 'https://instagram.com/sonypro',
                youtube_url: 'https://youtube.com/@sonypro',
                tiktok_url: 'https://tiktok.com/@sonypro',
                facebook_url: 'https://facebook.com/sonyprofessional',
                contact_email_public: 'k.yamamoto@sony.demo',
                contact_email_public_enabled: true,
                contact_phone_public: '+1 201-930-1000',
                contact_phone_public_enabled: false,
                city: 'Park Ridge',
                country: 'United States',
                birth_date: '1983-02-28',
                hourly_rate: null,
                skills: [
                    'Cinema Cameras',
                    'Broadcast Systems',
                    'IP Live Production',
                    'Workflow Integration',
                    'Sony Venice',
                    'HDR Imaging',
                    'Production Servers',
                    'Pre-sales Engineering'
                ],
                followers_count: 6320,
                following_count: 470,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        if (profileError) throw profileError;
        console.log('   ✅ Profile updated.');

        // 3. CREATE ORGANIZATION (Solution Provider)
        console.log('\n🏢 Creating organization Sony Professional Solutions (Solution Provider)...');
        const orgSlug = `sony-professional-solutions-${suffix}`;
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    id: orgId,
                    name: 'Sony Professional Solutions',
                    slug: orgSlug,
                    logo_url:
                        'https://images.unsplash.com/photo-1514896856000-91cb6de818e0?w=300&h=300&auto=format&fit=crop',
                    tagline: 'Professional broadcast and AV technology that moves the world.',
                    type: 'Solution Provider',
                    main_activity:
                        'Broadcast cameras, cinema cameras, production workflow servers and professional AV equipment for broadcasters, studios and live production.',
                    description:
                        'Sony Professional Solutions is the professional and broadcast division of Sony Corporation, a global technology leader founded in 1946. From its US headquarters in Park Ridge, New Jersey, Sony Professional delivers world-class broadcast cameras, cinema imaging systems, production workflow infrastructure and professional AV solutions to networks, studios, sports broadcasters, cinematographers and live production operators worldwide. The Venice 2 full-frame cinema camera and PWS-4500 production workflow server represent the cutting edge of Sony\'s broadcast and cinema product lines, trusted by leading productions across film, television and live events.',
                    website: 'https://pro.sony',
                    contact_email: 'proav.info@sony.com',
                    phone: '+1 201-930-1000',
                    country: 'United States',
                    address: '1 Sony Drive, Park Ridge, NJ 07656, USA',
                    linkedin_url: 'https://linkedin.com/company/sony-professional-demo',
                    x_url: 'https://x.com/sonypro',
                    facebook_url: 'https://facebook.com/sonyprofessional',
                    instagram_url: 'https://instagram.com/sonypro',
                    tiktok_url: 'https://tiktok.com/@sonypro',
                    youtube_url: 'https://youtube.com/@sonypro',
                    is_stub: true,
                    source: 'admin_seed',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'slug' }
            )
            .select()
            .single();
        if (orgError) throw orgError;
        const actualOrgId = orgData.id;
        console.log('   ✅ Organization created.');

        // 4. MEMBERSHIP (owner)
        console.log('\n🤝 Linking user as owner...');
        const { error: memberError } = await supabase
            .from('organization_members')
            .upsert(
                { organization_id: actualOrgId, user_id: userId, role: 'owner' },
                { onConflict: 'organization_id,user_id' }
            );
        if (memberError) throw memberError;
        console.log('   ✅ Membership set.');

        // 5. CREATE PRODUCTS
        console.log('\n📦 Creating products for Sony Professional Solutions...');
        const products = [
            {
                name: 'Venice 2',
                slug: `sony-venice-2-${shortId()}`,
                short_description:
                    'Full-frame cinema camera with 8.6K sensor, dual base ISO and anamorphic de-squeeze. The benchmark for cinematic imaging.',
                description:
                    '<p>The <strong>Sony Venice 2</strong> is Sony\'s flagship full-frame cinema camera, setting the standard for cinematic imaging in feature film, episodic television and high-end commercial production. Built around an 8.6K full-frame image sensor with dual base ISO (800 and 3200), Venice 2 delivers extraordinary dynamic range, exceptional low-light performance and stunning colour reproduction in a compact, ergonomically refined body.</p><ul><li>8.6K full-frame CMOS sensor with 15+ stops of dynamic range</li><li>Dual base ISO: 800 and 3200 for versatile low-light performance</li><li>Anamorphic de-squeeze support: 1.3x, 1.5x, 1.8x, 2x</li><li>Sony X-OCN and XAVC internal recording</li><li>AXS-R7 external raw recorder for 8K X-OCN LT/ST/XT</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1617839625591-e5a789593135?w=300&h=300&auto=format&fit=crop',
                product_type: 'Hardware',
                main_category: 'Cameras & Acquisition',
                sub_category: 'Cinema Cameras',
                gallery: [
                    'https://images.unsplash.com/photo-1617839625591-e5a789593135?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1585868408354-0562b5b2ec29?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&auto=format&fit=crop'
                ],
                price: 42000,
                pricing_model: 'One-time',
                price_upon_request: false,
                currency: 'USD'
            },
            {
                name: 'PWS-4500 Production Workflow Server',
                slug: `sony-pws-4500-${shortId()}`,
                short_description:
                    'Scalable production workflow server for ingest, transcode, browse proxy and media management in broadcast and studio environments.',
                description:
                    '<p>The <strong>Sony PWS-4500</strong> is a high-performance production workflow server designed for demanding broadcast and studio environments. Built to handle simultaneous ingest, transcoding, browse proxy generation and media management, the PWS-4500 integrates seamlessly into Sony\'s IP Live production ecosystem and third-party NLE and MAM environments.</p><ul><li>Simultaneous record/playback of up to 32 channels</li><li>Supports HD, 4K and HDR formats including XAVC and ProRes</li><li>Automatic browse proxy generation for NLE integration</li><li>High-speed fibre and 10GbE connectivity</li><li>Integration with Sony\'s Ci Media Cloud and third-party MAM systems</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&auto=format&fit=crop',
                product_type: 'Hardware',
                main_category: 'Storage & Asset Management',
                sub_category: 'Production Server',
                gallery: [
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop'
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
                        organization_id: actualOrgId,
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
                        external_url: 'https://pro.sony/en_US/products',
                        support_url: 'https://pro.sony/en_US/support',
                        documentation_url: 'https://pro.sony/en_US/resources',
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
            console.log(`   ✅ Product created: ${p.name}`);
        }

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Demo User    : ${demoEmail}`);
        console.log(`Password     : ${demoPassword}`);
        console.log(`User ID      : ${userId}`);
        console.log(`Organization : Sony Professional Solutions (Solution Provider)`);
        console.log(`Org slug     : ${orgSlug}`);
        console.log(`Org ID       : ${actualOrgId}`);
        console.log(`Products     : ${products.length} created`);
        console.log('---------------------------------------------');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }
}

runSeed();
