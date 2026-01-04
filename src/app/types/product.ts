
export interface Product {
  id: string;
  name: string;
  description: string;
  slug: string;
  brands: { name: string } | null;
  product_images: { url: string; is_primary: boolean }[];
  product_variants: {
    id: string;
    sku: string;
    price: number;
    stock_quantity: number
  }[];
  reviews: {
    id: string;
    rating: number;
    review_text: string;
    is_verified_purchase: boolean;
    users: { email: string } | null;
  }[];
}
import { z } from 'zod';

export const VariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  stock_quantity: z.number().int().min(0),
});

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  brand: z.string().min(1, "Brand name is required").optional().or(z.literal('')), // Allows optional or empty string
  slug: z.string().min(2, "Slug is required"),
  category_id: z.string().uuid("Please select a valid category"),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  images: z.array(z.string().url()),
  variants: z.array(VariantSchema).min(1, "At least one variant is required"),
});

export type ProductFormData = z.infer<typeof ProductSchema>;
export type Variant = z.infer<typeof VariantSchema>;