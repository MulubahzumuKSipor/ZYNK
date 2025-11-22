import { Review } from "./review";
import { Meta } from "./metadata";
import { Dimensions } from "./dimensions";


// Individual product variant
export interface ProductVariant {
  id: number;           // DB id of the variant
  sku: string;          // Unique per variant
  price: number;        // Required
  compareAtPrice?: number; // Optional
  stock_quantity: number;        // Available quantity
}

// Image for a product
export interface ProductImage {
  id?: number;          // optional DB id
  image_url: string;
  alt_text?: string;
  display_order?: number;
  thumbnail_url?: string;
}

// Product category
export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  parent_id?: number | null;
}

// Main Product interface
export interface Product {
  name: string;
  product_id: number;         // DB id
  external_id: number;
  sku: string;
  stock_quantity: number;
  price: number;
  title: string;
  description: string;
  brand?: string;
  weight?: number;
  dimensions?: Dimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  rating?: number;
  tags?: string[];
  meta?: Meta;

  // Related data
  variants: ProductVariant[];
  images: ProductImage[];
  categories?: ProductCategory[];
  reviews?: Review[];
}
