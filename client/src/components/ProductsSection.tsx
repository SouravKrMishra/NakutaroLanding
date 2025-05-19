import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

interface ProductsSectionProps {
  showFullCatalog?: boolean;
}

const ProductsSection = ({ showFullCatalog = false }: ProductsSectionProps) => {
  const featuredProducts = [
    {
      title: 'Action Figures',
      description: 'Premium collectible action figures featuring your favorite anime characters',
      images: [
        'https://images.unsplash.com/photo-1558679908-541bcf1249ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1607456648016-62021188884f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
      ]
    },
    {
      title: 'Anime T-Shirts',
      description: 'Stylish and comfortable t-shirts with exclusive anime designs',
      images: [
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1618354691792-d1d42acfd860?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
      ]
    },
    {
      title: 'Anime Hoodies',
      description: 'Premium hoodies featuring iconic anime artwork and characters',
      images: [
        'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
      ]
    },
    {
      title: 'Anime Accessories',
      description: 'Complete your look with our curated selection of anime accessories',
      images: [
        'https://images.unsplash.com/photo-1519238359922-333183840e32?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1628340814848-33bad6f2c031?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
      ]
    }
  ];
  
  const additionalProducts = [
    {
      title: 'Manga Collection',
      description: 'Extensive library of popular manga series and limited editions',
      images: [
        'https://images.unsplash.com/photo-1593492654845-a77c1fa186c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1589642774083-a321310a71a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
      ]
    },
    {
      title: 'Anime Posters',
      description: 'High-quality posters featuring artwork from your favorite anime series',
      images: [
        'https://images.unsplash.com/photo-1504237111663-37d862ef9cc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1511984805645-3723e8375a73?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
      ]
    },
    {
      title: 'Anime Cosplay Costumes',
      description: 'Premium quality cosplay costumes for your favorite anime characters',
      images: [
        'https://images.unsplash.com/photo-1599508705587-d32ba1672568?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1550030085-00cee362ae48?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
      ]
    },
    {
      title: 'Anime Stationery',
      description: 'Notebooks, pens, and stationery inspired by popular anime series',
      images: [
        'https://images.unsplash.com/photo-1543589067-47d16999c54f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1540714323673-d74c355eb58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
      ]
    }
  ];
  
  // Determine which products to show based on the showFullCatalog prop
  const products = showFullCatalog 
    ? [...featuredProducts, ...additionalProducts]
    : featuredProducts;

  return (
    <section id="products" className="py-20 bg-[#121212] relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mb-16"
        >
          {/* Collection Header */}
          <motion.div variants={fadeIn('up', 'tween', 0.1, 1)} className="mb-8">
            <div className="inline-block bg-accent/10 px-3 py-1 rounded-sm border-l-2 border-accent">
              <span className="text-accent font-bold text-sm uppercase tracking-widest">
                BEST COLLECTION
              </span>
            </div>
            <div className="mt-2">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Premium Anime
              </h2>
              <h2 className="text-3xl md:text-4xl font-bold text-accent">
                Collectibles & Merchandise
              </h2>
            </div>
            <p className="text-gray-400 mt-4 max-w-2xl">
              Discover authentic anime merchandise from your favorite series. From action
              figures to apparel, we have everything an anime fan could want.
            </p>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <a 
                href="/featured" 
                className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-md transition-colors"
              >
                Featured Items
              </a>
              <a 
                href="/categories" 
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors border border-white/20"
              >
                View Categories
              </a>
            </div>
          </motion.div>
          
          {/* Section Title */}
          <motion.div 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="flex justify-between items-center border-b border-white/10 pb-2 mb-8 mt-20"
          >
            <h3 className="text-xl font-bold">Featured Products</h3>
            <Link 
              href="/products" 
              className="text-accent hover:text-accent/80 transition duration-300 font-medium inline-flex items-center"
            >
              View All Featured <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
        
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {products.map((product, index) => (
            <motion.div
              key={index}
              variants={fadeIn('up', 'tween', 0.1 + index * 0.1, 1)}
              className="bg-[#1E1E1E] rounded-xl overflow-hidden border border-[#2D2D2D] group hover:border-accent/30 transition-all duration-300"
            >
              <div className="relative h-60 overflow-hidden">
                <img 
                  src={product.images[0]} 
                  alt={`${product.title} 1`}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-0"
                />
                <img 
                  src={product.images[1]} 
                  alt={`${product.title} 2`}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                <p className="text-gray-400 mb-4">
                  {product.description}
                </p>
                {showFullCatalog ? (
                  <a 
                    href="https://shop.animeindia.org" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent/80 transition duration-300 font-medium inline-flex items-center"
                  >
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                ) : (
                  <Link 
                    href="/products" 
                    className="text-accent hover:text-accent/80 transition duration-300 font-medium inline-flex items-center"
                  >
                    View All Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Anime-inspired decorative elements */}
      <div className="absolute top-20 right-10 w-24 h-24 bg-accent rounded-full filter blur-3xl opacity-5"></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-accent rounded-full filter blur-3xl opacity-5"></div>
      
      {/* Animated elements */}
      <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
      <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
    </section>
  );
};

export default ProductsSection;