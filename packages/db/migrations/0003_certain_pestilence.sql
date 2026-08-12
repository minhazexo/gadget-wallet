CREATE INDEX IF NOT EXISTS "products_created_idx" ON "products" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_rating_idx" ON "products" USING btree ("rating");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_discount_idx" ON "products" USING btree ("discount_price");