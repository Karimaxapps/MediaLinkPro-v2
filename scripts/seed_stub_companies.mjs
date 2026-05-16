import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase URL or Service Key. Please ensure .env.local is present.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

/**
 * Stub companies seeded directly without user accounts.
 * Each org has zero members and is available for ownership assignment
 * via the admin panel.
 */
const STUB_COMPANIES = [
    {
        name: 'Ross Video',
        slug: 'ross-video',
        logo_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&auto=format&fit=crop',
        tagline: "Live Production Technology for the World's Most Ambitious Broadcasts.",
        type: 'Manufacturer',
        main_activity: 'Design, manufacture and support of live video production switchers, signal routing, infrastructure, and graphics solutions for broadcast, live events, and streaming.',
        description: `Ross Video is a privately held Canadian broadcast technology company founded in 1974 by Graham Ross. Headquartered in Iroquois, Ontario, Canada, Ross Video designs, manufactures, and supports a comprehensive portfolio of live production hardware and software — including the industry-leading Carbonite series of production switchers, Ultrix ultra-dense routing and processing platforms, XPression real-time graphics engines, and the openGear modular infrastructure framework.

With over 50 years of engineering heritage, Ross equips broadcasters, sports production facilities, houses of worship, corporate AV teams, and live event producers across more than 150 countries. The company employs over 1,500 people globally and is recognised for its customer-first culture, deep technical expertise, and commitment to open standards including SMPTE ST 2110 and NMOS. Ross Video is consistently ranked among the most trusted names in the live production technology industry.`,
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
    },
    {
        name: 'EVS Broadcast Equipment',
        slug: 'evs-broadcast-equipment',
        logo_url: 'https://images.unsplash.com/photo-1579566346927-c68383817a25?w=300&h=300&auto=format&fit=crop',
        tagline: 'Powering Live. Every Second Counts.',
        type: 'Manufacturer',
        main_activity: 'Design and manufacture of live production servers, slow-motion replay systems, and live production workflow solutions for broadcast sports, news, and entertainment.',
        description: `EVS Broadcast Equipment is a Belgian technology company founded in 1994 and headquartered at Liège Science Park, Belgium. EVS is the world leader in live video production technology, best known for its XT-VIA live production servers — the industry standard for instant slow-motion replay and highlight clipping in sports broadcasting.

EVS solutions are deployed at the world's most prestigious live events, including the FIFA World Cup, the Olympic Games, Formula 1, and major news operations across six continents. Its product portfolio spans live production servers (XT-VIA, XS-VIA), the Xeebra multi-angle video judge review platform, the Dyvi software-defined production switcher, IPD-VIA IP live production infrastructure, and the MediaCeption ingest and playout ecosystem.

With over 500 employees globally and a presence in more than 100 countries, EVS is a publicly listed company on Euronext Brussels (EVS) and is trusted by the world's leading broadcasters, OB truck operators, and sports rights holders to deliver flawless live content at the moment it matters most.`,
        website: 'https://www.evs.com',
        contact_email: 'info@evs.com',
        phone: '+32 4 361 70 00',
        country: 'Belgium',
        address: 'Liège Science Park, 16 rue Bois Saint-Jean, B-4102 Seraing, Belgium',
        linkedin_url: 'https://www.linkedin.com/company/evs-broadcast-equipment/',
        x_url: 'https://x.com/EVSbroadcast',
        facebook_url: 'https://www.facebook.com/EVSbroadcast',
        instagram_url: 'https://www.instagram.com/evsbroadcast',
        youtube_url: 'https://www.youtube.com/@EVSbroadcast',
        tiktok_url: null,
    },
];

async function runSeed() {
    console.log(`🚀 Seeding ${STUB_COMPANIES.length} stub companies...\n`);

    for (const company of STUB_COMPANIES) {
        const { data, error } = await supabase
            .from('organizations')
            .upsert(
                { ...company, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                { onConflict: 'slug' }
            )
            .select('id, slug')
            .single();

        if (error) {
            console.error(`❌ Failed to seed "${company.name}":`, error.message);
        } else {
            console.log(`✅ ${company.name}`);
            console.log(`   slug: ${data.slug}  |  id: ${data.id}`);
            console.log(`   URL:  /companies/${data.slug}`);
            console.log(`   Owners: none (unclaimed)\n`);
        }
    }

    console.log("🎉 Done. Assign ownership via the admin panel.");
}

runSeed();
