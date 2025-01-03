'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/hooks/useCart';

interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  alt?: string;
  order: number;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  type: string;
  description: string;
  price: number;
  features: string[];
  category: string;
  subCategory?: string;
  media: Media[];
  reviews: Review[];
}

export default function ProductPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      const response = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      
      const updatedProduct = await fetch(`/api/products/${id}`).then(res => res.json());
      setProduct(updatedProduct);
      setShowReviewForm(false);
      setRating(5);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
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
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <li>
              <Link href={`/categories/${product.category.toLowerCase()}`} className="text-gray-500 hover:text-gray-700">
                {product.category}
              </Link>
            </li>
            <li>
              <span className="text-gray-500">/</span>
            </li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="relative">
            <div className="aspect-w-1 aspect-h-1 w-full rounded-lg overflow-hidden bg-gray-100">
              {product.media[currentImageIndex]?.type === 'image' ? (
                <Image
                  src={product.media[currentImageIndex].url}
                  alt={product.media[currentImageIndex].alt || product.name}
                  width={600}
                  height={600}
                  className="object-cover object-center"
                />
              ) : (
                <video
                  src={product.media[currentImageIndex].url}
                  controls
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Navigation arrows */}
            {product.media.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Thumbnail grid */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              {product.media.map((media, index) => (
                <button
                  key={media.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                    currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {media.type === 'image' ? (
                    <Image
                      src={media.url}
                      alt={media.alt || `${product.name} thumbnail ${index + 1}`}
                      width={100}
                      height={100}
                      className="object-cover"
                    />
                  ) : (
                    <video src={media.url} className="object-cover" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <div className="flex items-center mb-4">
             
              
            </div>
           
            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Features */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Caractéristiques</h2>
              <ul className="space-y-2">
                {features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Add to Cart Button */}
            <button 
              onClick={() => product && addToCart(product)}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Ajouter au panier
            </button>

            {/* Technical Details */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Détails techniques</h2>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Marque</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.brand}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.type}</dd>
                </div>
                {product.subCategory && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Catégorie</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.subCategory}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Avis clients</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Écrire un avis
            </button>
          </div>

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-8 bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Votre avis</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Partagez votre expérience avec ce produit..."
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700"
              >
                Soumettre
              </button>
            </form>
          )}

          <div className="space-y-8">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-8">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-600">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
