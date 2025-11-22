import { Product } from '@/app/types/product'; 

export function getRandomProducts(products: Product[], count: number): Product[] {
    const shuffled  = [...products];
    for (let i = shuffled.length -1; i > 0; i--){
        const random_index = Math.floor(Math.random()* (i+1));
        [shuffled[i], shuffled[random_index]] = [shuffled[random_index], shuffled[i]];
    }
    return shuffled.slice(0, count);
}