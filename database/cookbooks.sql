-- Cookbook feature schema for Supabase (Postgres)
-- Run this in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.cookbooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  cover_storage_key text,
  created_at timestamptz not null default now()
);

create table if not exists public.cookbook_recipes (
  id uuid primary key default gen_random_uuid(),
  cookbook_id uuid not null references public.cookbooks(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (cookbook_id, recipe_id)
);

create index if not exists idx_cookbooks_user_id
  on public.cookbooks(user_id);

create index if not exists idx_cookbook_recipes_cookbook_id
  on public.cookbook_recipes(cookbook_id);

create index if not exists idx_cookbook_recipes_recipe_id
  on public.cookbook_recipes(recipe_id);

alter table public.cookbooks enable row level security;
alter table public.cookbook_recipes enable row level security;

drop policy if exists "Cookbooks select own" on public.cookbooks;
create policy "Cookbooks select own"
  on public.cookbooks
  for select
  using (auth.uid() = user_id);

drop policy if exists "Cookbooks insert own" on public.cookbooks;
create policy "Cookbooks insert own"
  on public.cookbooks
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Cookbooks update own" on public.cookbooks;
create policy "Cookbooks update own"
  on public.cookbooks
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Cookbooks delete own" on public.cookbooks;
create policy "Cookbooks delete own"
  on public.cookbooks
  for delete
  using (auth.uid() = user_id);

drop policy if exists "CookbookRecipes select own books" on public.cookbook_recipes;
create policy "CookbookRecipes select own books"
  on public.cookbook_recipes
  for select
  using (
    exists (
      select 1
      from public.cookbooks c
      where c.id = cookbook_recipes.cookbook_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "CookbookRecipes insert own books" on public.cookbook_recipes;
create policy "CookbookRecipes insert own books"
  on public.cookbook_recipes
  for insert
  with check (
    exists (
      select 1
      from public.cookbooks c
      where c.id = cookbook_recipes.cookbook_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "CookbookRecipes delete own books" on public.cookbook_recipes;
create policy "CookbookRecipes delete own books"
  on public.cookbook_recipes
  for delete
  using (
    exists (
      select 1
      from public.cookbooks c
      where c.id = cookbook_recipes.cookbook_id
        and c.user_id = auth.uid()
    )
  );
