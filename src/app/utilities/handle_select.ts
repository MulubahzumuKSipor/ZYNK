
export const handleSelect = (_id: string | number) => {
  // Navigate to product page or update state
  window.location.href = `/shop/${_id}`; // simple page navigation
};
