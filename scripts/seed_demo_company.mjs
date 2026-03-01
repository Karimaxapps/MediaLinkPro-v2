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

// Ensure you instantiate the client with the Service Role Key to bypass RLS and create users
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runSeed() {
    console.log("🚀 Starting demo company seed process...");

    const demoEmail = `demo.broadcast_${crypto.randomBytes(4).toString('hex')}@medialinkpro.com`;
    const demoPassword = 'password123';
    const orgId = crypto.randomUUID();
    const productId = crypto.randomUUID();

    try {
        // 1. CREATE USER IN AUTH.USERS
        console.log(`\n👤 Creating user account for ${demoEmail}...`);

        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email: demoEmail,
            password: demoPassword,
            email_confirm: true,
            user_metadata: {
                full_name: 'Alex Sterling',
                avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop'
            }
        });

        if (userError) throw userError;
        const userId = userData.user.id;
        console.log("   ✅ User created successfully!");

        // Wait a moment for trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 2. UPDATE PROFILE
        console.log(`\n📋 Updating profile for Alex Sterling...`);
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                username: `alexsterling_${crypto.randomBytes(4).toString('hex')}`,
                full_name: 'Alex Sterling',
                avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop',
                cover_url: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1600&auto=format&fit=crop',
                bio: 'Chief Technology Officer with 15+ years of experience integrating cutting-edge broadcast technologies. Helping visionary creators build scalable production workflows for the future.',
                company: 'Global Broadcast Solutions',
                job_title: 'Chief Technology Officer',
                job_function: 'Technical',
                website: 'https://www.globalbroadcast.demo',
                linkedin_url: 'https://linkedin.com/demo-alex-sterling',
                x_url: 'https://x.com/alexsterling',
                instagram_url: 'https://instagram.com/alexsterling',
                youtube_url: 'https://youtube.com/@alexsterling',
                city: 'London',
                country: 'United Kingdom',
                skills: ['Broadcast Architecture', 'Cloud Playout', 'IP Video Routing', 'System Integration', 'AI in Media'],
                followers_count: 5320,
                following_count: 890,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (profileError) throw profileError;
        console.log("   ✅ Profile updated successfully!");

        // 3. CREATE ORGANIZATION
        console.log(`\n🏢 Creating organization Global Broadcast Solutions...`);
        const slug = `global-broadcast-solutions-${crypto.randomBytes(4).toString('hex')}`;
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert({
                id: orgId,
                name: 'Global Broadcast Solutions',
                slug: slug,
                logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop',
                tagline: 'The future of broadcast technology infrastructure.',
                type: 'Solution Provider',
                main_activity: 'Providing end-to-end IP video routing and cloud playout systems.',
                description: 'Global Broadcast Solutions is a leading innovator in the broadcast technology space. We empower media companies worldwide to transition seamlessly to IP and cloud-based workflows. With over 500 enterprise deployments globally, our comprehensive suite of tools ensures zero downtime and massive scalability for live and VOD architectures.',
                website: 'https://www.globalbroadcast.demo',
                contact_email: 'hello@globalbroadcast.demo',
                phone: '+44 20 7946 0958',
                country: 'United Kingdom',
                address: 'Media City, Salford, UK',
                linkedin_url: 'https://linkedin.com/company/globalbroadcast-demo',
                x_url: 'https://x.com/globalbroadcast',
                facebook_url: 'https://facebook.com/globalbroadcast',
                instagram_url: 'https://instagram.com/globalbroadcast',
                youtube_url: 'https://youtube.com/@globalbroadcast',
                tiktok_url: 'https://tiktok.com/@globalbroadcast',
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

        // 5. CREATE PRODUCT
        console.log(`\n📦 Creating flagship product...`);
        const { data: productData, error: productError } = await supabase
            .from('products')
            .upsert({
                id: productId,
                organization_id: actualOrgId,
                name: 'BroadcastMaster Pro v4',
                slug: `broadcastmaster-pro-v4-${crypto.randomBytes(4).toString('hex')}`,
                description: '<p>BroadcastMaster Pro v4 is our flagship cloud playout and multi-channel routing platform. <strong>Built for the modern newsroom and live event center</strong>, it integrates seamlessly with NDI, SMPTE 2110, and modern CDN architectures.</p><ul><li>Zero-latency routing</li><li>AI-powered auto-transcription for live feeds</li><li>Scalable up to 8K resolution support</li><li>Cloud-native redundancy</li></ul>',
                logo_url: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=300&auto=format&fit=crop',
                is_public: true,
                product_type: 'Software',
                main_category: 'Cloud Playout',
                sub_category: 'Video Routing',
                short_description: 'The ultimate cloud-native playout and video routing platform with AI integrations.',
                external_url: 'https://globalbroadcast.demo/products/v4',
                documentation_url: 'https://docs.globalbroadcast.demo/v4',
                certification_url: 'https://training.globalbroadcast.demo/certify',
                gallery_urls: [
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1510511459019-5d644d6718d0?w=1200&auto=format&fit=crop'
                ],
                views_count: 4503,
                promo_video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                support_url: 'https://support.globalbroadcast.demo',
                course_url: 'https://academy.globalbroadcast.demo',
                training_video_urls: [
                    'https://www.youtube.com/watch?v=M7FIvfx5J10',
                    'https://www.youtube.com/watch?v=jNQXAC9IVRw'
                ],
                availability_status: 'Available',
                price: 2499,
                currency: 'USD',
                price_upon_request: false,
                pricing_model: 'Subscription',
                status: 'published',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'organization_id,slug' })
            .select()
            .single();

        if (productError) throw productError;
        console.log("   ✅ Product created successfully!");

        console.log(`\n🎉 SEEDING COMPLETE! 🎉`);
        console.log(`Demo User: ${demoEmail} / ${demoPassword}`);
        console.log(`Organization: Global Broadcast Solutions`);
        console.log(`Product: BroadcastMaster Pro v4`);

    } catch (error) {
        console.error("\n❌ Error during seeding:", error);
        process.exit(1);
    }
}

runSeed();
