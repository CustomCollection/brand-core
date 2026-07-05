import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import ProductDetails from '@/components/product/ProductDetails';
import ProductCard from '@/components/product/ProductCard';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const product = await apiGet(ENDPOINTS.PRODUCTS.DETAIL(slug));
    return {
      title: product.name,
      description: product.description,
    };
  } catch {
    return {
      title: 'Product Not Found',
    };
  }
}

async function getProduct(slug) {
  try {
    return await apiGet(ENDPOINTS.PRODUCTS.DETAIL(slug), { next: { revalidate: 60 } });
  } catch {
    return null;
  }
}

async function getRelatedProducts() {
  try {
    // Just fetch some products for the related section mockup
    const data = await apiGet(ENDPOINTS.PRODUCTS.LIST, { next: { revalidate: 60 } });
    return data?.results?.slice(0, 4) || [];
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  const relatedProducts = await getRelatedProducts();

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-light text-text-primary mb-4">Product Not Found</h1>
        <p className="text-text-secondary mb-8">The product you are looking for does not exist or has been removed.</p>
        <Link href="/products" className="text-sm font-medium uppercase tracking-widest text-accent hover:underline">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex text-xs uppercase tracking-wider text-text-muted">
          <Link href="/" className="hover:text-text-primary transition-colors">Home</Link>
          <span className="mx-3">/</span>
          <Link href="/products" className="hover:text-text-primary transition-colors">Shop</Link>
          <span className="mx-3">/</span>
          <span className="text-text-primary">{product.name}</span>
        </nav>

        {/* Product Details Component (Client-side interactive) */}
        <ProductDetails product={product} />

        {/* Reviews Section Mockup (Can be a separate component if interactive) */}
        <div className="mt-32 border-t border-border pt-16">
          <h2 className="text-2xl font-light text-text-primary uppercase tracking-widest mb-12 text-center">Customer Reviews</h2>
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/3 text-center lg:text-left">
              <div className="text-6xl font-light text-text-primary mb-2">4.8</div>
              <div className="flex justify-center lg:justify-start text-accent mb-2">
                {[1,2,3,4,5].map(i => (
                   <svg key={i} className="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                ))}
              </div>
              <p className="text-sm text-text-secondary">Based on 124 reviews</p>
              <button className="mt-6 border border-primary px-6 py-3 text-sm font-medium uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-colors">
                Write a Review
              </button>
            </div>
            
            <div className="lg:w-2/3 space-y-8">
              {[1, 2, 3].map((review) => (
                <div key={review} className="border-b border-border pb-8 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex text-accent text-sm">
                       {[1,2,3,4,5].map(i => <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                    </div>
                    <span className="text-xs text-text-muted">Oct 24, 2025</span>
                  </div>
                  <h4 className="text-sm font-medium text-text-primary mb-2">Exceeded Expectations</h4>
                  <p className="text-sm font-light text-text-secondary leading-relaxed">
                    The quality of the material is outstanding. It fits perfectly and feels incredibly premium. I've received multiple compliments already. Highly recommend!
                  </p>
                  <p className="mt-4 text-xs font-medium text-text-muted uppercase tracking-wider">Jane D. <span className="opacity-50">Verified Buyer</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-16 border-t border-border">
            <h2 className="text-2xl font-light text-text-primary uppercase tracking-widest mb-12 text-center">You May Also Like</h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {relatedProducts.map(rp => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
