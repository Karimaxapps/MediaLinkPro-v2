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
    console.log('🎬 Starting demo PRODUCTION COMPANY seed process...');

    const suffix = shortId();
    const demoEmail = `demo.production_${suffix}@medialinkpro.com`;
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
                full_name: 'Maya Cortez',
                avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop'
            }
        });
        if (userError) throw userError;
        const userId = userData.user.id;
        console.log('   ✅ User created.');

        // Wait for trigger to create profile row
        await new Promise((r) => setTimeout(r, 1200));

        // 2. UPDATE PROFILE
        console.log('\n📋 Updating profile for Maya Cortez...');
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                username: `mayacortez_${suffix}`,
                full_name: 'Maya Cortez',
                avatar_url:
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop',
                cover_url:
                    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&auto=format&fit=crop',
                bio: 'Founder & Executive Producer at Lumen Frame Studios. 12+ years directing high-end commercials, branded documentaries and original episodic content. Cannes Lions and Telly Award winner.',
                about:
                    'I lead a full-service production house specializing in cinematic storytelling for global brands and streaming platforms. From concept and pre-production to final delivery, our team handles every step in-house — directors, DPs, editors, colorists and sound designers under one roof.',
                headline: 'Executive Producer & Founder · Lumen Frame Studios',
                company: 'Lumen Frame Studios',
                job_title: 'Executive Producer & Founder',
                job_function: 'Creative',
                website: 'https://www.lumenframe.demo',
                portfolio_url: 'https://portfolio.lumenframe.demo/maya',
                linkedin_url: 'https://linkedin.com/in/maya-cortez-demo',
                x_url: 'https://x.com/mayacortez_film',
                instagram_url: 'https://instagram.com/mayacortez.bts',
                youtube_url: 'https://youtube.com/@lumenframestudios',
                tiktok_url: 'https://tiktok.com/@lumenframe',
                facebook_url: 'https://facebook.com/lumenframestudios',
                contact_email_public: 'maya@lumenframe.demo',
                contact_email_public_enabled: true,
                contact_phone_public: '+1 (323) 555-0142',
                contact_phone_public_enabled: true,
                city: 'Los Angeles',
                country: 'United States',
                birth_date: '1987-06-14',
                hourly_rate: 350,
                skills: [
                    'Directing',
                    'Executive Producing',
                    'Commercial Production',
                    'Documentary Filmmaking',
                    'Branded Content',
                    'Show-running',
                    'Creative Direction',
                    'Post-Production Supervision'
                ],
                followers_count: 8420,
                following_count: 612,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        if (profileError) throw profileError;
        console.log('   ✅ Profile updated.');

        // 3. CREATE ORGANIZATION (Production Company)
        console.log('\n🏢 Creating organization Lumen Frame Studios (Production Company)...');
        const orgSlug = `lumen-frame-studios-${suffix}`;
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    id: orgId,
                    name: 'Lumen Frame Studios',
                    slug: orgSlug,
                    logo_url:
                        'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=300&auto=format&fit=crop',
                    tagline: 'Cinematic stories. Crafted end-to-end.',
                    type: 'Production Company',
                    main_activity:
                        'Full-service film, commercial and branded content production with in-house post.',
                    description:
                        'Lumen Frame Studios is an award-winning Los Angeles based production company delivering premium cinematic content for global brands, streaming platforms and broadcasters. We unite a roster of directors, DPs, producers, editors and colorists under one roof to take projects from idea to final master with uncompromising craft. Recent clients include Apple, Nike, Netflix, Hulu and the BBC.',
                    website: 'https://www.lumenframe.demo',
                    contact_email: 'hello@lumenframe.demo',
                    phone: '+1 (323) 555-0142',
                    country: 'United States',
                    address: '1840 N Highland Ave, Los Angeles, CA 90028',
                    linkedin_url: 'https://linkedin.com/company/lumen-frame-studios-demo',
                    x_url: 'https://x.com/lumenframe',
                    facebook_url: 'https://facebook.com/lumenframestudios',
                    instagram_url: 'https://instagram.com/lumenframestudios',
                    tiktok_url: 'https://tiktok.com/@lumenframe',
                    youtube_url: 'https://youtube.com/@lumenframestudios',
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

        // 5. CREATE SERVICES (products with product_type = 'Service')
        console.log('\n📦 Creating services for Lumen Frame Studios...');
        const services = [
            {
                name: 'Commercial Production',
                slug: `commercial-production-${shortId()}`,
                short_description:
                    'End-to-end TVC and digital commercial production for global brands.',
                description:
                    '<p>From creative development through final delivery, we produce <strong>broadcast-ready commercials</strong> for global brands and agencies. Our directors and DPs craft cinematic, performance-driven films across every format and platform.</p><ul><li>Concept &amp; treatment development</li><li>Casting, location scouting &amp; permits</li><li>Full crew &amp; equipment packages (RED, ARRI, Sony Venice)</li><li>Post-production, color &amp; sound design in-house</li><li>Versioning for TV, OLV, social and OOH</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1500916432543-2c9579e0a3ba?w=300&h=300&auto=format&fit=crop',
                main_category: 'Live & Post Production',
                sub_category: 'Live Production Systems',
                gallery: [
                    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=1200&auto=format&fit=crop'
                ],
                price: 75000,
                pricing_model: 'Custom Quote',
                price_upon_request: false
            },
            {
                name: 'Branded Documentary Production',
                slug: `branded-documentary-${shortId()}`,
                short_description:
                    'Long-form, story-driven brand documentaries for streaming and owned channels.',
                description:
                    '<p>We produce <strong>character-led brand documentaries</strong> — from 5-minute films for owned channels to 60-minute features for streaming platforms. Our team has shipped Emmy-nominated work for Apple, Patagonia and the BBC.</p><ul><li>Story development &amp; subject research</li><li>Verite &amp; interview-led directing</li><li>Multi-country logistics &amp; fixers</li><li>Archive licensing &amp; clearances</li><li>Festival &amp; platform delivery (Netflix, Hulu, Prime)</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=300&auto=format&fit=crop',
                main_category: 'Live & Post Production',
                sub_category: 'Other',
                gallery: [
                    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&auto=format&fit=crop'
                ],
                price: null,
                pricing_model: 'Custom Quote',
                price_upon_request: true
            },
            {
                name: 'Post-Production & Color Grading Suite',
                slug: `post-production-color-${shortId()}`,
                short_description:
                    'Editorial, online finishing, color grading and Dolby Atmos sound mix.',
                description:
                    '<p>Our in-house finishing facility offers <strong>full episodic and feature post-production</strong>: offline edit, online conform, HDR color grade and immersive audio mix. DaVinci Resolve and Avid certified suites with 4K HDR reference monitoring.</p><ul><li>Avid Media Composer &amp; DaVinci Resolve edit suites</li><li>HDR Dolby Vision &amp; HDR10 grading</li><li>Dolby Atmos 7.1.4 mix stage</li><li>VFX compositing &amp; clean-up (Nuke, After Effects)</li><li>IMF, ProRes and broadcast deliverables</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&h=300&auto=format&fit=crop',
                main_category: 'Live & Post Production',
                sub_category: 'Color Grading',
                gallery: [
                    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&auto=format&fit=crop'
                ],
                price: 1800,
                pricing_model: 'Rental',
                price_upon_request: false
            },
            {
                name: 'Virtual Production Stage Rental',
                slug: `virtual-production-stage-${shortId()}`,
                short_description:
                    '40ft LED volume with Unreal Engine stage operations and tracking.',
                description:
                    '<p>Our <strong>40ft x 18ft LED volume</strong> uses ROE Black Pearl panels driven by disguise media servers and Unreal Engine. Includes stYpe RedSpy camera tracking, in-house Unreal artists and a fully crewed stage.</p><ul><li>2.8mm pixel pitch curved LED wall + ceiling</li><li>Unreal Engine 5 stage operators</li><li>stYpe RedSpy &amp; Mo-Sys camera tracking</li><li>Adjacent green-screen extension stage</li><li>Pre-vis &amp; tech-vis services</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1593435450012-da7eedd2ace5?w=300&h=300&auto=format&fit=crop',
                main_category: 'Graphics, VFX & Virtual Production',
                sub_category: 'Virtual Studio Systems',
                gallery: [
                    'https://images.unsplash.com/photo-1593435450012-da7eedd2ace5?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1551817958-d9d86fb29431?w=1200&auto=format&fit=crop'
                ],
                price: 12500,
                pricing_model: 'Rental',
                price_upon_request: false
            }
        ];

        for (const svc of services) {
            const { error: prodError } = await supabase
                .from('products')
                .upsert(
                    {
                        id: crypto.randomUUID(),
                        organization_id: actualOrgId,
                        name: svc.name,
                        slug: svc.slug,
                        description: svc.description,
                        logo_url: svc.logo_url,
                        is_public: true,
                        product_type: 'Service',
                        main_category: svc.main_category,
                        sub_category: svc.sub_category,
                        short_description: svc.short_description,
                        gallery_urls: svc.gallery,
                        external_url: 'https://www.lumenframe.demo/services',
                        support_url: 'https://support.lumenframe.demo',
                        documentation_url: 'https://www.lumenframe.demo/services',
                        availability_status: 'Available',
                        price: svc.price,
                        currency: 'USD',
                        price_upon_request: svc.price_upon_request,
                        pricing_model: svc.pricing_model,
                        status: 'published',
                        views_count: Math.floor(Math.random() * 4000) + 500,
                        bookmarks_count: Math.floor(Math.random() * 80) + 5,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    },
                    { onConflict: 'organization_id,slug' }
                );
            if (prodError) throw prodError;
            console.log(`   ✅ Service created: ${svc.name}`);
        }

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Demo User    : ${demoEmail}`);
        console.log(`Password     : ${demoPassword}`);
        console.log(`User ID      : ${userId}`);
        console.log(`Organization : Lumen Frame Studios (Production Company)`);
        console.log(`Org slug     : ${orgSlug}`);
        console.log(`Org ID       : ${actualOrgId}`);
        console.log(`Services     : ${services.length} created`);
        console.log('---------------------------------------------');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }
}

runSeed();
