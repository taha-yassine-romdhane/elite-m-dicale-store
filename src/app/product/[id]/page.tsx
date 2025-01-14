'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/types/product';

export default function ProductPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const nextImage = () => {
    if (product?.media) {
      setCurrentImageIndex((prev) => (prev + 1) % product.media.length);
    }
  };

  const prevImage = () => {
    if (product?.media) {
      setCurrentImageIndex((prev) => (prev - 1 + product.media.length) % product.media.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        </div>
      </div>
    );
  }

  const features =  (Array.isArray(product.features) ? product.features :
      typeof product.features as string === 'string' ? JSON.parse(product.features) :
          []).slice(0, 3).map((feature: string) => (
      <>
        <span className="text-blue-500 mr-2"></span>
        {feature}
      </>
  ));
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Accueil
              </Link>
            </li>
            <li>
              <span className="text-gray-500">/</span>
            </li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 min-h-[600px]">
          {/* Product Images and Video */}
          <div className="relative space-y-6">
            {/* Main Image Display */}
            <div className="aspect-w-1 aspect-h-1 w-full rounded-lg overflow-hidden bg-gray-100 min-h-[400px]">
              {product.media[currentImageIndex]?.type === 'image' ? (
                <Image
                  src={product.media[currentImageIndex].url}
                  alt={product.media[currentImageIndex].alt || product.name}
                  width={600}
                  height={600}
                  className="object-cover object-center"
                  priority
                />
              ) : null}
            </div>

            {/* Navigation arrows for images */}
            {product.media.filter(m => m.type === 'image').length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-[200px] bg-white/80 rounded-full p-2 hover:bg-white shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-[200px] bg-white/80 rounded-full p-2 hover:bg-white shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Thumbnail grid for images */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              {product.media
                .filter(media => media.type === 'image')
                .map((media, index) => (
                  <button
                    key={media.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-w-1 aspect-h-1 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                      currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <Image
                      src={media.url}
                      alt={media.alt || `${product.name} thumbnail ${index + 1}`}
                      width={100}
                      height={100}
                      className="object-cover"
                    />
                  </button>
                ))}
            </div>

            {/* Video Display */}
            {product.media.filter(media => media.type === 'video').map((video) => (
              <div key={video.id} className="w-full rounded-lg overflow-hidden bg-gray-100 shadow-lg mt-8">
                <video
                  src={video.url}
                  controls
                  className="w-full aspect-video object-cover"
                  poster={product.media.find(m => m.type === 'image')?.url}
                />
              </div>
            ))}
          </div>

          {/* Product Info */}
          <div className="flex flex-col min-h-[600px]">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            {/* Product Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center">
                <span className="text-gray-600 font-medium">Marque:</span>
                <span className="ml-2 text-blue-900 font-bold">{product.brand}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium">Catégorie:</span>
                <span className="ml-2 text-blue-900">{product.category}</span>
              </div>
              {product.subCategory && (
                <div className="flex items-center">
                  <span className="text-gray-600 font-medium">Sous-catégorie:</span>
                  <span className="ml-2 text-blue-900">{product.subCategory}</span>
                </div>
              )}
              <div className="flex items-center">
                <span className="text-gray-600 font-medium">Type:</span>
                <span className="ml-2 text-blue-900">{product.type}</span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                product.inStock 
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  product.inStock ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium">
                  {product.inStock ? 'En stock' : 'Rupture de stock'}
                </span>
              </div>
            </div>
           
            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Caractéristiques</h2>
                <ul className="space-y-3">
                  {features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500 mr-3"></span>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}


            {/* Add to Cart Section */}
            <div className="mt-auto pt-6 border-t border-gray-200">
              <button
                onClick={() => addToCart(product)}
                disabled={!product.inStock}
                className={`w-full py-4 px-6 rounded-lg text-white font-bold text-lg transition-all ${
                  product.inStock
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {product.inStock ? 'Ajouter au panier' : 'Produit indisponible'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
