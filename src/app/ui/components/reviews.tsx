'use client'

import { useState } from 'react'
import { Star, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/client'
import styles from '../styles/review_form.module.css'

/* ---------- Types matched to your SQL Schema ---------- */

export interface ReviewUser {
  full_name: string | null
}

export interface Review {
  id: string
  rating: number
  review_text: string
  is_verified_purchase: boolean
  // We name this 'profiles' in the UI for consistency,
  // but we will map it from the 'users' table data
  profiles: ReviewUser | null
  created_at: string
}

type ReviewFormProps = {
  productId: string
  userId?: string | null
  onReviewSubmitted?: (review: Review, fromBackend?: boolean) => void
}

export default function ReviewForm({ productId, userId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setSubmitting(true)

    // 1. Optimistic Update
    const tempReview: Review = {
      id: `temp-${Date.now()}`,
      rating,
      review_text: text,
      profiles: { full_name: 'You' },
      is_verified_purchase: false,
      created_at: new Date().toISOString(),
    }
    onReviewSubmitted?.(tempReview)

    // 2. Supabase Insert
    // Note: We use 'users' because your SQL table is named 'users'
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        rating,
        review_text: text,
      })
      .select(`
        id,
        rating,
        review_text,
        is_verified_purchase,
        created_at,
        users (
          full_name
        )
      `)
      .single()

    if (error) {
      setStatus({ type: 'error', msg: 'Failed to submit review.' })
      setSubmitting(false)
      return
    }

    // 3. Fix the "Array vs Object" type error
    // data.users might come back as an array even with .single() in some client versions
    const rawUser = data.users
    const formattedReview: Review = {
      id: data.id,
      rating: data.rating,
      review_text: data.review_text,
      is_verified_purchase: data.is_verified_purchase,
      created_at: data.created_at,
      profiles: Array.isArray(rawUser) ? rawUser[0] : rawUser,
    }

    onReviewSubmitted?.(formattedReview, true)
    setText('')
    setRating(5)
    setSubmitting(false)
    setStatus({ type: 'success', msg: 'Review posted!' })
  }

  if (!userId) return null

  return (
    <form onSubmit={handleSubmit} className={styles.reviewForm}>
       {/* ... existing JSX (Stars, Textarea, Button) ... */}
       <h3>Leave a Review</h3>
       <div className={styles.starRow}>
         {[1,2,3,4,5].map(n => (
           <Star
            key={n}
            onClick={() => setRating(n)}
            fill={rating >= n ? '#fbbf24' : 'none'}
            stroke="#fbbf24"
            style={{cursor: 'pointer'}}
           />
         ))}
       </div>
       <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your review..."
        required
       />
       <button type="submit" disabled={submitting}>
         {submitting ? <Loader2 className="animate-spin" /> : 'Post Review'}
       </button>
    </form>
  )
}