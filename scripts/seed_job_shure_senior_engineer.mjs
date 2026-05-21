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
    auth: { autoRefreshToken: false, persistSession: false }
});

// Shure stub organization ID (from seed_stub_companies.mjs)
const SHURE_ORG_ID = '11a576f0-86fe-4de2-ad69-737c1a1f1814';

const JOB = {
    organization_id: SHURE_ORG_ID,
    posted_by: null,
    title: 'Senior Broadcast Systems Engineer',
    slug: 'shure-senior-broadcast-systems-engineer',
    department: 'Broadcast & Live Events',
    job_type: 'full_time',
    status: 'open',
    location: 'Niles, IL',
    is_remote: false,
    salary_min: 120000,
    salary_max: 155000,
    currency: 'USD',
    skills: [
        'RF Coordination',
        'Wireless Audio Systems',
        'Dante / AoIP',
        'Shure Wireless Workbench',
        'Broadcast Engineering',
        'SMPTE ST 2110',
        'Live Production',
        'Systems Integration',
        'Antenna Design',
        'UHF/VHF Spectrum Management',
    ],
    expires_at: '2026-08-21T23:59:59Z',
    description: `Shure Incorporated is seeking a Senior Broadcast Systems Engineer to join our Broadcast & Live Events team in Niles, IL. In this role, you will be a key technical authority for the design, integration, and support of professional wireless audio systems deployed in broadcast studios, live event venues, and remote production environments worldwide. You will work closely with top-tier broadcasters, production houses, and systems integrators to deliver flawless audio experiences that meet the exacting standards of network television, streaming platforms, and major live events.

As a Senior Broadcast Systems Engineer, you will drive the technical vision for how Shure's flagship wireless and wired microphone systems are deployed in complex, multichannel broadcast environments. You will collaborate closely with our Product Management and R&D teams to channel real-world insights back into the development pipeline — ensuring next-generation products address the evolving challenges of RF spectrum management, IP audio distribution, and remote production workflows. This is a high-impact, customer-facing role that demands deep technical expertise alongside the communication skills to present complex solutions to both broadcast engineers and executive stakeholders.

You will also serve as a mentor to junior and mid-level engineers, defining best practices for RF coordination, audio-over-IP architectures, and system documentation. Your work will directly shape how Shure's products are deployed across major sporting events, concert tours, awards shows, and daily news productions — making you a visible voice for Shure at industry events and on the floors of NAB, IBC, and InfoComm.

## Responsibilities

- Design and validate end-to-end wireless audio system architectures for large-scale broadcast productions, including multi-camera studio builds, outside broadcast trucks, and hybrid remote/on-premises workflows
- Lead RF coordination efforts for high-density wireless microphone deployments (100+ channels) in congested spectrum environments using Shure Wireless Workbench and IAS
- Provide pre- and post-sales technical support to key broadcast accounts, systems integrators, and broadcast consultants across North America and globally
- Develop and deliver technical training programs, application notes, and best-practice documentation for internal teams and external partners
- Collaborate with Shure's R&D and Product Management teams to define requirements for future broadcast-focused products, firmware features, and software tools
- Perform on-site system commissioning, troubleshooting, and optimization at broadcast studios, sports arenas, and live event venues
- Evaluate competitor products and technologies; contribute to competitive positioning and technical sales strategies
- Maintain deep expertise in AoIP protocols (Dante, AES67, NMOS) and their integration with Shure's networked audio ecosystem
- Represent Shure at industry trade shows (NAB, IBC, InfoComm) and broadcast technology conferences as a recognized subject matter expert
- Author technical specifications, system schematics, and signal-flow diagrams for deployment guides and customer-facing documentation

## Requirements

- Bachelor's degree in Electrical Engineering, Audio Engineering, Broadcast Technology, or a related technical discipline
- 7+ years of hands-on experience designing and deploying professional wireless audio systems in broadcast or live production environments
- Deep expertise in UHF/VHF RF theory, antenna systems design, and spectrum management in congested urban and arena environments
- Proven proficiency with Shure Wireless Workbench and the Axient Digital and/or ULX-D product families
- Strong working knowledge of Audio-over-IP standards including Dante, AES67, and SMPTE ST 2110
- Experience integrating with broadcast infrastructure including production routers, mixing consoles (Calrec, SSL, Studer, Lawo), and intercom systems
- Demonstrated ability to manage multiple concurrent projects and clearly communicate technical decisions to non-technical stakeholders
- Willingness to travel up to 30% domestically and internationally for customer visits, trade shows, and on-site production deployments

## Nice to Have

- CTS, CTS-D, or SynAudCon certification
- Experience with Dante Domain Manager and networked audio security practices
- Familiarity with NMOS IS-04/IS-05 for IP broadcast control and discovery workflows
- Prior experience in a broadcast engineering role at a network affiliate, OB truck operator, or major sports venue
- Knowledge of Shure's software ecosystem including Designer System Configuration Software and SystemOn Audio Asset Management

## Benefits

- Competitive base salary of $120,000–$155,000 depending on experience, plus annual performance bonus
- Comprehensive medical, dental, and vision insurance from day one, with low employee premium contributions
- 401(k) with 6% company match, fully vested after two years
- Flexible hybrid schedule: three days at our Niles, IL headquarters, two days remote
- Generous paid time off: 20 days PTO, 12 paid holidays, and paid volunteer days
- Annual professional development budget of $3,000 for certifications, conferences, and training`,
};

async function runSeed() {
    console.log('🎙  Starting job seed: Shure — Senior Broadcast Systems Engineer...');

    try {
        const { data, error } = await supabase
            .from('jobs')
            .upsert(JOB, { onConflict: 'slug', ignoreDuplicates: false })
            .select('id, title, slug, status, salary_min, salary_max, expires_at')
            .single();

        if (error) {
            console.error('❌ Failed to upsert job:', error.message);
            process.exit(1);
        }

        console.log('✅ Job upserted successfully:');
        console.log(`   ID:       ${data.id}`);
        console.log(`   Title:    ${data.title}`);
        console.log(`   Slug:     ${data.slug}`);
        console.log(`   Status:   ${data.status}`);
        console.log(`   Salary:   $${data.salary_min.toLocaleString()} – $${data.salary_max.toLocaleString()} USD`);
        console.log(`   Expires:  ${data.expires_at}`);
    } catch (err) {
        console.error('❌ Unexpected error:', err);
        process.exit(1);
    }
}

runSeed();
