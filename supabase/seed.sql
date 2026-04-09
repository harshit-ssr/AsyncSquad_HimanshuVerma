-- ============================================================
-- EcoMarket — Seed Data (10 Demo Products)
-- Run this AFTER database_schema.sql
-- Prerequisites: A seller account must exist in auth.users,
-- profiles, and sellers tables.
--
-- INSTRUCTIONS:
--   1. Sign up a seller account through the app (e.g. seller@demo.com).
--   2. Copy their UUID from Supabase → Authentication → Users.
--   3. Replace the placeholder UUID below with the real one.
--   4. Run this SQL in Supabase Dashboard → SQL Editor → New Query.
-- ============================================================

-- !! REPLACE THIS with your actual demo-seller UUID !!
DO $$
DECLARE
  demo_seller uuid := '00000000-0000-0000-0000-000000000001'; -- ← put your real seller UUID here
BEGIN

-- ─── Ensure the demo seller exists in profiles + sellers ────
-- (Skip if you already created the account through the app)
INSERT INTO public.profiles (id, email, name, role)
VALUES (demo_seller, 'seller@demo.com', 'EcoMarket Demo Seller', 'seller')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sellers (id, store_name, description)
VALUES (demo_seller, 'EcoMarket Artisan Co.', 'Curated sustainable goods from local artisans.')
ON CONFLICT (id) DO NOTHING;

-- ─── 10 Demo Products ──────────────────────────────────────
INSERT INTO public.products (seller_id, title, description, price, stock_quantity, eco_tags, image_url, lat, lng)
VALUES
  (
    demo_seller,
    'Handmade Beeswax Candle',
    'Pure beeswax candle hand-poured in small batches. Burns clean with a warm honey scent. Each candle lasts up to 40 hours.',
    499,
    25,
    ARRAY['handmade', 'organic', 'biodegradable'],
    '',
    28.6139, 77.2090
  ),
  (
    demo_seller,
    'Upcycled Denim Tote Bag',
    'Fashion-forward tote made entirely from upcycled denim jeans. Sturdy, spacious, and one-of-a-kind — every bag tells a different story.',
    899,
    15,
    ARRAY['upcycled', 'handmade', 'plastic-free'],
    '',
    28.6280, 77.2170
  ),
  (
    demo_seller,
    'Organic Cotton Face Towels (Set of 4)',
    'GOTS-certified organic cotton, woven in Panipat. Gentle on sensitive skin, quick-drying, and pesticide-free.',
    649,
    40,
    ARRAY['organic', 'biodegradable', 'local'],
    '',
    28.5355, 77.3910
  ),
  (
    demo_seller,
    'Bamboo Cutlery Travel Kit',
    'Say goodbye to single-use plastic. This portable kit includes a bamboo fork, spoon, knife, chopsticks, and straw in a roll-up cotton pouch.',
    349,
    60,
    ARRAY['plastic-free', 'biodegradable', 'organic'],
    '',
    28.6508, 77.2314
  ),
  (
    demo_seller,
    'Coconut Shell Bowl (Polished)',
    'Handcrafted from real coconut shells sourced from Kerala. Food-safe lacquer finish, perfect for smoothie bowls, salads, and snacks.',
    299,
    35,
    ARRAY['handmade', 'upcycled', 'local'],
    '',
    28.6100, 77.2300
  ),
  (
    demo_seller,
    'Natural Loofah Scrubber (3-Pack)',
    'Grown in Rajasthan, sun-dried, and hand-cut. 100% compostable — a zero-waste alternative to plastic sponges.',
    199,
    100,
    ARRAY['organic', 'biodegradable', 'plastic-free'],
    '',
    28.5672, 77.2100
  ),
  (
    demo_seller,
    'Jute & Cotton Yoga Mat',
    'Thick 6mm handloom mat with natural jute grip and organic cotton comfort layer. Perfect for hot yoga and daily practice.',
    1299,
    20,
    ARRAY['handmade', 'organic', 'local'],
    '',
    28.6350, 77.2250
  ),
  (
    demo_seller,
    'Seed Paper Greeting Cards (Set of 6)',
    'Write your message, then plant the card — each one is embedded with wildflower seeds. Printed with soy ink on recycled pulp.',
    249,
    50,
    ARRAY['biodegradable', 'upcycled', 'plastic-free'],
    '',
    28.6700, 77.2100
  ),
  (
    demo_seller,
    'Cold-Pressed Neem Wood Comb',
    'Anti-static neem wood comb hand-carved by artisans in Jaipur. Conditions hair naturally and lasts for years.',
    179,
    70,
    ARRAY['handmade', 'organic', 'local'],
    '',
    28.5900, 77.2500
  ),
  (
    demo_seller,
    'Reusable Beeswax Food Wraps (Pack of 3)',
    'Ditch the cling film. These wraps are made with organic cotton, beeswax, jojoba oil, and tree resin. Washable and reusable for up to a year.',
    399,
    45,
    ARRAY['organic', 'plastic-free', 'biodegradable'],
    '',
    28.6200, 77.2400
  );

END $$;

-- ============================================================
-- Done! Your 10 demo products are now in the database.
-- Visit /buyer to see them on the marketplace.
-- ============================================================
