/**
 * seed_ai_tool_companies.mjs
 *
 * Creates stub organization profiles for all 20 AI tool companies and links
 * each ai_tools row to its organization via organization_id.
 *
 * Usage (from repo root):
 *   node scripts/seed_ai_tool_companies.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Key. Please ensure .env.local is present.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_USER_ID = 'b713cc88-78fa-472a-bb8a-46eef3c1d5ea';

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
};

const ABSTRACT_COVERS = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1598387993441-a364f854cfdd?w=1600&auto=format&fit=crop',
];

// ---------------------------------------------------------------------------
// Company definitions
// ---------------------------------------------------------------------------

const COMPANIES = [
  {
    toolId: 'cd902816-1a39-444e-81a8-fbcfbd60bff2',
    toolSlug: 'adobe-firefly',
    orgSlug: 'adobe',
    name: 'Adobe',
    type: 'Platform',
    description:
      'Adobe Inc. is an American multinational software company. Adobe Firefly is its generative AI platform for creative professionals.',
    website: 'https://www.adobe.com',
    tagline: 'Creativity for all.',
    fbPageName: 'adobe',
    clearbitDomain: 'adobe.com',
  },
  {
    toolId: '9b352358-6b9f-4edb-8e58-31f3995f722d',
    toolSlug: 'canva-magic-studio',
    orgSlug: 'canva',
    name: 'Canva',
    type: 'Platform',
    description:
      'Canva is an Australian graphic design platform with Magic Studio, its suite of AI-powered design tools.',
    website: 'https://www.canva.com',
    tagline: 'Design anything. Publish anywhere.',
    fbPageName: 'canva',
    clearbitDomain: 'canva.com',
  },
  {
    toolId: 'd907921f-4f08-4c7d-9567-7be57af23c97',
    toolSlug: 'descript',
    orgSlug: 'descript',
    name: 'Descript',
    type: 'Platform',
    description:
      'Descript is an AI-powered video and podcast editing platform that makes editing as easy as editing text.',
    website: 'https://www.descript.com',
    tagline: 'Edit video like a doc.',
    fbPageName: 'descript',
    clearbitDomain: 'descript.com',
  },
  {
    toolId: '6089424a-4bb7-42a8-809a-c14dd99e2823',
    toolSlug: 'elevenlabs',
    orgSlug: 'elevenlabs',
    name: 'ElevenLabs',
    type: 'Platform',
    description:
      'ElevenLabs is an AI voice technology company offering lifelike text-to-speech, voice cloning, and dubbing tools.',
    website: 'https://elevenlabs.io',
    tagline: 'AI voice technology at human quality.',
    fbPageNames: ['elevenlabs', 'elevenlabsai'],
    clearbitDomain: 'elevenlabs.io',
  },
  {
    toolId: '953aeb3e-995a-4551-a019-6cceb05d55af',
    toolSlug: 'google-flow',
    orgSlug: 'google',
    name: 'Google',
    type: 'Platform',
    description:
      'Google LLC is a global technology company and a subsidiary of Alphabet Inc. Google Flow is its AI filmmaking tool powered by Veo.',
    website: 'https://www.google.com',
    tagline: "Organize the world's information.",
    fbPageName: 'google',
    clearbitDomain: 'google.com',
  },
  {
    toolId: '7c3c2e8d-beca-49ab-bb45-a69fb6228286',
    toolSlug: 'heygen',
    orgSlug: 'heygen',
    name: 'HeyGen',
    type: 'Platform',
    description:
      'HeyGen is an AI video creation platform enabling users to generate studio-quality videos with AI avatars and voice cloning.',
    website: 'https://www.heygen.com',
    tagline: 'AI video generation, at scale.',
    fbPageNames: ['heygen.ai', 'heygen'],
    clearbitDomain: 'heygen.com',
  },
  {
    toolId: '1e7e9715-5e16-4874-bee5-72a73e3890e0',
    toolSlug: 'ideogram',
    orgSlug: 'ideogram',
    name: 'Ideogram',
    type: 'Platform',
    description:
      'Ideogram is an AI image generation platform known for its accuracy with text inside images and creative typography.',
    website: 'https://ideogram.ai',
    tagline: 'Turn your ideas into images.',
    fbPageName: 'ideogram.ai',
    clearbitDomain: 'ideogram.ai',
  },
  {
    toolId: '8656a35e-338b-42be-b360-95b4a89946b2',
    toolSlug: 'kling-ai',
    orgSlug: 'kuaishou',
    name: 'Kuaishou',
    type: 'Platform',
    description:
      'Kuaishou Technology is a Chinese technology company and the developer of Kling AI, a leading AI video generation model.',
    website: 'https://www.kuaishou.com',
    tagline: 'Inspire the world with creativity.',
    fbPageName: 'kuaishou',
    clearbitDomain: 'kuaishou.com',
  },
  {
    toolId: '68a541d0-657c-45c3-9c59-5da540741a01',
    toolSlug: 'leonardo-ai',
    orgSlug: 'leonardo-ai',
    name: 'Leonardo.Ai',
    type: 'Platform',
    description:
      'Leonardo.Ai is an AI content generation platform for images, video, and 3D assets tailored to creative professionals and game developers.',
    website: 'https://leonardo.ai',
    tagline: 'Create production-quality visual assets.',
    fbPageName: 'leonardo.ai',
    clearbitDomain: 'leonardo.ai',
  },
  {
    toolId: '43f5657e-be6c-4186-b4e0-429f2aedd9cc',
    toolSlug: 'luma-dream-machine',
    orgSlug: 'luma-ai',
    name: 'Luma AI',
    type: 'Platform',
    description:
      'Luma AI (Luma Labs) is an AI company developing Dream Machine, a state-of-the-art video generation model.',
    website: 'https://lumalabs.ai',
    tagline: 'Dream it. Generate it.',
    fbPageName: 'lumalabs.ai',
    clearbitDomain: 'lumalabs.ai',
  },
  {
    toolId: '60237988-3d8a-476e-b069-181fac682e1a',
    toolSlug: 'midjourney',
    orgSlug: 'midjourney',
    name: 'Midjourney',
    type: 'Platform',
    description:
      'Midjourney is an independent AI research lab producing AI image generation tools accessible via Discord and web.',
    website: 'https://www.midjourney.com',
    tagline: 'An independent research lab.',
    fbPageName: 'midjourney',
    clearbitDomain: 'midjourney.com',
  },
  {
    toolId: '61298780-3ca2-47c0-b3f9-c1057ef0189a',
    toolSlug: 'murf-ai',
    orgSlug: 'murf-ai',
    name: 'Murf AI',
    type: 'Platform',
    description:
      'Murf AI is a text-to-speech platform offering studio-quality AI voices for videos, podcasts, and presentations.',
    website: 'https://murf.ai',
    tagline: 'AI voice generator for everyone.',
    fbPageName: 'murfai',
    clearbitDomain: 'murf.ai',
  },
  {
    toolId: '9fa65bc5-178c-46be-a2df-b58ada5fbfc4',
    toolSlug: 'openai-sora',
    orgSlug: 'openai',
    name: 'OpenAI',
    type: 'Platform',
    description:
      'OpenAI is an AI safety company and research lab behind ChatGPT, GPT-4, DALL·E, and Sora — the AI video generation model.',
    website: 'https://openai.com',
    tagline: 'Safe and beneficial AI for humanity.',
    fbPageName: 'openai',
    clearbitDomain: 'openai.com',
  },
  {
    toolId: '8199c99c-eca9-4aad-9026-818494720a18',
    toolSlug: 'pika',
    orgSlug: 'pika-labs',
    name: 'Pika Labs',
    type: 'Platform',
    description:
      'Pika Labs is an AI startup building Pika, a video generation platform that turns ideas into cinematic video.',
    website: 'https://pika.art',
    tagline: 'Idea to video, instantly.',
    fbPageName: 'pika.art',
    clearbitDomain: 'pika.art',
  },
  {
    toolId: 'e3c9b174-c937-4482-9933-47e9de78e438',
    toolSlug: 'runway',
    orgSlug: 'runway',
    name: 'Runway',
    type: 'Platform',
    description:
      'Runway is an applied AI research company building next-generation creative tools including the Gen-2 and Gen-3 Alpha video generation models.',
    website: 'https://runwayml.com',
    tagline: 'Advancing creativity with artificial intelligence.',
    fbPageName: 'runwayml',
    clearbitDomain: 'runwayml.com',
  },
  {
    toolId: 'b37c525c-d477-462b-b156-7656a0469434',
    toolSlug: 'soundraw',
    orgSlug: 'soundraw',
    name: 'SOUNDRAW',
    type: 'Platform',
    description:
      'SOUNDRAW is an AI music generation platform that lets creators generate royalty-free music tracks customized to their needs.',
    website: 'https://soundraw.io',
    tagline: 'AI music, your way.',
    fbPageName: 'soundraw',
    clearbitDomain: 'soundraw.io',
  },
  // suno is handled separately (already exists) — entry below for linking only
  {
    toolId: '915027c7-f842-467f-92f1-66dcedca590b',
    toolSlug: 'suno',
    orgSlug: 'suno',
    name: 'Suno',
    skipCreate: true, // org already exists
  },
  {
    toolId: 'b8133770-5d1f-4d5f-a49a-39ccb0b99855',
    toolSlug: 'synthesia',
    orgSlug: 'synthesia',
    name: 'Synthesia',
    type: 'Platform',
    description:
      'Synthesia is an AI video generation platform enabling users to create professional videos with AI avatars from text in minutes.',
    website: 'https://www.synthesia.io',
    tagline: 'Create AI videos in minutes.',
    fbPageName: 'synthesia.io',
    clearbitDomain: 'synthesia.io',
  },
  {
    toolId: '9a12b14a-d688-42e2-a495-e1e1dda4233b',
    toolSlug: 'topaz-video-ai',
    orgSlug: 'topaz-labs',
    name: 'Topaz Labs',
    type: 'Platform',
    description:
      'Topaz Labs develops AI-powered video and photo enhancement software, including Video AI for upscaling and restoration.',
    website: 'https://www.topazlabs.com',
    tagline: 'AI-powered image and video enhancement.',
    fbPageName: 'topazlabs',
    clearbitDomain: 'topazlabs.com',
  },
  {
    toolId: '344c8ae9-f11c-4cf9-89be-c02a9dec64e2',
    toolSlug: 'udio',
    orgSlug: 'udio',
    name: 'Udio',
    type: 'Platform',
    description:
      'Udio is an AI music generation platform that creates high-quality, full songs from text prompts with original composition and lyrics.',
    website: 'https://www.udio.com',
    tagline: 'Create music with AI.',
    fbPageName: 'udiomusic',
    clearbitDomain: 'udio.com',
  },
];

// ---------------------------------------------------------------------------
// Logo helpers
// ---------------------------------------------------------------------------

async function tryFetchImage(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: FETCH_HEADERS });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 1024) return null;
    return { buf, contentType };
  } catch {
    return null;
  }
}

async function tryFacebookLogo(fbPageName) {
  try {
    const apiUrl = `https://graph.facebook.com/${fbPageName}/picture?type=square&width=400&redirect=false`;
    const res = await fetch(apiUrl, { redirect: 'follow', headers: FETCH_HEADERS });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.data?.url || json.data.is_silhouette) return null;
    return await tryFetchImage(json.data.url);
  } catch {
    return null;
  }
}

async function downloadLogo(company) {
  const { orgSlug, fbPageName, fbPageNames, clearbitDomain } = company;
  const pagesToTry = fbPageNames ?? (fbPageName ? [fbPageName] : []);

  // 1. Facebook Graph API
  for (const page of pagesToTry) {
    console.log(`   [FB] Trying facebook page: ${page}`);
    const result = await tryFacebookLogo(page);
    if (result) {
      console.log(`   ✅ Got logo from Facebook (${result.buf.byteLength} bytes)`);
      return result;
    }
  }

  // 2. Clearbit
  if (clearbitDomain) {
    const clearbitUrl = `https://logo.clearbit.com/${clearbitDomain}?size=400`;
    console.log(`   [Clearbit] Trying: ${clearbitUrl}`);
    const result = await tryFetchImage(clearbitUrl);
    if (result) {
      console.log(`   ✅ Got logo from Clearbit (${result.buf.byteLength} bytes)`);
      return result;
    }
  }

  // 3. Fallback — return null, caller will use direct URL
  console.log(`   ⚠️  All logo download attempts failed for ${orgSlug}`);
  return null;
}

async function uploadLogoToStorage({ buf, contentType, slug }) {
  const ext = (contentType.split('/')[1] ?? 'png')
    .replace('jpeg', 'jpg')
    .replace('+xml', '')
    .split(';')[0];
  const filePath = `logos/${Date.now()}_${slug}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const { error } = await supabase.storage
    .from('organizations')
    .upload(filePath, buf, { contentType, upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('organizations').getPublicUrl(filePath);
  return data.publicUrl;
}

// ---------------------------------------------------------------------------
// Main seed logic
// ---------------------------------------------------------------------------

async function seedCompany(company, coverIndex) {
  const { orgSlug, name, type, description, website, tagline, clearbitDomain, skipCreate } =
    company;

  if (skipCreate) {
    console.log(`\n⏭️  Skipping org creation for ${name} (already exists) — looking up id...`);
    const { data, error } = await supabase
      .from('organizations')
      .select('id, logo_url')
      .eq('slug', orgSlug)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Org with slug '${orgSlug}' not found in DB!`);
    console.log(`   ✅ Found existing org '${name}' — id: ${data.id}`);
    return { orgId: data.id, logoUrl: data.logo_url, created: false };
  }

  console.log(`\n🏢 Processing: ${name} (slug: ${orgSlug})`);

  // Check if org already exists with a Supabase-hosted logo
  const { data: existing } = await supabase
    .from('organizations')
    .select('id, logo_url')
    .eq('slug', orgSlug)
    .maybeSingle();

  let logoUrl;

  const hasSupabaseLogo =
    existing?.logo_url &&
    existing.logo_url.includes('supabase.co') &&
    !existing.logo_url.includes('unsplash.com');

  if (hasSupabaseLogo) {
    logoUrl = existing.logo_url;
    console.log(`   ✅ Preserving existing Supabase logo: ${logoUrl}`);
  } else {
    // Download and upload a fresh logo
    const logoResult = await downloadLogo(company);
    if (logoResult) {
      try {
        logoUrl = await uploadLogoToStorage({
          buf: logoResult.buf,
          contentType: logoResult.contentType,
          slug: orgSlug,
        });
        console.log(`   ✅ Uploaded logo to Supabase: ${logoUrl}`);
      } catch (uploadErr) {
        console.warn(`   ⚠️  Upload failed: ${uploadErr.message}. Falling back to Clearbit URL.`);
        logoUrl = clearbitDomain
          ? `https://logo.clearbit.com/${clearbitDomain}?size=400`
          : null;
      }
    } else {
      // All downloads failed — use Clearbit URL directly as fallback
      logoUrl = clearbitDomain
        ? `https://logo.clearbit.com/${clearbitDomain}?size=400`
        : null;
      if (logoUrl) {
        console.log(`   ⚠️  Using Clearbit URL directly as fallback: ${logoUrl}`);
      }
    }
  }

  // Cover image — Unsplash abstract, rotated by index
  // Note: organizations table does not have cover_image_url column, so skipped
  // TODO: add cover_image_url if column is added to organizations table

  // Upsert org
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .upsert(
      {
        name,
        slug: orgSlug,
        logo_url: logoUrl,
        tagline,
        type,
        main_activity: 'AI Tools',
        description,
        website,
        is_stub: true,
        claimed_at: null,
        source: 'admin_seed',
        seeded_by: ADMIN_USER_ID,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    )
    .select()
    .single();

  if (orgError) throw orgError;

  const orgId = orgData.id;
  console.log(`   ✅ Upserted org '${name}' — id: ${orgId}`);

  return { orgId, logoUrl, created: !existing };
}

async function runSeed() {
  console.log('🚀 Starting seed: AI Tool Company stub organizations');
  console.log(`   Companies to process: ${COMPANIES.length}`);
  console.log('='.repeat(60));

  const results = [];
  let coverIndex = 0;

  for (const company of COMPANIES) {
    try {
      const { orgId, logoUrl, created } = await seedCompany(company, coverIndex);
      results.push({ company, orgId, logoUrl, created, error: null });
      coverIndex = (coverIndex + 1) % ABSTRACT_COVERS.length;
    } catch (err) {
      console.error(`   ❌ Failed for ${company.name}:`, err.message);
      results.push({ company, orgId: null, logoUrl: null, created: false, error: err.message });
    }
  }

  // ---------------------------------------------------------------------------
  // Link ai_tools rows to their organizations
  // ---------------------------------------------------------------------------

  console.log('\n' + '='.repeat(60));
  console.log('🔗 Linking ai_tools to organizations...');

  const linkResults = [];
  for (const result of results) {
    const { company, orgId } = result;
    if (!orgId) {
      console.log(`   ⚠️  Skipping link for ${company.name} — no org id`);
      linkResults.push({ name: company.name, linked: false, reason: 'no org id' });
      continue;
    }

    const { error: linkError } = await supabase
      .from('ai_tools')
      .update({ organization_id: orgId })
      .eq('id', company.toolId);

    if (linkError) {
      console.error(`   ❌ Link failed for ${company.name}: ${linkError.message}`);
      linkResults.push({ name: company.name, linked: false, reason: linkError.message });
    } else {
      console.log(`   ✅ Linked ${company.name} (tool: ${company.toolSlug}) → org: ${orgId}`);
      linkResults.push({ name: company.name, linked: true, reason: null });
    }
  }

  // ---------------------------------------------------------------------------
  // Verification query
  // ---------------------------------------------------------------------------

  console.log('\n' + '='.repeat(60));
  console.log('🔍 Verifying links (ai_tools joined to organizations)...');

  const { data: verifyData, error: verifyError } = await supabase
    .from('ai_tools')
    .select('name, slug, organization_id, organizations(name, slug, logo_url)')
    .order('name');

  if (verifyError) {
    console.error('   ❌ Verification query failed:', verifyError.message);
  } else {
    console.log('\n  Tool Name              | Org Name               | Org Slug');
    console.log('  ' + '-'.repeat(72));
    for (const row of verifyData) {
      const orgName = row.organizations?.name ?? '(not linked)';
      const orgSlug = row.organizations?.slug ?? '—';
      console.log(
        `  ${row.name.padEnd(22)} | ${orgName.padEnd(22)} | ${orgSlug}`
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Summary table
  // ---------------------------------------------------------------------------

  console.log('\n' + '='.repeat(60));
  console.log('📊 SEED SUMMARY');
  console.log('='.repeat(60));

  const orgCreated = results.filter((r) => r.created && !r.error).length;
  const orgSkipped = results.filter((r) => !r.created && !r.error && r.company.skipCreate).length;
  const orgUpdated = results.filter((r) => !r.created && !r.error && !r.company.skipCreate).length;
  const orgFailed = results.filter((r) => r.error).length;
  const toolsLinked = linkResults.filter((r) => r.linked).length;
  const toolsFailed = linkResults.filter((r) => !r.linked).length;

  console.log(`  Orgs created  : ${orgCreated}`);
  console.log(`  Orgs updated  : ${orgUpdated}`);
  console.log(`  Orgs skipped  : ${orgSkipped}`);
  console.log(`  Orgs failed   : ${orgFailed}`);
  console.log(`  Tools linked  : ${toolsLinked} / ${COMPANIES.length}`);
  console.log(`  Tools failed  : ${toolsFailed}`);
  console.log('='.repeat(60));

  if (orgFailed > 0 || toolsFailed > 0) {
    console.log('\n⚠️  Some items failed. Details above.');
  } else {
    console.log('\n🎉 All done! All 20 AI tools are linked to their company organizations.');
  }
}

runSeed().catch((err) => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
