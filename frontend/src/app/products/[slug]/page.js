import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { formatPrice } from '@/lib/utils';
import ImageGallery from '@/components/product/ImageGallery';
import ProductDetails from '@/components/product/ProductDetails';
import ReviewList from '@/components/product/ReviewList';
import ReviewForm from '@/components/product/ReviewForm';
import ProductCard from '@/components/product/ProductCard';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const product = await apiGet(ENDPOINTS.PRODUCTS.DETAIL(slug));
    return {
      title: product.meta_title || product.name,
      description: product.meta_description || product.short_description,
    };
  } catch {
    return { title: 'Product Not Found' };
  }
}

async function getProduct(slug) {
  try {
    return await apiGet(ENDPOINTS.PRODUCTS.DETAIL(slug), { cache: 'no-store' });
  } catch {
    return null;
  }
}

async function getReviews(slug) {
  try {
    const data = await apiGet(ENDPOINTS.REVIEWS.LIST(slug), { cache: 'no-store' });
    // Reviews may be paginated or plain array
    return {
      results: Array.isArray(data) ? data : (data?.results || []),
      count: data?.count || (Array.isArray(data) ? data.length : 0),
    };
  } catch {
    return { results: [], count: 0 };
  }
}

async function getRelatedProducts(collections) {
  if (!collections?.length) return [];
  try {
    const slug = collections[0].slug;
    const data = await apiGet(
      `${ENDPOINTS.PRODUCTS.LIST}?collection=${slug}&page_size=4`,
      { cache: 'no-store' }
    );
    return data?.results || [];
  } catch {
    return [];
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const [product, reviews] = await Promise.all([
    getProduct(slug),
    getReviews(slug),
  ]);

  if (!product) notFound();

  const related = await getRelatedProducts(product.collections);
  // Filter out the current product from related
  const relatedProducts = related.filter((p) => p.slug !== slug).slice(0, 4);

  return (
    <div className='bg-background pt-16'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        {/* Breadcrumb */}
        <nav className='mb-8 flex items-center gap-2 text-xs text-text-muted'>
          <Link href='/' className='hover:text-accent transition-colors'>Home</Link>
          <span>/</span>
          <Link href='/products' className='hover:text-accent transition-colors'>Products</Link>
          <span>/</span>
          <span className='text-text-primary'>{product.name}</span>
        </nav>

        {/* Product grid */}
        <div className='grid grid-cols-1 gap-12 lg:grid-cols-2'>
          {/* Images */}
          <ImageGallery
            images={product.images || (product.primary_image ? [{ id: 0, image_url: product.primary_image, alt_text: product.name, is_primary: true, sort_order: 0 }] : [])}
            productName={product.name}
          />

          {/* Details */}
          <ProductDetails product={product} />
        </div>

        {/* Reviews */}
        <div className='mt-20 border-t border-border pt-12'>
          <h2 className='text-2xl font-light uppercase tracking-widest text-text-primary mb-8'>
            Reviews
          </h2>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
            <ReviewList
              reviews={reviews.results}
              count={reviews.count}
              averageRating={product.average_rating}
            />
            <div>
              <h3 className='text-sm font-semibold uppercase tracking-widest text-text-primary mb-6'>
                Write a Review
              </h3>
              <ReviewForm productSlug={slug} />
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className='mt-20 border-t border-border pt-12'>
            <h2 className='text-2xl font-light uppercase tracking-widest text-text-primary mb-8'>
              You May Also Like
            </h2>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4'>
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
