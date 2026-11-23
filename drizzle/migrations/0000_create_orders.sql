CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  tracking_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  zip TEXT NOT NULL,
  country_code TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  items_subtotal_usd NUMERIC(10,2) NOT NULL,
  air_freight_usd NUMERIC(10,2) NOT NULL,
  domestic_usd NUMERIC(10,2) NOT NULL,
  total_usd NUMERIC(10,2) NOT NULL,
  flight_date DATE NOT NULL,
  delivery_date DATE NOT NULL,
  destination_temp_c INTEGER NOT NULL,
  weather_hold BOOLEAN NOT NULL DEFAULT false,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  lag_agreed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE INDEX orders_order_number_idx ON public.orders (order_number);