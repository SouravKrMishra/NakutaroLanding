import { PurchaseHistory } from "../../../shared/models/PurchaseHistory.js";
import { productService } from "./productService.js";
import { Product } from "../types/index.js";

interface RecommendationReason {
  type:
    | "purchase_history"
    | "category_preference"
    | "series_preference"
    | "trending"
    | "high_rated";
  description: string;
  confidence: number;
}

interface ProductRecommendation {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  reason: string;
  inStock: boolean;
  confidence: number;
}

class RecommendationService {
  async getRecommendationsForUser(
    userId: string,
    limit: number = 6
  ): Promise<ProductRecommendation[]> {
    try {
      // Get user's purchase history
      const purchaseHistory = await PurchaseHistory.find({ userId })
        .sort({ orderDate: -1 })
        .limit(50);

      if (purchaseHistory.length === 0) {
        // If no purchase history, return trending products
        return await this.getTrendingProducts(limit);
      }

      // Analyze purchase patterns
      const categoryPreferences =
        this.analyzeCategoryPreferences(purchaseHistory);
      const seriesPreferences = this.analyzeSeriesPreferences(purchaseHistory);
      const priceRange = this.analyzePriceRange(purchaseHistory);

      // Get recommendations based on preferences
      const recommendations: ProductRecommendation[] = [];

      // 1. Category-based recommendations
      const categoryRecs = await this.getCategoryBasedRecommendations(
        categoryPreferences,
        purchaseHistory,
        limit / 2
      );
      recommendations.push(...categoryRecs);

      // 2. Series-based recommendations
      const seriesRecs = await this.getSeriesBasedRecommendations(
        seriesPreferences,
        purchaseHistory,
        limit / 2
      );
      recommendations.push(...seriesRecs);

      // 3. Fill remaining slots with trending products
      const remainingSlots = limit - recommendations.length;
      if (remainingSlots > 0) {
        const trendingRecs = await this.getTrendingProducts(remainingSlots);
        recommendations.push(...trendingRecs);
      }

      // Remove duplicates and sort by confidence
      const uniqueRecommendations = this.removeDuplicates(recommendations);
      return uniqueRecommendations.slice(0, limit);
    } catch (error) {
      return await this.getTrendingProducts(limit);
    }
  }

  private analyzeCategoryPreferences(
    purchaseHistory: any[]
  ): Map<string, number> {
    const categoryCount = new Map<string, number>();

    purchaseHistory.forEach((purchase) => {
      const count = categoryCount.get(purchase.category) || 0;
      categoryCount.set(purchase.category, count + 1);
    });

    return categoryCount;
  }

  private analyzeSeriesPreferences(
    purchaseHistory: any[]
  ): Map<string, number> {
    const seriesCount = new Map<string, number>();

    purchaseHistory.forEach((purchase) => {
      const count = seriesCount.get(purchase.series) || 0;
      seriesCount.set(purchase.series, count + 1);
    });

    return seriesCount;
  }

  private analyzePriceRange(purchaseHistory: any[]): {
    min: number;
    max: number;
    avg: number;
  } {
    const prices = purchaseHistory.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    return { min, max, avg };
  }

  private async getCategoryBasedRecommendations(
    categoryPreferences: Map<string, number>,
    purchaseHistory: any[],
    limit: number
  ): Promise<ProductRecommendation[]> {
    const recommendations: ProductRecommendation[] = [];
    const purchasedProductIds = new Set(
      purchaseHistory.map((p) => p.productId)
    );

    // Sort categories by preference
    const sortedCategories = Array.from(categoryPreferences.entries()).sort(
      ([, a], [, b]) => b - a
    );

    for (const [category, count] of sortedCategories) {
      if (recommendations.length >= limit) break;

      try {
        // Get products from this category
        const products = await productService.getProducts({
          category,
          per_page: 20,
          orderby: "rating",
        });

        // Filter out already purchased products and add to recommendations
        for (const product of products.products) {
          if (recommendations.length >= limit) break;
          if (!purchasedProductIds.has(product.id)) {
            const numericRating = parseFloat(product.average_rating ?? "0");
            const numericPrice = Number(product.price) || 0;
            recommendations.push({
              id: String(product.id),
              name: product.name,
              price: numericPrice,
              image: product.images[0]?.src || "",
              rating: Number.isNaN(numericRating) ? 0 : numericRating,
              reviews: product.rating_count || 0,
              category: category,
              reason: `Based on your ${category} purchases`,
              inStock: product.stock?.status === "in_stock",
              confidence: count / purchaseHistory.length,
            });
          }
        }
      } catch (error) {}
    }

    return recommendations;
  }

