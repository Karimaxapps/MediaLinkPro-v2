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
    console.log('🎬  Starting demo Avid seed process...');

    const suffix = shortId();
    const demoEmail = `demo.avid_${suffix}@medialinkpro.com`;
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
                full_name: 'Rachel Green',
                avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop'
            }
        });
        if (userError) throw userError;
        const userId = userData.user.id;
        console.log('   ✅ User created.');

        await new Promise((r) => setTimeout(r, 1200));

        // 2. UPDATE PROFILE
        console.log('\n📋 Updating profile for Rachel Green...');
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                username: `rachelgreen_${suffix}`,
                full_name: 'Rachel Green',
                avatar_url:
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop',
                cover_url:
                    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600&auto=format&fit=crop',
                bio: 'Media Composer Specialist at Avid Technology, helping film and television editors get the most from Avid\'s industry-standard NLE and collaborative media production platform.',
                about:
                    'I work with broadcast networks, post-production facilities and independent editors to implement and optimise Avid Media Composer workflows — from single-seat installations to large-scale collaborative environments with shared Avid NEXIS storage. My expertise spans episodic television, feature film post-production and live news editing. I also provide training and certification support for Media Composer and Pro Tools across the US and Canada.',
                headline: 'Media Composer Specialist · Avid Technology',
                company: 'Avid Technology',
                job_title: 'Media Composer Specialist',
                job_function: 'Technical',
                website: 'https://www.avid.com',
                portfolio_url: 'https://www.avid.com/resource-center',
                linkedin_url: 'https://linkedin.com/in/rachel-green-avid-demo',
                x_url: 'https://x.com/rachelgreen_avid',
                instagram_url: 'https://instagram.com/avidtechnology',
                youtube_url: 'https://youtube.com/@avidtechnology',
                tiktok_url: null,
                facebook_url: 'https://facebook.com/avidtechnology',
                contact_email_public: 'r.green@avid.demo',
                contact_email_public_enabled: true,
                contact_phone_public: '+1 978-640-6789',
                contact_phone_public_enabled: false,
                city: 'Burlington',
                country: 'United States',
                birth_date: '1988-07-03',
                hourly_rate: null,
                skills: [
                    'Avid Media Composer',
                    'Pro Tools',
                    'Collaborative Editing',
                    'Post-Production Workflow',
                    'Avid NEXIS',
                    'Episodic Television',
                    'News Editing',
                    'NLE Training'
                ],
                followers_count: 5670,
                following_count: 430,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        if (profileError) throw profileError;
        console.log('   ✅ Profile updated.');

        // 3. CREATE ORGANIZATION (Solution Provider)
        console.log('\n🏢 Creating organization Avid (Solution Provider)...');
        const orgSlug = `avid-technology-${suffix}`;
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    id: orgId,
                    name: 'Avid',
                    slug: orgSlug,
                    logo_url:
                        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&auto=format&fit=crop',
                    tagline: 'Make, manage and monetize media that matters.',
                    type: 'Solution Provider',
                    main_activity:
                        'Professional video editing, audio production and media management software for film, television, news and music production.',
                    description:
                        'Avid is a leading technology company that powers the media and entertainment industry. Founded in 1987 and headquartered in Burlington, Massachusetts, Avid creates industry-standard software and solutions used across virtually every major film, television, news and music production. Media Composer — the company\'s flagship non-linear editor — is the editorial platform of choice at Hollywood studios, major broadcast networks and post-production facilities worldwide. Pro Tools, Avid\'s digital audio workstation, dominates professional music recording, mixing and post-production audio. With approximately 1,500 employees, Avid serves customers in 190+ countries through a global network of resellers, training partners and certified operators.',
                    website: 'https://www.avid.com',
                    contact_email: 'info@avid.com',
                    phone: '+1 978-640-6789',
                    country: 'United States',
                    address: '75 Network Drive, Burlington, MA 01803, USA',
                    linkedin_url: 'https://linkedin.com/company/avid-demo',
                    x_url: 'https://x.com/avid',
                    facebook_url: 'https://facebook.com/avidtechnology',
                    instagram_url: 'https://instagram.com/avidtechnology',
                    tiktok_url: null,
                    youtube_url: 'https://youtube.com/@avidtechnology',
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
        console.log('\n📦 Creating products for Avid...');
        const products = [
            {
                name: 'Media Composer',
                slug: `avid-media-composer-${shortId()}`,
                short_description:
                    'The industry-standard non-linear video editing system for film, episodic television, news and documentary production.',
                description:
                    '<p><strong>Avid Media Composer</strong> is the industry-standard non-linear editing system, trusted by Hollywood studios, broadcast networks and post-production facilities for more than three decades. Built for professional collaborative workflows, Media Composer offers unmatched performance on HD, UHD, HDR and film projects — with native support for virtually every professional format and codec.</p><ul><li>Industry-standard NLE used on Emmy and Academy Award-winning productions</li><li>Bin-based collaborative editing with Avid NEXIS shared storage</li><li>Native support for all professional formats: XAVC, ProRes, DNx, RAW and more</li><li>Advanced colour management with HDR support (Dolby Vision, HDR10)</li><li>Avid Link integration for collaboration, marketplace and community</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&h=300&auto=format&fit=crop',
                product_type: 'Software',
                main_category: 'Live & Post Production',
                sub_category: 'Non-Linear Editing',
                gallery: [
                    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&auto=format&fit=crop'
                ],
                price: 999,
                pricing_model: 'Subscription',
                price_upon_request: false,
                currency: 'USD'
            },
            {
                name: 'Pro Tools',
                slug: `avid-pro-tools-${shortId()}`,
                short_description:
                    'The world\'s leading professional digital audio workstation for music production, recording, mixing and post-production audio.',
                description:
                    '<p><strong>Pro Tools</strong> is the world\'s leading digital audio workstation — the de-facto standard for professional music recording, mixing, sound design and post-production audio. Used in virtually every major recording studio, film sound department, broadcast facility and mastering suite on the planet, Pro Tools delivers the performance, reliability and audio quality that professionals demand.</p><ul><li>Unlimited track count (Pro Tools Ultimate) for the largest sessions</li><li>Industry-standard MIDI and audio editing with legendary performance</li><li>Dolby Atmos and immersive audio production tools built in</li><li>AAX plug-in ecosystem with thousands of industry-standard processors</li><li>Cloud collaboration and project sharing via Avid Cloud Collaboration</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&auto=format&fit=crop',
                product_type: 'Software',
                main_category: 'Audio',
                sub_category: 'DAW',
                gallery: [
                    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=1200&auto=format&fit=crop'
                ],
                price: 499,
                pricing_model: 'Subscription',
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
                        external_url: 'https://www.avid.com/products',
                        support_url: 'https://avid.com/resource-center/avid-support',
                        documentation_url: 'https://resources.avid.com',
                        certification_url: 'https://www.avid.com/learn-and-support/certification',
                        availability_status: 'Available',
                        price: p.price,
                        currency: p.currency,
                        price_upon_request: p.price_upon_request,
                        pricing_model: p.pricing_model,
                        status: 'published',
                        views_count: Math.floor(Math.random() * 10000) + 4000,
                        bookmarks_count: Math.floor(Math.random() * 300) + 60,
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
        console.log(`Organization : Avid (Solution Provider)`);
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
