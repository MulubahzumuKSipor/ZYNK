'use client';

import { useState, useEffect, useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { createOrUpdateProduct, deleteProduct, type State } from '@/lib/actions/products';
import { type Variant, type ProductFormData } from '@/app/types/product';
import styles from '@/app/ui/styles/product-form.module.css';

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  product?: Partial<ProductFormData & {
    id: string;
    product_variants: Variant[],
    product_images: { url: string }[]
  }>;
  categories: Category[];
  onSuccess?: () => void;
}

interface ImagePreview {
  url: string;        // Preview URL (blob) or existing URL
  file?: File;        // File object if new upload
  isExisting: boolean; // True if already in database
}

export default function ProductForm({ product, categories, onSuccess }: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const initialState: State = { success: false, message: '', errors: {} };
  const [state, formAction] = useActionState(createOrUpdateProduct, initialState);

  // --- LOCAL STATE ---
  const [variants, setVariants] = useState<Variant[]>(
    product?.product_variants?.length ? product.product_variants : [{ sku: '', price: 0, stock_quantity: 0 }]
  );
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>(
    product?.product_images?.map((i) => ({
      url: i.url,
      isExisting: true
    })) || []
  );
  const [isActive, setIsActive] = useState<boolean>(
    product?.is_active ?? false
  );
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [slug, setSlug] = useState(product?.slug || '');

  useEffect(() => {
    if (state.success && onSuccess) onSuccess();
  }, [state.success, onSuccess]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(img => {
        if (!img.isExisting && img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [imagePreviews]);

  // --- HANDLERS ---
  const generateSlug = (text: string) => {
    return text.toLowerCase().trim().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file sizes (15MB = 15 * 1024 * 1024 bytes)
    const maxSize = 15 * 1024 * 1024;
    const oversizedFiles = Array.from(files).filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      alert(`Some files exceed the 15MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      e.target.value = '';
      return;
    }

    // Create preview URLs and store files
    const fileArray = Array.from(files);
    const newPreviews: ImagePreview[] = fileArray.map(file => ({
      url: URL.createObjectURL(file),
      file: file,
      isExisting: false
    }));

    setImagePreviews(prev => [...prev, ...newPreviews]);
    setNewImageFiles(prev => [...prev, ...fileArray]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => {
      const img = prev[index];
      // Cleanup blob URL
      if (!img.isExisting && img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url);
      }

      // Remove from newImageFiles if it's a new file
      if (!img.isExisting && img.file) {
        setNewImageFiles(files => files.filter(f => f !== img.file));
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (formData: FormData) => {
    // Add existing image URLs
    const existingUrls = imagePreviews
      .filter(img => img.isExisting)
      .map(img => img.url);

    formData.set('existingImages', JSON.stringify(existingUrls));

    // Add new image files
    newImageFiles.forEach(file => {
      formData.append('newImages', file);
    });

    // Convert status to match server expectation
    formData.set('status', isActive ? 'active' : 'draft');

    // Submit form
    startTransition(() => {
      formAction(formData);
    });
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleDeleteProduct = async () => {
    if (!product?.id) return;
    const productId = product.id;

    if (!confirm('Are you sure you want to delete this product?')) return;

    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result.success) onSuccess?.();
    });
  };

  return (
    <form action={handleSubmit} className={styles.formGrid}>
      {/* Hidden Fields for State Synchronization */}
      <input type="hidden" name="id" value={product?.id || ''} />
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      <input type="hidden" name="slug" value={slug} />

      <div className={styles.mainColumn}>
        {/* Basic Info */}
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Product Information</h3>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Product Name</label>
            <input
              name="name"
              required
              className={state.errors?.name ? styles.inputError : styles.input}
              defaultValue={product?.name}
              onChange={(e) => !product?.id && setSlug(generateSlug(e.target.value))}
            />
            {state.errors?.name?.map(err => <p key={err} className={styles.errorText}>{err}</p>)}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              name="description"
              rows={4}
              className={styles.textarea}
              defaultValue={product?.description}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Slug</label>
              <input
                className={styles.input}
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
              />
              {state.errors?.slug?.map(err => <p key={err} className={styles.errorText}>{err}</p>)}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Category</label>
              <select name="category_id" className={styles.select} defaultValue={product?.category_id}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {state.errors?.category_id?.map(err => <p key={err} className={styles.errorText}>{err}</p>)}
            </div>
          </div>
        </section>

        {/* Media Upload */}
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Product Media</h3>
          <div className={styles.imageGrid}>
            {imagePreviews.map((img, i) => (
              <div key={i} className={styles.imagePreview}>
                <Image src={img.url} alt="Product" fill className={styles.img} />
                {!img.isExisting && (
                  <span className={styles.newBadge}>New</span>
                )}
                <button
                  type="button"
                  className={styles.removeImage}
                  onClick={() => removeImage(i)}
                >
                  ✕
                </button>
              </div>
            ))}
            <label className={styles.uploadPlaceholder}>
              <input type="file" multiple accept="image/*" onChange={handleImageSelect} hidden />
              + Upload
            </label>
          </div>
        </section>

        {/* Inventory Management */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Inventory & Variants</h3>
            <button
              type="button"
              onClick={() => setVariants([...variants, { sku: '', price: 0, stock_quantity: 0 }])}
              className={styles.secondaryButton}
            >
              + Add Variant
            </button>
          </div>

          {state.errors?.variants && <p className={styles.errorText}>Please add at least one valid variant.</p>}

          <div className={styles.variantList}>
            {variants.map((v, i) => (
              <div key={i} className={styles.variantRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.labelSmall}>SKU</label>
                  <input
                    placeholder="SKU"
                    value={v.sku || ''}
                    onChange={e => updateVariant(i, 'sku', e.target.value)}
                    className={styles.inputSmall}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.labelSmall}>Price</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={v.price || ''}
                    onChange={e => updateVariant(i, 'price', Number(e.target.value))}
                    className={styles.inputSmall}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.labelSmall}>Stock Qty</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={v.stock_quantity || ''}
                    onChange={e => updateVariant(i, 'stock_quantity', Number(e.target.value))}
                    className={styles.inputSmall}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className={styles.deleteIcon}
                  disabled={variants.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className={styles.sidebarColumn}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Status</h3>
          <div className={styles.statusToggle}>
            <button
              type="button"
              onClick={() => setIsActive(true)}
              className={`${styles.statusButton} ${isActive ? styles.active : ''}`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setIsActive(false)}
              className={`${styles.statusButton} ${!isActive ? styles.draft : ''}`}
            >
              Draft
            </button>
          </div>
        </div>

        <div className={styles.actionStack}>
          <SaveButton isPending={isPending} />
          {product?.id && (
            <button
              type="button"
              onClick={handleDeleteProduct}
              disabled={isPending}
              className={styles.deleteButton}
            >
              {isPending ? 'Deleting...' : 'Delete Product'}
            </button>
          )}
        </div>
        {state.message && <p className={state.success ? styles.successMsg : styles.errorMsg}>{state.message}</p>}
      </aside>
    </form>
  );
}

function SaveButton({ isPending }: { isPending: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || isPending} className={styles.primaryButton}>
      {pending || isPending ? 'Saving...' : 'Save Product'}
    </button>
  );
}