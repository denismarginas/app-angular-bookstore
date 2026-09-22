create table if not exists books (
  id integer primary key,
  slug text unique not null,
  title text not null,
  author text not null,
  price numeric not null,
  sale_price numeric,
  date_published date,
  quantity integer not null default 0,
  in_stock boolean not null default true,
  description text not null default '',
  feature_image text not null default '',
  images text[] not null default '{}'
);

create table if not exists store (
  id integer primary key default 1,
  name text not null,
  address text not null default '',
  cui text not null default '',
  email text not null default '',
  phone text not null default ''
);

create table if not exists users (
  id integer primary key,
  email text unique not null,
  password text not null,
  first_name text not null,
  last_name text not null,
  phone text not null default '',
  role text not null default 'Customer',
  address jsonb not null default '{}'::jsonb
);

create table if not exists pages (
  id integer primary key,
  title text not null,
  slug text unique not null,
  content text not null default ''
);

create table if not exists contact_mails (
  id integer primary key,
  date timestamptz not null default now(),
  subject text not null default '',
  first_name text not null,
  last_name text not null,
  phone text not null default '',
  email text not null,
  order_id text not null default '',
  message text not null
);

create table if not exists orders (
  order_id integer primary key,
  status text not null,
  date date not null,
  customer jsonb not null,
  address jsonb not null,
  store jsonb not null,
  items jsonb not null,
  shipping jsonb,
  payment jsonb,
  order_total numeric not null
);

alter table books enable row level security;
alter table store enable row level security;
alter table users enable row level security;
alter table pages enable row level security;
alter table contact_mails enable row level security;
alter table orders enable row level security;
