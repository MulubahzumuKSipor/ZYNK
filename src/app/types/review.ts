export interface ReviewProfile {
  display_name: string | null
}

export interface Review {
  id: string
  rating: number
  review_text: string
  is_verified_purchase: boolean
  users: ReviewProfile | null // Ensure this matches in both places
  created_at: string
}