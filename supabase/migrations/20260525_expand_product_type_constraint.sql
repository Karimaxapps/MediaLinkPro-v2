-- Expand the product_type CHECK constraint to include new types added in the
-- May 2026 category taxonomy expansion (Platform, Content & Licensing, Data & Analytics).

ALTER TABLE "public"."products"
  DROP CONSTRAINT IF EXISTS "products_product_type_check";

ALTER TABLE "public"."products"
  ADD CONSTRAINT "products_product_type_check"
  CHECK (product_type IN (
    'Hardware',
    'Software',
    'Cloud',
    'Hybrid',
    'Service',
    'AI Tool',
    'Platform',
    'Content & Licensing',
    'Data & Analytics'
  ));
