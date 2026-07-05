from django.core.management.base import BaseCommand
from apps.products.models import Product, Size, Color, ProductImage
from apps.collections.models import Collection
from apps.tags.models import Tag

class Command(BaseCommand):
    help = 'Seed the database with initial products'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding database...")

        # 1. Create Collections
        col_men, _ = Collection.objects.get_or_create(
            name="Men", slug="men", defaults={"description": "Premium clothing for men"}
        )
        col_women, _ = Collection.objects.get_or_create(
            name="Women", slug="women", defaults={"description": "Premium clothing for women"}
        )
        col_new, _ = Collection.objects.get_or_create(
            name="New Arrivals", slug="new-arrivals", defaults={"description": "Latest additions"}
        )
        col_oversized, _ = Collection.objects.get_or_create(
            name="Oversized", slug="oversized", defaults={"description": "Comfortable oversized fits"}
        )

        # 2. Create Tags
        tag_minimal, _ = Tag.objects.get_or_create(name="Minimal", slug="minimal")
        tag_graphic, _ = Tag.objects.get_or_create(name="Graphic", slug="graphic")
        tag_cotton, _ = Tag.objects.get_or_create(name="Cotton", slug="cotton")

        # 3. Create Sizes
        for s in ['XS', 'S', 'M', 'L', 'XL']:
            Size.objects.get_or_create(name=s)
        
        # 4. Create Colors
        for c in [('Black', '#000000'), ('White', '#FFFFFF'), ('Navy', '#000080')]:
            Color.objects.get_or_create(name=c[0], hex_code=c[1])

        # 5. Create Products
        p1, created = Product.objects.get_or_create(
            name="Signature Oversized Tee",
            slug="signature-oversized-tee",
            defaults={
                "description": "Our signature oversized t-shirt crafted from heavy-weight premium cotton.",
                "short_description": "Heavy-weight premium cotton oversized tee.",
                "price": 1499.00,
                "status": "published",
                "is_featured": True,
                "is_best_seller": True,
                "is_new_arrival": True,
            }
        )
        
        p2, _ = Product.objects.get_or_create(
            name="Minimalist Hoodie",
            slug="minimalist-hoodie",
            defaults={
                "description": "A clean, minimalist hoodie designed for everyday comfort and luxury.",
                "short_description": "Clean, minimalist luxury hoodie.",
                "price": 2999.00,
                "status": "published",
                "is_featured": True,
            }
        )

        p3, _ = Product.objects.get_or_create(
            name="Graphic Print Boxy Tee",
            slug="graphic-print-boxy-tee",
            defaults={
                "description": "Stand out with this unique graphic print on our signature boxy fit silhouette.",
                "short_description": "Unique graphic print boxy fit.",
                "price": 1299.00,
                "status": "published",
                "is_new_arrival": True,
            }
        )

        if created:
            # Set many-to-many relationships
            sizes = list(Size.objects.all())
            colors = list(Color.objects.all())
            
            p1.collections.set([col_men, col_oversized, col_new])
            p1.tags.set([tag_minimal, tag_cotton])
            p1.sizes.set(sizes)
            p1.colors.set(colors)

            p2.collections.set([col_men, col_women])
            p2.tags.set([tag_minimal])
            p2.sizes.set(sizes)
            p2.colors.set(colors)

            p3.collections.set([col_men, col_oversized])
            p3.tags.set([tag_graphic, tag_cotton])
            p3.sizes.set(sizes)
            p3.colors.set(colors)
            
            # Add images
            ProductImage.objects.get_or_create(
                product=p1, 
                image_url="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1780&auto=format&fit=crop",
                is_primary=True,
                alt_text="Signature Oversized Tee"
            )
            ProductImage.objects.get_or_create(
                product=p2, 
                image_url="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1887&auto=format&fit=crop",
                is_primary=True,
                alt_text="Minimalist Hoodie"
            )
            ProductImage.objects.get_or_create(
                product=p3, 
                image_url="https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1964&auto=format&fit=crop",
                is_primary=True,
                alt_text="Graphic Print Boxy Tee"
            )

        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))
