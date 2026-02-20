-- Create a demo user for Media Professional
DO $$
DECLARE
  new_user_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; -- Fixed UUID for consistent demo data
  demo_email text := 'demo@medialinkpro.com';
  demo_password text := 'password123';
BEGIN
  -- 1. Insert into auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = demo_email) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      demo_email,
      crypt(demo_password, gen_salt('bf')), -- Use pgcrypto to hash password
      now(), -- Auto-confirm email
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Sarah Jenkins"}',
      now(),
      now(),
      'authenticated',
      'authenticated',
      ''
    );
  ELSE
    -- If user exists, get their ID
    SELECT id INTO new_user_id FROM auth.users WHERE email = demo_email;
  END IF;

  -- 2. Insert or Update corresponding profile in public.profiles
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    cover_url,
    bio,
    company,
    job_title,
    job_function,
    website,
    linkedin_url,
    x_url,
    instagram_url,
    youtube_url,
    city,
    country,
    skills,
    followers_count,
    following_count,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'sarahjenkins_film',
    'Sarah Jenkins',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop', -- Professional headshot
    'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=2000&auto=format&fit=crop', -- Film set background
    'Award-winning Senior Video Producer with over 10 years of experience in commercial and documentary filmmaking. Passionate about telling stories that move people. Specialized in high-end production workflows and creative direction.',
    'Creative Vision Studios',
    'Senior Video Producer',
    'Creative',
    'https://www.creativevision.com',
    'https://linkedin.com/in/sarahjenkins-demo',
    'https://x.com/sarahfilms',
    'https://instagram.com/sarahjenkins.bts',
    'https://youtube.com/@sarahjenkins.demo',
    'Los Angeles',
    'United States',
    ARRAY['Video Production', 'Creative Direction', 'Post-Production', 'Documentary', 'Commercials', 'Team Leadership'],
    1250,
    450,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    cover_url = EXCLUDED.cover_url,
    bio = EXCLUDED.bio,
    company = EXCLUDED.company,
    job_title = EXCLUDED.job_title,
    job_function = EXCLUDED.job_function,
    website = EXCLUDED.website,
    linkedin_url = EXCLUDED.linkedin_url,
    x_url = EXCLUDED.x_url, -- Assuming x_url from schema check earlier
    instagram_url = EXCLUDED.instagram_url,
    youtube_url = EXCLUDED.youtube_url,
    city = EXCLUDED.city,
    country = EXCLUDED.country,
    skills = EXCLUDED.skills,
    updated_at = now();

  -- Note: I used x_url in the UPDATE but twitter_url in INSERT might be wrong if the column is x_url.
  -- Correcting INSERT column name to match schema check 'x_url'.
END $$;
