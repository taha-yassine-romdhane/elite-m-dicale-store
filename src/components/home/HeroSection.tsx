'use client';
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const heroProducts = [
  {
    id: 1,
    title: "Machine CPAP Pro",
    description: "Solution avancée pour l'apnée du sommeil avec technologie intelligente",
    image: "/hero section/Capture d'écran 2024-12-28 160625.png", // Fixed image path
    link: "/produits/cpap-pro",
    highlight: "Nouveau",
  },
  {
    id: 2,
    title: "Concentrateur d'Oxygène Premium",
    description: "Oxygénothérapie de haute performance pour un confort optimal",
    image: "/hero section/Capture d'écran 2024-12-28 160713.png", // Fixed image path
    link: "/produits/concentrateur-oxygene",
    highlight: "Populaire",
  },
  {
    id: 3,
    title: "Masque Nasal Confort+",
    description: "Masque ergonomique avec coussin en silicone pour un ajustement parfait",
    image: "/hero section/photo1.png", // Fixed image path
    link: "/produits/masque-nasal",
    highlight: "Meilleure vente",
  },
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === heroProducts.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative h-[500px] overflow-hidden mt-16">
      {heroProducts.map((product, index) => (
        <div
          key={product.id}
          className={`absolute inset-0 transition-all duration-700 ease-out transform
            ${index === currentIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"}`}
        >
          <Image
            src={product.image}
            alt=""
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-black/50" />
          {/* Logo Overlay with Background Effect */}
          <div className="absolute bottom-14 right-1/4 transform -translate-x-1/2">
            <div className="p-4 bg-white/10 rounded-full backdrop-blur-md">
              <Image
                src="/logo_No_BG.png"
                alt="Logo"
                width={150}
                height={150}
                className="opacity-90"
              />
            </div>
          </div>
        </div>
      ))}
      {/* Content and other elements remain unchanged */}
      <div className="relative h-full max-w-7xl mx-auto px-4">
        <div className="h-full flex items-center">
          <div className="max-w-xl space-y-6">
            <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm text-white transform transition-all duration-500 hover:scale-105">
              {heroProducts[currentIndex].highlight}
            </div>
            <h1 className="text-6xl font-bold text-white transition-all duration-500 ease-out transform">
              {heroProducts[currentIndex].title}
            </h1>
            <p className="text-xl text-white/90 transition-all duration-500 ease-out transform">
              {heroProducts[currentIndex].description}
            </p>
            <div className="flex items-center gap-6">
              <Link
                href={heroProducts[currentIndex].link}
                className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Découvrir
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
