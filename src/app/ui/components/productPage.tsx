'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, CheckCircle, ShieldCheck, Truck } from 'lucide-react'
import { createClient } from '@/lib/client'
import styles from '../styles/detailed_product.module.css'
import AddToCartButton from '../components/buttons/wide-add-to-cart'

/* ---------- Supabase Client ---------- */
const supabase = createClient()

/* ---------- Types ---------- */

interface Brand {
  name: string
}

interface ProductImage {
  url: string
  is_primary: boolean
}

interface ProductVariant {
  id: string
  sku: string
  price: number
}

interface ReviewProfile {
  full_name: string | null
}

interface Review {
  id: string
  rating: number
  review_text: string
  is_verified_purchase: boolean
  users: ReviewProfile | null
  created_at: string
}

interface Product {
  id: string
  name: string
  brands: Brand | null
  product_images: ProductImage[]
  product_variants: ProductVariant[]
  reviews: Review[]
}

interface ProductClientPageProps {
  initialProduct: Product
  productId: string
}

interface MessageState {
  type: 'success' | 'error'
  text: string
}

/* ---------- Review Form Component ---------- */
function ReviewForm({
  productId,
  userId,
  onReviewSubmitted
}: {
  productId: string
  userId: string
  onReviewSubmitted: (review: Review) => void
}) {
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [reviewText, setReviewText] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [message, setMessage] = useState<MessageState | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (rating === 0) {
      setMessage({ type: 'error', text: 'Please select a rating' })
      return
    }

    if (reviewText.trim().length < 10) {
      setMessage({ type: 'error', text: 'Review must be at least 10 characters' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      // Check if user has purchased this product
      const { data: orderData, error: orderError } = await supabase
        .from('order_items')
        .select('id, orders!inner(user_id)')
        .eq('orders.user_id', userId)
        .eq('variant_id', productId)
        .limit(1)

      if (orderError) {
        console.warn('Error checking verified purchase:', orderError)
      }

      const isVerified = Boolean(orderData && orderData.length > 0)

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: userId,
          rating,
          review_text: reviewText.trim(),
          is_verified_purchase: isVerified
        })
        .select()
        .single()

      if (error) throw error

      if (!data) {
        throw new Error('No data returned from insert')
      }

      // Fetch user data separately to avoid join issues
      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', userId)
        .single()

      const userProfile: ReviewProfile | null = userData
        ? { full_name: userData.full_name ?? null }
        : null

      const newReview: Review = {
        id: data.id,
        rating: data.rating,
        review_text: data.review_text,
        is_verified_purchase: data.is_verified_purchase,
        users: userProfile,
        created_at: data.created_at
      }

      onReviewSubmitted(newReview)
      setMessage({ type: 'success', text: 'Review submitted successfully!' })
      setRating(0)
      setReviewText('')

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error submitting review:', error)
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to submit review. Please try again.'
      setMessage({
        type: 'error',
        text: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.reviewFormCard}>
      <h3 className={styles.formTitle}>Write a Review</h3>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Your Rating</label>
          <div className={styles.starRating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={styles.starButton}
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  size={24}
                  fill={(hoverRating || rating) >= star ? '#fbbf24' : 'none'}
                  stroke="#fbbf24"
                />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="review-text">
            Your Review
          </label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your thoughts about this product..."
            rows={4}
            maxLength={500}
            className={styles.textarea}
            required
          />
          <div className={styles.charCounter}>
            {reviewText.length}/500 characters
          </div>
        </div>

        {message && (
          <div className={`${styles.formGroup} ${message.type === 'success' ? styles.successMsg : styles.errorMsg}`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className={styles.submitBtn}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}

/* ---------- Main Component ---------- */
export default function ProductClientPage({
  initialProduct,
  productId,
}: ProductClientPageProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    initialProduct.product_variants[0] || null
  )
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState<boolean>(true)
  const [reviews, setReviews] = useState<Review[]>(initialProduct.reviews || [])

  /* ---------- Auth ---------- */
  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error fetching session:', error)
        }

        if (session?.user) {
          setUserId(session.user.id)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoadingUser(false)
      }
    }

    fetchUser()
  }, [])

  /* ---------- Reviews ---------- */
  const handleNewReview = (review: Review): void => {
    setReviews((prev) => [review, ...prev])
  }

  const totalReviews: number = reviews.length
  const avgRating: string = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0'

  const primaryImage: string = initialProduct.product_images.find((img) => img.is_primary)?.url ||
    initialProduct.product_images[0]?.url ||
    '/placeholder-product.png'

  /* ---------- Render ---------- */
  return (
    <div className={styles.container}>
      <div className={styles.productGrid}>
        {/* Left Column - Image */}
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            <Image
              src={primaryImage}
              alt={initialProduct.name}
              fill
              className={styles.objectContain}
              priority
            />
          </div>

          <div className={styles.trustStrip}>
            <div className={styles.trustItem}>
              <Truck size={16} />
              <span>Fast Shipping</span>
            </div>
            <div className={styles.trustItem}>
              <ShieldCheck size={16} />
              <span>Secure Payment</span>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className={styles.detailsSection}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            Shop / {initialProduct.brands?.name ?? 'General'}
          </nav>

          <h1 className={styles.productTitle}>
            {initialProduct.name}
          </h1>

          <div className={styles.ratingHeader}>
            <div className={styles.stars} role="img" aria-label={`Rating: ${avgRating} out of 5 stars`}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.round(Number(avgRating)) ? '#fbbf24' : 'none'}
                  stroke="#fbbf24"
                />
              ))}
            </div>
            <span className={styles.reviewCount}>
              ({totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'})
            </span>
          </div>

          <div className={styles.priceContainer}>
            <span className={styles.currency}>$</span>
            <span className={styles.priceValue}>
              {selectedVariant ? selectedVariant.price.toFixed(2) : '0.00'}
            </span>
          </div>

          <div className={styles.variantGroup}>
            <label className={styles.label}>
              Select Configuration
            </label>

            <div className={styles.variantGrid} role="group" aria-label="Product variants">
              {initialProduct.product_variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`${styles.variantCard} ${
                    selectedVariant?.id === variant.id ? styles.selected : ''
                  }`}
                  type="button"
                  aria-pressed={selectedVariant?.id === variant.id}
                >
                  <span className={styles.skuLabel}>{variant.sku}</span>
                  <span className={styles.skuPrice}>
                    ${variant.price.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.purchaseBox}>
            <AddToCartButton variantId={selectedVariant?.id ?? ''} />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className={styles.reviewsSection} aria-labelledby="reviews-heading">
        <div className={styles.sectionHeader}>
          <h2 id="reviews-heading">Customer Feedback</h2>
        </div>

        <div className={styles.reviewLayout}>
          {/* Review Form */}
          <div className={styles.reviewFormSide}>
            {!loadingUser && userId ? (
              <ReviewForm
                productId={productId}
                userId={userId}
                onReviewSubmitted={handleNewReview}
              />
            ) : loadingUser ? (
              <div className={styles.loginCard}>
                <p>Loading...</p>
              </div>
            ) : (
              <div className={styles.loginCard}>
                <p>Please sign in to leave a review</p>
              </div>
            )}
          </div>

          {/* Review List */}
          <div className={styles.reviewListSide}>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <article key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewTop}>
                    <div className={styles.reviewStars} role="img" aria-label={`Rating: ${review.rating} out of 5 stars`}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < review.rating ? '#fbbf24' : 'none'}
                          stroke="#fbbf24"
                        />
                      ))}
                    </div>

                    {review.is_verified_purchase && (
                      <span className={styles.verified}>
                        <CheckCircle size={12} /> Verified Buyer
                      </span>
                    )}
                  </div>

                  <p className={styles.reviewText}>
                    &quot;{review.review_text}&quot;
                  </p>

                  <cite className={styles.reviewAuthor}>
                    — {review.users?.full_name ?? 'Anonymous'}
                  </cite>
                </article>
              ))
            ) : (
              <p className={styles.noReviews}>
                No reviews yet. Be the first to leave a review!
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}