  private async getSeriesBasedRecommendations(
    seriesPreferences: Map<string, number>,
    purchaseHistory: any[],
    limit: number
  ): Promise<ProductRecommendation[]> {
    const recommendations: ProductRecommendation[] = [];
    const purchasedProductIds = new Set(
      purchaseHistory.map((p) => p.productId)
    );

    // Sort series by preference
    const sortedSeries = Array.from(seriesPreferences.entries()).sort(
      ([, a], [, b]) => b - a
    );

    for (const [series, count] of sortedSeries) {
      if (recommendations.length >= limit) break;

      try {
        // Search for products with this series in name or attributes
        const products = await productService.getProducts({
          per_page: 20,
          orderby: "rating",
        });

        // Filter products that match the series
        const seriesProducts = products.products.filter(
          (product) =>
            product.name.toLowerCase().includes(series.toLowerCase()) ||
            product.categories?.some((cat: any) =>
              cat.name.toLowerCase().includes(series.toLowerCase())
            )
        );

        // Add to recommendations
        for (const product of seriesProducts) {
          if (recommendations.length >= limit) break;
          if (!purchasedProductIds.has(product.id)) {
            const numericRating = parseFloat(product.average_rating ?? "0");
            const numericPrice = Number(product.price) || 0;
            recommendations.push({
              id: String(product.id),
              name: product.name,
              price: numericPrice,
              image: product.images[0]?.src || "",
              rating: Number.isNaN(numericRating) ? 0 : numericRating,
              reviews: product.rating_count || 0,
              category: product.categories?.[0]?.name || "Anime",
              reason: `Similar to your ${series} collection`,
              inStock: product.stock?.status === "in_stock",
              confidence: count / purchaseHistory.length,
            });
          }
        }
      } catch (error) {}
    }

    return recommendations;
  }

  private async getTrendingProducts(
    limit: number
  ): Promise<ProductRecommendation[]> {
    try {
      const products = await productService.getProducts({
        per_page: limit * 2, // Get more to filter
        orderby: "rating",
      });

      // Filter high-rated products
      const highRatedProducts = products.products
        .filter((product) => {
          const numericRating = parseFloat(product.average_rating ?? "0");
          return (Number.isNaN(numericRating) ? 0 : numericRating) >= 4.0;
        })
        .slice(0, limit);

      return highRatedProducts.map((product) => {
        const numericRating = parseFloat(product.average_rating ?? "0");
        const numericPrice = Number(product.price) || 0;
        return {
          id: String(product.id),
          name: product.name,
          price: numericPrice,
          image: product.images[0]?.src || "",
          rating: Number.isNaN(numericRating) ? 0 : numericRating,
          reviews: product.rating_count || 0,
          category: product.categories?.[0]?.name || "Anime",
          reason: "High-rated in your category",
          inStock: product.stock?.status === "instock",
          confidence: 0.5,
        };
      });
    } catch (error) {
      return [];
    }
  }

  private removeDuplicates(
    recommendations: ProductRecommendation[]
  ): ProductRecommendation[] {
    const seen = new Set<string>();
    return recommendations.filter((rec) => {
      if (seen.has(rec.id)) {
        return false;
      }
      seen.add(rec.id);
      return true;
    });
  }

  async addPurchaseToHistory(
    userId: string,
    purchaseData: {
      productId: number;
      productName: string;
      category: string;
      series: string;
      quantity: number;
      price: number;
      totalAmount: number;
    }
  ): Promise<void> {
    try {
      await PurchaseHistory.create({
        userId,
        ...purchaseData,
      });
    } catch (error) {}
  }
}

export const recommendationService = new RecommendationService();
