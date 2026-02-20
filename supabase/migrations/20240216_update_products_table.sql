
alter table "public"."products" add column "product_type" text;
alter table "public"."products" add column "main_category" text;
alter table "public"."products" add column "sub_category" text;
alter table "public"."products" add column "short_description" text;

alter table "public"."products" add constraint "products_product_type_check" check (product_type in ('Hardware', 'Software', 'Cloud', 'Hybrid', 'Service'));

-- Optional: Add a check constraint for short_description length if you want to enforce it at DB level
alter table "public"."products" add constraint "products_short_description_check" check (length(short_description) <= 150);
