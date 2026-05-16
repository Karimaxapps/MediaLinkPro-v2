import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase URL or Service Key. Please ensure .env.local is present.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runSeed() {
    console.log("🚀 Starting Ross Video seed process...");

    const demoEmail = `demo.rossvideo_${crypto.randomBytes(4).toString('hex')}@medialinkpro.com`;
    const demoPassword = 'password123';
    const orgId = crypto.randomUUID();
    const productId = crypto.randomUUID();
    const product2Id = crypto.randomUUID();

    try {
        // 1. CREATE USER IN AUTH.USERS
        console.log(`\n👤 Creating user account for ${demoEmail}...`);

        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email: demoEmail,
            password: demoPassword,
            email_confirm: true,
            user_metadata: {
                full_name: 'Jennifer Walsh',
                avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop'
            }
        });

        if (userError) throw userError;
        const userId = userData.user.id;
        console.log("   ✅ User created successfully!");

        // Wait a moment for trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 2. UPDATE PROFILE
        console.log(`\n📋 Updating profile for Jennifer Walsh...`);
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                username: `jwalsh_rossvideo_${crypto.randomBytes(4).toString('hex')}`,
                full_name: 'Jennifer Walsh',
                avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop',
                cover_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1600&auto=format&fit=crop',
                bio: 'Senior Product Specialist at Ross Video with 12 years of experience in live broadcast production infrastructure. Passionate about helping broadcasters and live event professionals get the most from Carbonite, Ultrix, and the broader Ross ecosystem.',
                company: 'Ross Video',
                job_title: 'Senior Product Specialist',
                job_function: 'Technical',
                website: 'https://www.rossvideo.com',
                linkedin_url: 'https://www.linkedin.com/company/ross-video/',
                x_url: 'https://x.com/rossvideo',
                instagram_url: 'https://www.instagram.com/rossvideo',
                youtube_url: 'https://www.youtube.com/@RossVideo',
                city: 'Ottawa',
                country: 'Canada',
                skills: ['Production Switching', 'Video Routing', 'Broadcast Infrastructure', 'Live Events', 'IP Video', 'SMPTE ST 2110'],
                followers_count: 3870,
                following_count: 512,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (profileError) throw profileError;
        console.log("   ✅ Profile updated successfully!");

        // 3. CREATE ORGANIZATION
        console.log(`\n🏢 Creating organization Ross Video...`);
        const orgSlug = `ross-video-${crypto.randomBytes(4).toString('hex')}`;
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert({
                id: orgId,
                name: 'Ross Video',
                slug: orgSlug,
                logo_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&auto=format&fit=crop',
                tagline: 'Live Production Technology for the World\'s Most Ambitious Broadcasts.',
                type: 'Manufacturer',
                main_activity: 'Design, manufacture and support of live video production switchers, signal routing, infrastructure, and graphics solutions for broadcast, live events, and streaming.',
                description: 'Ross Video is a privately held Canadian broadcast technology company founded in 1974 by Graham Ross. Headquartered in Ottawa, Ontario, Canada, Ross Video designs, manufactures, and supports a comprehensive portfolio of live production hardware and software — including the industry-leading Carbonite series of production switchers, Ultrix ultra-dense routing and processing platforms, XPression real-time graphics engines, and the openGear modular infrastructure framework.\n\nWith over 50 years of engineering heritage, Ross equips broadcasters, sports production facilities, houses of worship, corporate AV teams, and live event producers across more than 150 countries. The company employs over 1,500 people globally and is recognised for its customer-first culture, deep technical expertise, and commitment to open standards including SMPTE ST 2110 and NMOS. Ross Video is consistently ranked among the most trusted names in the live production technology industry.',
                website: 'https://www.rossvideo.com',
                contact_email: 'info@rossvideo.com',
                phone: '+1 613-652-4886',
                country: 'Canada',
                address: '8 John Street, Iroquois, ON K0E 1K0, Canada',
                linkedin_url: 'https://www.linkedin.com/company/ross-video/',
                x_url: 'https://x.com/rossvideo',
                facebook_url: 'https://www.facebook.com/rossvideo',
                instagram_url: 'https://www.instagram.com/rossvideo',
                youtube_url: 'https://www.youtube.com/@RossVideo',
                tiktok_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'slug' })
            .select()
            .single();

        if (orgError) throw orgError;
        const actualOrgId = orgData.id;
        console.log("   ✅ Organization created successfully!");

        // 4. ORGANIZATION MEMBERSHIP
        console.log(`\n🤝 Linking user to organization as Owner...`);
        const { error: memberError } = await supabase
            .from('organization_members')
            .upsert({
                organization_id: actualOrgId,
                user_id: userId,
                role: 'owner'
            }, { onConflict: 'organization_id,user_id' });

        if (memberError) throw memberError;
        console.log("   ✅ Membership created successfully!");

        // 5. CREATE FLAGSHIP PRODUCT — Carbonite Black+
        console.log(`\n📦 Creating flagship product: Carbonite Black+...`);
        const { data: productData, error: productError } = await supabase
            .from('products')
            .upsert({
                id: productId,
                organization_id: actualOrgId,
                name: 'Carbonite Black+',
                slug: `carbonite-black-plus-${crypto.randomBytes(4).toString('hex')}`,
                short_description: 'The ultimate mid-to-large scale live production switcher with native IP, 4K, and HDR support.',
                description: '<p><strong>Carbonite Black+</strong> is Ross Video\'s flagship live production switcher, built for the most demanding broadcast and live event environments. It delivers uncompromising mix/effects performance with a fully configurable M/E architecture, native SMPTE ST 2110 IP I/O, and seamless integration with the broader Ross ecosystem.</p><ul><li>Up to 4 full M/E rows with 64+ inputs</li><li>Native 4K/UHD, HD, and HDR (HLG/PQ) operation</li><li>Integrated clip store and built-in multiviewer</li><li>Tally, GPIO, and Ross openGear integration</li><li>MiNO (Modular I/O) expansion for SDI and IP</li><li>Works natively with XPression graphics and Ultrix routing</li></ul><p>Trusted by leading broadcasters, sports rights holders, and touring live event companies worldwide.</p>',
                logo_url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=300&auto=format&fit=crop',
                is_public: true,
                product_type: 'Hardware',
                main_category: 'Production Switcher',
                sub_category: 'Live Production',
                external_url: 'https://www.rossvideo.com/production-switchers/carbonite-black/',
                documentation_url: 'https://solutions.rossvideo.com/carbonite-black-user-guide',
                certification_url: 'https://www.rossvideo.com/training/',
                gallery_urls: [
                    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1518131672697-613becd4fab5?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop'
                ],
                views_count: 6821,
                promo_video_url: 'https://www.youtube.com/watch?v=Hs4-J9vVGvQ',
                support_url: 'https://support.rossvideo.com',
                course_url: 'https://www.rossvideo.com/training/',
                availability_status: 'Available',
                price_upon_request: true,
                pricing_model: 'One-time',
                status: 'published',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'organization_id,slug' })
            .select()
            .single();

        if (productError) throw productError;
        console.log("   ✅ Carbonite Black+ created successfully!");

        // 6. CREATE SECOND PRODUCT — Ultrix Acuity Router
        console.log(`\n📦 Creating second product: Ultrix FR12...`);
        const { error: product2Error } = await supabase
            .from('products')
            .upsert({
                id: product2Id,
                organization_id: actualOrgId,
                name: 'Ultrix FR12',
                slug: `ultrix-fr12-${crypto.randomBytes(4).toString('hex')}`,
                short_description: 'Ultra-dense 12RU routing, processing, and multiviewing platform with native IP and SDI.',
                description: '<p><strong>Ultrix FR12</strong> is Ross Video\'s ultra-dense, software-defined signal routing and processing platform. Occupying just 12RU, it delivers a full-fabric router, multiviewer, frame sync, audio shuffling, and up/down/cross-conversion in a single chassis — dramatically simplifying infrastructure while reducing rack space and power consumption.</p><ul><li>Up to 144×144 routing fabric in 12RU</li><li>Integrated multiviewer (up to 48 sources on a single output)</li><li>Native SMPTE ST 2110, ST 2022-6, and SDI I/O</li><li>Frame sync, proc amp, and colour correction per input</li><li>Loudness monitoring and audio shuffling built-in</li><li>Software-licensed feature expansion — no hardware swap required</li></ul><p>Deployed in master control rooms, OB trucks, and remote production hubs across six continents.</p>',
                logo_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&auto=format&fit=crop',
                is_public: true,
                product_type: 'Hardware',
                main_category: 'Signal Routing',
                sub_category: 'Broadcast Infrastructure',
                external_url: 'https://www.rossvideo.com/signal-processing/routing/ultrix-fr12/',
                documentation_url: 'https://solutions.rossvideo.com/ultrix-fr12-user-guide',
                certification_url: 'https://www.rossvideo.com/training/',
                gallery_urls: [
                    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop'
                ],
                views_count: 4102,
                support_url: 'https://support.rossvideo.com',
                course_url: 'https://www.rossvideo.com/training/',
                availability_status: 'Available',
                price_upon_request: true,
                pricing_model: 'One-time',
                status: 'published',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'organization_id,slug' })
            .select()
            .single();

        if (product2Error) throw product2Error;
        console.log("   ✅ Ultrix FR12 created successfully!");

        console.log(`\n🎉 SEEDING COMPLETE! 🎉`);
        console.log(`Demo User:    ${demoEmail} / ${demoPassword}`);
        console.log(`Organization: Ross Video (slug: ${orgSlug})`);
        console.log(`Product 1:    Carbonite Black+`);
        console.log(`Product 2:    Ultrix FR12`);

    } catch (error) {
        console.error("\n❌ Error during seeding:", error);
        process.exit(1);
    }
}

runSeed();
