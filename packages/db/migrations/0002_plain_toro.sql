ALTER TABLE "product_images" DROP CONSTRAINT "product_images_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "product_specs" DROP CONSTRAINT "product_specs_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "product_images" ADD COLUMN "image_path" text;--> statement-breakpoint
ALTER TABLE "product_images" ADD COLUMN "is_primary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_specs" ADD CONSTRAINT "product_specs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
-- Backfill: promote the first image (by sort order) of each product to primary
UPDATE "product_images" SET "is_primary" = true
WHERE "id" IN (
  SELECT DISTINCT ON ("product_id") "id"
  FROM "product_images"
  ORDER BY "product_id", "order" ASC
);
--> statement-breakpoint
-- Backfill: point each product's thumbnail at its primary image URL
UPDATE "products" SET "thumbnail_url" = pi."url"
FROM "product_images" pi
WHERE pi."product_id" = "products"."id" AND pi."is_primary" = true;
