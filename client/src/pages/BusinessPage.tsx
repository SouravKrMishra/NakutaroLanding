import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const BusinessPage = () => {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#181818] text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold mb-6 text-accent">For Business</h1>
        <p className="text-lg mb-8 text-gray-300">
          Partner with{" "}
          <span className="text-accent font-semibold">Anime India</span> to
          bring authentic anime merchandise and experiences to your business,
          event, or organization. We offer bulk orders, custom branding, event
          collaborations, and more. Elevate your brand with our unique
          anime-themed products and services tailored for businesses, colleges,
          and communities.
        </p>
        <Button
          className="bg-accent hover:bg-accent/80 text-white px-8 py-3 text-lg rounded-md transition duration-300"
          onClick={() => setLocation("/products")}
        >
          View Our Products
        </Button>
      </div>
    </div>
  );
};

export default BusinessPage;
