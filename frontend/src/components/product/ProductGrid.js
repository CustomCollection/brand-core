import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';

export default function ProductGrid({ products, isLoading = false, emptyMessage = 'No products found.' }) {
  if (isLoading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (!products || products.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-24 text-center'>
        <p className='text-lg font-light text-text-muted'>{emptyMessage}</p>
        <p className='text-sm text-text-muted mt-2'>Try adjusting your filters or browse all products.</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
