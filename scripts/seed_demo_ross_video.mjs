import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase URL or Service Key. Please ensure .env.local is present.");
    process.exit(1);
}

// Service-role client to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

/**
 * Seeds Ross Video as an unclaimed stub organization.
 * No user account is created — the org has no members and is available
 * for a real user to claim ownership through the admin panel.
 */
async function runSeed() {
    console.log("🚀 Seeding Ross Video stub organization...");

    try {
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert({
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
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'slug' })
            .select('id, slug')
            .single();

        if (orgError) throw orgError;

        console.log(`\n🎉 DONE!`);
        console.log(`Organization: Ross Video`);
        console.log(`Slug:         ${orgData.slug}`);
        console.log(`ID:           ${orgData.id}`);
        console.log(`Owners:       none (unclaimed — assign via admin panel)`);
        console.log(`URL:          /companies/${orgData.slug}`);

    } catch (error) {
        console.error("\n❌ Error during seeding:", error);
        process.exit(1);
    }
}

runSeed();
