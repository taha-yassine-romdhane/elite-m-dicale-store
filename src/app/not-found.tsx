'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Home } from 'lucide-react';

function NotFoundContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-bold text-blue-600">404</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Page introuvable
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {from ? `La page "${from}" n'existe pas.` : "La page que vous recherchez n'existe pas."}
          </p>
        </div>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-32 w-32 bg-blue-200 rounded-full"></div>
        </div>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  );
}