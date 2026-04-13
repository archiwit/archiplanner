USE archiplanner;

ALTER TABLE configuracion 
ADD COLUMN IF NOT EXISTS ceo VARCHAR(100) DEFAULT 'Luis Archila',
ADD COLUMN IF NOT EXISTS tt_url VARCHAR(255) DEFAULT 'https://tiktok.com',
ADD COLUMN IF NOT EXISTS li_url VARCHAR(255) DEFAULT 'https://linkedin.com',
ADD COLUMN IF NOT EXISTS x_url VARCHAR(255) DEFAULT 'https://x.com',
ADD COLUMN IF NOT EXISTS web_url VARCHAR(255) DEFAULT 'https://archiplanner.com';

-- Ensure intro_cotizacion and politicas_cotizacion exist (just in case they were added manually)
ALTER TABLE configuracion 
ADD COLUMN IF NOT EXISTS intro_cotizacion TEXT,
ADD COLUMN IF NOT EXISTS politicas_cotizacion TEXT;
