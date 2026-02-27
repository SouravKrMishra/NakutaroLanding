import { Request, Response, NextFunction } from "express";
import { FAQ, FAQCategory } from "../../../shared/models/FAQ.js";

// Get all active FAQ categories (public)
export const getPublicCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await FAQCategory.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select("name slug icon order")
      .lean();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// Get all active FAQs (public)
export const getPublicFAQs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.query;

    // First get active categories
    const activeCategories = await FAQCategory.find({ isActive: true })
      .select("_id slug")
      .lean();
    const activeCategoryIds = activeCategories.map((c) => c._id);

    const filter: any = {
      isActive: true,
      category: { $in: activeCategoryIds },
    };

    // If category slug provided, filter by it
    if (category && category !== "all") {
      const categoryDoc = await FAQCategory.findOne({
        slug: category,
        isActive: true,
      }).lean();
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        // Category not found, return empty
        return res.json({
          success: true,
          data: {
            categories: [],
            faqs: [],
          },
        });
      }
    }

    // Get active categories for the response
    const categories = await FAQCategory.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select("name slug icon order")
      .lean();

    // Get FAQs with populated category
    const faqs = await FAQ.find(filter)
      .populate("category", "name slug icon")
      .sort({ order: 1, createdAt: 1 })
      .select("question answer category order")
      .lean();

    // Transform FAQs to include category slug for filtering
    const transformedFaqs = faqs.map((faq: any) => ({
      _id: faq._id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category?.slug || "uncategorized",
      categoryName: faq.category?.name || "Uncategorized",
      order: faq.order,
    }));

    res.json({
      success: true,
      data: {
        categories,
        faqs: transformedFaqs,
      },
    });
  } catch (error) {
    next(error);
  }
};
