'use client';

import { useState, useEffect} from 'react';
import { PlusCircle, Edit, Trash, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import ViewProductModal from '@/components/products/ViewProductModal';
import EditProductModal from '@/components/products/EditProductModal';
import DeleteProductModal from '@/components/products/DeleteProductModal';
import AddProductModal from '@/components/products/AddProductModal';
import ProductFilters from '@/components/products/ProductFilters';
import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [brand, setBrand] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch products based on filters and pagination
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          ...(category && { category }),
          ...(type && { type }),
          ...(brand && { brand }),
          ...(searchQuery && { search: searchQuery }),
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });

        const response = await fetch(`/api/products?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch products');

        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category, type, brand, currentPage, searchQuery]);

  const handleFilter = ({ category, type, brand }: { category: string; type: string; brand: string }) => {
    setCategory(category);
    setType(type);
    setBrand(brand);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetPage = () => {
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Product actions
  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  return (
    <div className="p-10 flex flex-col h-full bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au tableau de bord
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Ajouter un produit
            </button>
          </div>

          {/* Always show filters */}
          <ProductFilters
            onFilter={handleFilter}
            onResetPage={handleResetPage}
          />

          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marque
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      En stock
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        Aucun produit trouvé
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.media && product.media[0] ? (
                            <Image
                              src={product.media[0].url}
                              alt={product.media[0].alt || product.name}
                              width={64}
                              height={64}
                              className="object-cover rounded-md"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No image</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.brand}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {product.inStock ? 'En stock' : 'En rupture'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-2 transition-colors"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsViewModalOpen(true);
                            }}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900 mr-2 transition-colors"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 transition-colors"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de la page <span className="font-medium">{currentPage}</span> sur{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ViewProductModal
          isOpen={isViewModalOpen}
          closeModal={() => setIsViewModalOpen(false)}
          product={selectedProduct}
        />

        <EditProductModal
          isOpen={isEditModalOpen}
          closeModal={() => setIsEditModalOpen(false)}
          product={selectedProduct}
          onUpdate={handleUpdateProduct}
        />

        <DeleteProductModal
          isOpen={isDeleteModalOpen}
          closeModal={() => setIsDeleteModalOpen(false)}
          product={selectedProduct}
          onDelete={handleDeleteProduct}
        />

        <AddProductModal
          isOpen={isAddModalOpen}
          closeModal={() => setIsAddModalOpen(false)}
          onAdd={(newProduct) => {
            setProducts([...products, newProduct]);
          }}
        />
      </div>
    </div>
  );
}