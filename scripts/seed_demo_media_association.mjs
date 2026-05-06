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
    console.log('🏛️  Starting demo MEDIA ASSOCIATION seed process...');

    const suffix = shortId();
    const demoEmail = `demo.association_${suffix}@medialinkpro.com`;
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
                full_name: 'Daniel Okafor',
                avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop'
            }
        });
        if (userError) throw userError;
        const userId = userData.user.id;
        console.log('   ✅ User created.');

        await new Promise((r) => setTimeout(r, 1200));

        // 2. UPDATE PROFILE
        console.log('\n📋 Updating profile for Daniel Okafor...');
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                username: `danielokafor_${suffix}`,
                full_name: 'Daniel Okafor',
                avatar_url:
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop',
                cover_url:
                    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1600&auto=format&fit=crop',
                bio: 'Secretary General at International Media Innovators Alliance (IMIA). 18+ years building cross-border partnerships between broadcasters, regulators and technology vendors. Former IBC Council member.',
                about:
                    'I lead a global non-profit alliance representing 420+ broadcasters, OTT platforms and media technology companies across 60 countries. We drive open standards, run industry-leading conferences and publish the research the sector relies on for strategic planning.',
                headline: 'Secretary General · IMIA — International Media Innovators Alliance',
                company: 'International Media Innovators Alliance',
                job_title: 'Secretary General',
                job_function: 'C-Suite',
                website: 'https://www.imia.demo',
                portfolio_url: 'https://imia.demo/leadership/daniel-okafor',
                linkedin_url: 'https://linkedin.com/in/daniel-okafor-demo',
                x_url: 'https://x.com/danokafor_imia',
                instagram_url: 'https://instagram.com/imia.global',
                youtube_url: 'https://youtube.com/@imia-global',
                tiktok_url: 'https://tiktok.com/@imia.global',
                facebook_url: 'https://facebook.com/imia.global',
                contact_email_public: 'd.okafor@imia.demo',
                contact_email_public_enabled: true,
                contact_phone_public: '+32 2 555 0190',
                contact_phone_public_enabled: true,
                city: 'Brussels',
                country: 'Belgium',
                birth_date: '1979-11-22',
                hourly_rate: null,
                skills: [
                    'Industry Advocacy',
                    'Standards Development',
                    'Broadcast Policy',
                    'Public Speaking',
                    'Strategic Partnerships',
                    'Event Programming',
                    'Member Engagement',
                    'Regulatory Affairs'
                ],
                followers_count: 14260,
                following_count: 980,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        if (profileError) throw profileError;
        console.log('   ✅ Profile updated.');

        // 3. CREATE ORGANIZATION (Media Association)
        console.log('\n🏢 Creating organization IMIA (Media Association)...');
        const orgSlug = `imia-international-media-innovators-alliance-${suffix}`;
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    id: orgId,
                    name: 'International Media Innovators Alliance',
                    slug: orgSlug,
                    logo_url:
                        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&h=300&auto=format&fit=crop',
                    tagline: 'United voice of the global media technology industry.',
                    type: 'Media Association',
                    main_activity:
                        'Industry advocacy, open-standards development, conferences and member services for broadcasters and media tech vendors.',
                    description:
                        'IMIA — the International Media Innovators Alliance — is a Brussels-headquartered non-profit representing 420+ broadcasters, streaming platforms and media technology companies across 60 countries. Founded in 2004, we develop open interoperability standards, host the flagship IMIA Global Summit, publish the annual State of the Industry report and represent member interests with regulators including the European Commission, FCC and OFCOM.',
                    website: 'https://www.imia.demo',
                    contact_email: 'secretariat@imia.demo',
                    phone: '+32 2 555 0190',
                    country: 'Belgium',
                    address: 'Avenue de Cortenbergh 116, 1000 Brussels, Belgium',
                    linkedin_url: 'https://linkedin.com/company/imia-global-demo',
                    x_url: 'https://x.com/imia_global',
                    facebook_url: 'https://facebook.com/imia.global',
                    instagram_url: 'https://instagram.com/imia.global',
                    tiktok_url: 'https://tiktok.com/@imia.global',
                    youtube_url: 'https://youtube.com/@imia-global',
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

        // 5. CREATE SERVICES
        console.log('\n📦 Creating services for IMIA...');
        const services = [
            {
                name: 'IMIA Corporate Membership',
                slug: `imia-corporate-membership-${shortId()}`,
                short_description:
                    'Annual membership for broadcasters, OTT platforms and media tech vendors.',
                description:
                    '<p>IMIA Corporate Membership gives your organization a <strong>seat at the table</strong> in shaping the future of broadcast and streaming. Members gain voting rights on standards working groups, discounted summit passes and direct access to peer benchmarking data.</p><ul><li>Voting seat on 12 active working groups</li><li>4 complimentary IMIA Global Summit passes</li><li>Quarterly peer-benchmark dashboards</li><li>Exclusive policy briefings &amp; regulator office hours</li><li>Listing in the IMIA Global Member Directory</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&h=300&auto=format&fit=crop',
                main_category: 'Other',
                sub_category: 'Other',
                gallery: [
                    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop'
                ],
                price: 9500,
                pricing_model: 'Subscription',
                price_upon_request: false
            },
            {
                name: 'IMIA Global Summit — Delegate Pass',
                slug: `imia-global-summit-pass-${shortId()}`,
                short_description:
                    'Three-day flagship industry conference in Amsterdam — September 2026.',
                description:
                    '<p>The <strong>IMIA Global Summit</strong> is the year\'s most influential gathering of broadcast and streaming leaders. Three days of keynote programming, 80+ technical sessions, a 14,000m² exhibition floor and curated executive matchmaking.</p><ul><li>Full access to all keynotes &amp; track sessions</li><li>Welcome reception &amp; closing gala dinner</li><li>1:1 executive matchmaking concierge</li><li>On-demand session recordings (12 months)</li><li>Networking app with 6,000+ attendees</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=300&auto=format&fit=crop',
                main_category: 'Other',
                sub_category: 'Other',
                gallery: [
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop'
                ],
                price: 1850,
                pricing_model: 'One-time',
                price_upon_request: false
            },
            {
                name: 'IMIA Standards Certification Program',
                slug: `imia-standards-certification-${shortId()}`,
                short_description:
                    'Conformance testing & certification for ST 2110, NDI and DASH-IF interoperability.',
                description:
                    '<p>The IMIA Certification Program independently validates that your product conforms to <strong>industry-critical interoperability standards</strong>. Certified products carry the IMIA mark and are listed in the official compatibility matrix used by 320+ broadcasters worldwide.</p><ul><li>Hands-on conformance lab testing</li><li>SMPTE ST 2110, NDI 6, DASH-IF, SCTE-35 coverage</li><li>Joint test plans with peer-vendor interop</li><li>Public listing on the IMIA Compatibility Matrix</li><li>2-year certification mark license</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=300&auto=format&fit=crop',
                main_category: 'Monitoring, QC & Compliance',
                sub_category: 'Compliance Recording',
                gallery: [
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200&auto=format&fit=crop'
                ],
                price: 18000,
                pricing_model: 'One-time',
                price_upon_request: false
            },
            {
                name: 'IMIA Research & Industry Insights',
                slug: `imia-research-insights-${shortId()}`,
                short_description:
                    'Quarterly market research, benchmarking dashboards and the annual State of the Industry report.',
                description:
                    '<p>An annual subscription to <strong>IMIA Research</strong> — the most cited intelligence service in the global media technology sector. Includes the flagship State of the Industry report, quarterly market sizing updates and live access to the IMIA Benchmark Portal.</p><ul><li>Annual State of the Industry report (200+ pages)</li><li>Quarterly market-sizing &amp; spend tracker updates</li><li>Live benchmark portal across 28 KPIs</li><li>4 analyst inquiry calls per year</li><li>Custom data extracts &amp; cuts on request</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=300&auto=format&fit=crop',
                main_category: 'Other',
                sub_category: 'Other',
                gallery: [
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop'
                ],
                price: 6400,
                pricing_model: 'Subscription',
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
                        external_url: 'https://www.imia.demo/services',
                        support_url: 'https://support.imia.demo',
                        documentation_url: 'https://www.imia.demo/services',
                        availability_status: 'Available',
                        price: svc.price,
                        currency: 'EUR',
                        price_upon_request: svc.price_upon_request,
                        pricing_model: svc.pricing_model,
                        status: 'published',
                        views_count: Math.floor(Math.random() * 5000) + 800,
                        bookmarks_count: Math.floor(Math.random() * 120) + 10,
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
        console.log(`Organization : International Media Innovators Alliance (Media Association)`);
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
