alter table profiles
add column if not exists job_function text check (job_function in ('C-Suite', 'Business', 'Creative', 'Technical', 'Other'));
