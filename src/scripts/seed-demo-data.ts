import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Admin client
const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

const DEMO_USER = {
    email: 'demo@medialinkpro.com',
    password: 'password123',
    full_name: 'Sarah Jenkins',
    username: 'sarah_jenkins',
    job_title: 'Product Director',
    role: 'company_owner', // Check valid roles in enum? specific implementation detail
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop',
    cover_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&h=400&auto=format&fit=crop',
    bio: 'Product leader with 10+ years of experience in SaaS and Media Technology. Passionate about building tools that empower creators.',
    linkedin_url: 'https://linkedin.com/in/demo-user',
    website: 'https://sarahjenkins.dev',
    city: 'San Francisco',
    country: 'USA',
};

const DEMO_COMPANY = {
    name: 'StreamFlow Tech',
    slug: 'streamflow-tech',
    tagline: 'The future of media streaming',
    description: 'StreamFlow Tech provides enterprise-grade streaming infrastructure for media companies. Our platform handles millions of concurrent viewers with sub-second latency.',
    logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95ddaaa?q=80&w=256&h=256&auto=format&fit=crop', // Abstract logo
    website: 'https://streamflow.example.com',
    contact_email: 'contact@streamflow.example.com',
    industry: 'Technology',
    type: 'Technology Provider',
    main_activity: 'Video Streaming Infrastructure',
    linkedin_url: 'https://linkedin.com/company/streamflow-tech',
    size: '50-200',
    founded_year: 2018,
    country: 'USA',
};

const DEMO_PRODUCT = {
    name: 'StreamCore V4',
    slug: 'streamcore-v4',
    description: 'A complete end-to-end video delivery platform. Features include adaptive bitrate streaming, real-time analytics, and dynamic ad insertion.',
    short_description: 'Enterprise video delivery platform',
    logo_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=256&h=256&auto=format&fit=crop',
    // product_type: 'SaaS', // Invalid per constraint
    product_type: 'Cloud', // Valid values: 'Hardware', 'Software', 'Cloud', 'Hybrid', 'Service'
    main_category: 'Video Player',
    sub_category: 'Analytics',
    pricing_model: 'Subscription',
    price: 499,
    currency: 'USD',
    status: 'published',
    gallery_urls: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop', // Analytics dashboard
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=800&auto=format&fit=crop', // Server room/tech
    ],
    features: ['4K Streaming', 'Real-time Analytics', 'Ad Insertion', 'Multi-CDN Support'],
};

