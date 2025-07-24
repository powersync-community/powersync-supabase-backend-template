create table
  public.thoughts (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    content text not null,
    created_by uuid not null,
    constraint thoughts_pkey primary key (id),
    constraint thoughts_created_by_fkey foreign key (created_by) references auth.users (id) on delete cascade
  ) tablespace pg_default;

create table
  public.reactions (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    thought_id uuid not null,
    user_id uuid not null,
    emoji text not null,
    constraint reactions_pkey primary key (id),
    constraint reactions_thought_id_fkey foreign key (thought_id) references thoughts (id) on delete cascade,
    constraint reactions_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  ) tablespace pg_default;


-- Create publication for powersync

create publication powersync for table public.thoughts, public.reactions;