import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { ArrowRight, ShoppingBag, Star, Heart, Sparkles, Tag, TrendingUp, CircleArrowRight } from 'lucide-react';
import { Link } from 'wouter';

interface ProductsSectionProps {
  showFullCatalog?: boolean;
}

const ProductsSection = ({ showFullCatalog = false }: ProductsSectionProps) => {
  const featuredProducts = [
    {
      title: 'Action Figures',
      description: 'Premium collectible action figures featuring your favorite anime characters',
      price: '₹1,299 - ₹4,599',
      badge: 'New Arrivals',
      images: [
        'https://images.unsplash.com/photo-1558679908-541bcf1249ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1607456648016-62021188884f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
      ]
    },
    {
      title: 'Anime T-Shirts',
      description: 'Stylish and comfortable t-shirts with exclusive anime designs',
      price: '₹599 - ₹999',
      badge: 'Best Seller',
      images: [
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1618354691792-d1d42acfd860?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
      ]
    },
    {
      title: 'Anime Hoodies',
      description: 'Premium hoodies featuring iconic anime artwork and characters',
      price: '₹1,199 - ₹2,499',
      badge: 'Limited Edition',
      images: [
        'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
      ]
    },
    {
      title: 'Anime Accessories',
      description: 'Complete your look with our curated selection of anime accessories',
      price: '₹399 - ₹999',
      badge: 'Popular',
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
      price: '₹499 - ₹1,999',
      badge: 'Exclusive',
      images: [
        'https://images.unsplash.com/photo-1593492654845-a77c1fa186c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1589642774083-a321310a71a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
      ]
    },
    {
      title: 'Anime Posters',
      description: 'High-quality posters featuring artwork from your favorite anime series',
      price: '₹299 - ₹899',
      badge: 'Trending',
      images: [
        'https://images.unsplash.com/photo-1504237111663-37d862ef9cc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1511984805645-3723e8375a73?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
      ]
    },
    {
      title: 'Anime Cosplay Costumes',
      description: 'Premium quality cosplay costumes for your favorite anime characters',
      price: '₹2,499 - ₹5,999',
      badge: 'Pre-order',
      images: [
        'https://images.unsplash.com/photo-1599508705587-d32ba1672568?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1550030085-00cee362ae48?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
      ]
    },
    {
      title: 'Anime Stationery',
      description: 'Notebooks, pens, and stationery inspired by popular anime series',
      price: '₹199 - ₹599',
      badge: 'New Collection',
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

  // Product categories for filters
  const categories = [
    { name: 'All Products', icon: <ShoppingBag className="h-4 w-4" /> },
    { name: 'New Arrivals', icon: <Sparkles className="h-4 w-4" /> },
    { name: 'Best Sellers', icon: <TrendingUp className="h-4 w-4" /> },
    { name: 'Limited Edition', icon: <Star className="h-4 w-4" /> },
    { name: 'Sale Items', icon: <Tag className="h-4 w-4" /> }
  ];

  return (
    <section id="products" className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[#0A0A0A] overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        
        {/* Animated background elements */}
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 bg-accent/5 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 15, 0]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        
        <motion.div 
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/5 rounded-full"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -10, 0]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="mb-16"
        >
          {/* Collection Header */}
          <motion.div variants={fadeIn('up', 'tween', 0.1, 1)} className="mb-12 text-center lg:text-left">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="inline-block bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20 mb-6"
            >
              <span className="text-accent font-medium text-sm flex items-center justify-center">
                <Sparkles className="h-4 w-4 mr-2" />
                PREMIUM COLLECTION
              </span>
            </motion.div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">
              Premium <span className="text-accent">Anime</span>
            </h2>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Collectibles & <span className="text-accent">Merchandise</span>
            </h2>
            
            <motion.div
              variants={fadeIn('up', 'tween', 0.2, 1)}
              className="max-w-2xl mx-auto lg:mx-0"
            >
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Discover authentic anime merchandise from your favorite series. From action
                figures to apparel, we have everything an anime fan could want.
              </p>
            </motion.div>
            
            <motion.div 
              variants={fadeIn('up', 'tween', 0.3, 1)}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <a 
                href="https://shop.animeindia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-accent to-accent/80 px-8 py-3 text-lg font-bold text-white transition-all duration-300 ease-out hover:scale-105"
              >
                <span className="absolute inset-0 bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                <span className="absolute bottom-0 left-0 h-1 w-full bg-white opacity-10"></span>
                <span className="absolute right-0 -mt-3 h-16 w-16 rotate-45 translate-x-8 -translate-y-2 bg-white opacity-10"></span>
                <span className="relative flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Shop Featured Items
                </span>
              </a>
              
              <a 
                href="/categories"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-accent/40 bg-[#181818] px-8 py-3 text-lg font-bold text-white transition-all duration-300 ease-out hover:scale-105"
              >
                <span className="absolute inset-0 translate-y-32 transition-transform duration-300 ease-out group-hover:translate-y-0">
                  <span className="absolute inset-0 opacity-30 bg-gradient-to-b from-accent to-transparent"></span>
                </span>
                <span className="relative flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-accent" />
                  View Categories
                </span>
              </a>
            </motion.div>
          </motion.div>
          
          {/* Category filters */}
          <motion.div 
            variants={fadeIn('up', 'tween', 0.4, 1)}
            className="flex flex-wrap justify-center gap-2 my-12"
          >
            {categories.map((category, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${
                  index === 0 
                    ? 'bg-accent text-white' 
                    : 'bg-[#1A1A1A] text-gray-300 hover:bg-[#222] border border-[#333]'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
        
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {products.map((product, index) => (
            <motion.div
              key={index}
              variants={fadeIn('up', 'tween', 0.1 + index * 0.1, 1)}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] rounded-xl overflow-hidden border border-[#333] group hover:border-accent/30 transition-all duration-300 shadow-lg"
            >
              <div className="relative h-60 overflow-hidden">
                {/* Badge */}
                <div className="absolute top-3 left-3 z-20">
                  <div className="bg-accent/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg">
                    {product.badge}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-2 rounded-full shadow-lg transition-colors duration-300">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Images with hover effect */}
                <div className="relative h-full">
                  <img 
                    src={product.images[0]} 
                    alt={`${product.title} 1`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <img 
                      src={product.images[1]} 
                      alt={`${product.title} 2`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent"></div>
                </div>
              </div>
              
              <div className="p-6 relative">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors duration-300">
                    {product.title}
                  </h3>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm text-gray-300 ml-1">4.9</span>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold text-accent">
                    {product.price}
                  </div>
                  
                  {showFullCatalog ? (
                    <a 
                      href="https://shop.animeindia.org" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors duration-300"
                    >
                      <CircleArrowRight className="h-5 w-5" />
                    </a>
                  ) : (
                    <Link 
                      href="/products" 
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors duration-300"
                    >
                      <CircleArrowRight className="h-5 w-5" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* View more button */}
        {!showFullCatalog && (
          <motion.div
            variants={fadeIn('up', 'tween', 0.6, 1)}
            className="mt-16 text-center"
          >
            <Link 
              href="/products" 
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-accent/40 bg-[#181818] px-8 py-3 text-lg font-bold text-white transition-all duration-300 ease-out hover:scale-105"
            >
              <span className="absolute inset-0 translate-y-32 transition-transform duration-300 ease-out group-hover:translate-y-0">
                <span className="absolute inset-0 opacity-30 bg-gradient-to-b from-accent to-transparent"></span>
              </span>
              <span className="relative flex items-center">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            </Link>
          </motion.div>
        )}
      </div>
      
      {/* Animated elements */}
      <div className="absolute top-1/4 left-8 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
      <div className="absolute bottom-1/4 right-8 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
      <div className="absolute top-3/4 left-1/3 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
      
      {/* Accent glows */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-accent rounded-full opacity-[0.02] filter blur-[100px]"></div>
    </section>
  );
};

export default ProductsSection;