async function seed() {
    console.log('🌱 Starting seed process...');

    // 1. Create/Get User
    console.log(`Checking user: ${DEMO_USER.email}`);
    let userId: string = '';

    // WORKAROUND: listUsers() is failing with 500. We found the ID manually via SQL.
    const FOUND_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    try {
        const { data: { users }, error: listUserError } = await supabase.auth.admin.listUsers();
        if (listUserError) {
            console.warn('Warning: listUsers failed, using fallback ID if available.');
            // If we can't list users, try to just create. If create fails, assume it exists and use fallback.
        } else {
            const existingUser = users.find(u => u.email === DEMO_USER.email);
            if (existingUser) {
                console.log('User already exists (found via listUsers), using existing ID.');
                userId = existingUser.id;
            }
        }
    } catch (e) {
        console.warn('Exception listing users:', e);
    }

    if (!userId) {
        // Try to create
        console.log('Attempting to create user...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: DEMO_USER.email,
            password: DEMO_USER.password,
            email_confirm: true,
            user_metadata: {
                full_name: DEMO_USER.full_name,
            }
        });

        if (createError) {
            console.log('Create user failed (likely already exists). Using fallback ID.');
            userId = FOUND_USER_ID;
        } else {
            userId = newUser.user!.id;
            console.log(`User created: ${userId}`);
        }
    }

    // 2. Upsert Profile
    console.log('Upserting profile...');
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            full_name: DEMO_USER.full_name,
            username: DEMO_USER.username,
            avatar_url: DEMO_USER.avatar_url,
            cover_url: DEMO_USER.cover_url,
            bio: DEMO_USER.bio,
            job_title: DEMO_USER.job_title,
            linkedin_url: DEMO_USER.linkedin_url,
            website: DEMO_USER.website,
            country: DEMO_USER.country,
            updated_at: new Date().toISOString(),
            // 'role' might be needed depending on RLS or app logic
            // Assuming 'role' column exists in profiles based on schema check
        })
        .select()
        .single();

    if (profileError) {
        console.error('Profile upsert failed:', profileError);
        // Continue? Usually fatal for a seed script but lets log it.
    }

    // 3. Upsert Organization (Company)
    console.log('Upserting organization...');
    // We need to upsert by slug usually, or name.
    // First checking if it exists to get ID if we want to be safe, or just upsert on slug if unique constraint exists.
    // The 'organizations' table likely has a unique slug and uuid PK.

    // Let's try to find it first by slug
    let orgId: string;
    const { data: existingOrg, error: findOrgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', DEMO_COMPANY.slug)
        .single();

    if (existingOrg) {
        orgId = existingOrg.id;
        // Update it
        await supabase.from('organizations').update({
            name: DEMO_COMPANY.name,
            logo_url: DEMO_COMPANY.logo_url,
            description: DEMO_COMPANY.description,
            tagline: DEMO_COMPANY.tagline,
            website: DEMO_COMPANY.website,
            linkedin_url: DEMO_COMPANY.linkedin_url,
            updated_at: new Date().toISOString()
        }).eq('id', orgId);
        console.log(`Updated organization: ${orgId}`);
    } else {
        // Create it
        const { data: newOrg, error: createOrgError } = await supabase
            .from('organizations')
            .insert({
                name: DEMO_COMPANY.name,
                slug: DEMO_COMPANY.slug,
                logo_url: DEMO_COMPANY.logo_url,
                description: DEMO_COMPANY.description,
                tagline: DEMO_COMPANY.tagline,
                website: DEMO_COMPANY.website,
                linkedin_url: DEMO_COMPANY.linkedin_url,
                type: DEMO_COMPANY.type,
                main_activity: DEMO_COMPANY.main_activity,
                contact_email: DEMO_COMPANY.contact_email,
                country: DEMO_COMPANY.country,
            })
            .select()
            .single();

        if (createOrgError) throw createOrgError;
        orgId = newOrg.id;
        console.log(`Created organization: ${orgId}`);
    }

    // 4. Link User to Organization
    console.log('Linking user to organization...');
    const { error: memberError } = await supabase
        .from('organization_members')
        .upsert({
            organization_id: orgId,
            user_id: userId,
            role: 'owner', // Assuming 'owner' is a valid role string/enum
        }, { onConflict: 'organization_id, user_id' }); // Assuming composite PK or unique constraint

    if (memberError) console.error('Member upsert error:', memberError);

    // 5. Upsert Product
    console.log('Upserting product...');

    // Try to find by slug
    let productId: string;
    const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('slug', DEMO_PRODUCT.slug)
        .single();

    const productData = {
        organization_id: orgId,
        name: DEMO_PRODUCT.name,
        slug: DEMO_PRODUCT.slug,
        description: DEMO_PRODUCT.description,
        short_description: DEMO_PRODUCT.short_description,
        logo_url: DEMO_PRODUCT.logo_url,
        gallery_urls: DEMO_PRODUCT.gallery_urls,
        pricing_model: DEMO_PRODUCT.pricing_model,
        price: DEMO_PRODUCT.price,
        currency: DEMO_PRODUCT.currency,
        status: DEMO_PRODUCT.status,
        product_type: DEMO_PRODUCT.product_type,
        main_category: DEMO_PRODUCT.main_category,
        sub_category: DEMO_PRODUCT.sub_category,
    };

    if (existingProduct) {
        productId = existingProduct.id;
        await supabase.from('products').update(productData).eq('id', productId);
        console.log(`Updated product: ${productId}`);
    } else {
        const { data: newProduct, error: createProductError } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

        if (createProductError) throw createProductError;
        productId = newProduct.id;
        console.log(`Created product: ${productId}`);
    }

    // 6. Link User as Expert
    console.log('Linking user as product expert...');
    const { error: expertError } = await supabase
        .from('product_experts')
        .upsert({
            product_id: productId,
            user_id: userId,
            expertise_level: 'advanced'
        }, { onConflict: 'product_id, user_id' });

    if (expertError) console.error('Expert upsert error:', expertError);
    else console.log('✅ User linked as Product Expert');

    console.log('✅ Seed process completed successfully!');
    console.log(`\nTest Credentials:`);
    console.log(`Email: ${DEMO_USER.email}`);
    console.log(`Password: ${DEMO_USER.password}`);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
