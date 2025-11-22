

// Interface for the objects in the 'reviews' array
export interface Review {
  rating: number;
  comment: string;
  date: string; // Or 'Date' if you plan to parse it
  reviewerName: string;
  reviewerEmail: string;
}
