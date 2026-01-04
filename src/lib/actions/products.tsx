'use server';

import { createClient } from '@/lib/server'; // Your server-side Supabase client
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { type Variant } from '@/app/types/product';

export type State = {
  success?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    slug?: string[];
    category_id?: string[];
    variants?: string[];
    [key: string]: string[] | undefined;
  };
};

const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().optional(),
  category_id: z.string().uuid('Please select a valid category'),
  status: z.enum(['active', 'draft', 'archived']).optional(),
});

export async function createOrUpdateProduct(prevState: State, formData: FormData): Promise<State> {
  const supabase = await createClient();

  // 1. Validate core fields
  const validatedFields = ProductSchema.safeParse({
    id: formData.get('id') || undefined,
    name: formData.get('name'),
    slug: formData.get('slug'),
    category_id: formData.get('category_id'),
    description: formData.get('description'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name, slug, category_id, description, status } = validatedFields.data;

  // 2. Parse relational data
  let variants: Variant[] = [];
  try {
    const rawVariants = formData.get('variants');
    variants = rawVariants ? JSON.parse(rawVariants as string) : [];
    if (!Array.isArray(variants) || variants.length === 0) {
      return { success: false, message: 'At least one variant is required.', errors: { variants: ['Required'] } };
    }
  } catch (e) {
    return { success: false, message: 'Invalid variants data.', errors: { variants: ['Invalid JSON'] } };
  }

  // 3. Handle images: existing + new uploads
  const existingImagesRaw = formData.get('existingImages');
  const existingImages: string[] = existingImagesRaw ? JSON.parse(existingImagesRaw as string) : [];

  const newImageFiles = formData.getAll('newImages') as File[];
  const uploadedUrls: string[] = [];

  if (newImageFiles.length > 0) {
    for (const file of newImageFiles) {
      if (file.size === 0) continue; // Skip empty files (can happen with some browsers)

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: false });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return { success: false, message: `Failed to upload image: ${file.name}` };
      }

      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      uploadedUrls.push(urlData.publicUrl);
    }
  }

  const allImages = [...existingImages, ...uploadedUrls];

  // 4. Prepare product data
  const productData = {
    name,
    slug,
    category_id,
    description: description || null,
    is_active: status === 'active',
    updated_at: new Date().toISOString(),
  };

  let productId: string;

  try {
    // 5. Insert or Update Product
    if (id) {
      // Update
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select('id')
        .single();

      if (error) throw error;
      productId = data.id;
    } else {
      // Insert
      const insertData = {
        ...productData,
        created_at: new Date().toISOString(),
      };

      let insertResult = await supabase
        .from('products')
        .insert([insertData])
        .select('id')
        .single();

      if (insertResult.error && insertResult.error.code === '23505') {
        // Slug conflict → append random suffix
        const uniqueSlug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
        insertResult = await supabase
          .from('products')
          .insert([{ ...insertData, slug: uniqueSlug }])
          .select('id')
          .single();

        if (insertResult.error) throw insertResult.error;
      } else if (insertResult.error) {
        throw insertResult.error;
      }

      productId = insertResult.data.id;
    }

    // 6. Sync Variants (Upsert + Delete removed)
    if (variants.length > 0) {
      const variantsToUpsert = variants.map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        product_id: productId,
        sku: v.sku || null,
        price: Number(v.price),
        stock_quantity: Number(v.stock_quantity),
      }));

      const { error: upsertError } = await supabase
        .from('product_variants')
        .upsert(variantsToUpsert, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      // Delete variants no longer present
      const currentIds = variants.map((v) => v.id).filter(Boolean);
      if (currentIds.length > 0) {
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', productId)
          .not('id', 'in', `(${currentIds.join(',')})`);
      }
    }

    // 7. Sync Images (Replace all)
    await supabase.from('product_images').delete().eq('product_id', productId);

    if (allImages.length > 0) {
      const imagesToInsert = allImages.map((url) => ({
        product_id: productId,
        url,
      }));

      const { error: imgError } = await supabase.from('product_images').insert(imagesToInsert);
      if (imgError) throw imgError;
    }

    revalidatePath('/dashboard/products');
    return { success: true, message: id ? 'Product updated successfully.' : 'Product created successfully.' };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to delete product.' };
  }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) throw error;

    revalidatePath('/dashboard/products');
    return { success: true, message: 'Product deleted successfully.' };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to delete product.' };
  }
}