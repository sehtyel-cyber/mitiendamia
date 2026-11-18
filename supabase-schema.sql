-- ============================================================
-- LOGIX FASHION - Esquema de base de datos para Supabase
-- Ejecutar en: Supabase ? SQL Editor
-- ============================================================

-- Tabla de pedidos
create table if not exists pedidos (
  id uuid default gen_random_uuid() primary key,
  order_id text unique not null,
  customer jsonb not null,
  items jsonb not null,
  total numeric not null default 0,
  destination_type text check (destination_type in ('Lima','Provincia')),
  province_data jsonb,
  status text default 'Pagado / No enviado',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabla de productos de inventario
create table if not exists inventario_productos (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text,
  price numeric default 0,
  created_at timestamptz default now()
);

-- Tabla de stock por color y talla
create table if not exists inventario_stock (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references inventario_productos(id) on delete cascade,
  color_name text not null,
  color_hex text default '#ffffff',
  size text not null,
  quantity integer default 0,
  created_at timestamptz default now(),
  unique(product_id, color_name, size)
);

-- Índices para consultas rápidas
create index if not exists idx_pedidos_created_at on pedidos(created_at desc);
create index if not exists idx_pedidos_status on pedidos(status);
create index if not exists idx_stock_product on inventario_stock(product_id);

-- Habilitar RLS (opcional para producción)
-- alter table pedidos enable row level security;
-- alter table inventario_productos enable row level security;
-- alter table inventario_stock enable row level security;
