'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { Product, Media } from '@/types/product';
import Image from 'next/image';

interface EditProductModalProps {
  isOpen: boolean;
  closeModal: () => void;
  product: Product | null;
  onUpdate: (updatedProduct: Product) => void;
}

export default function EditProductModal({ isOpen, closeModal, product, onUpdate }: EditProductModalProps) {
  const [formData, setFormData] = useState<Product | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (product) {
      // Parse features if it's a string or JSON object
      let parsedFeatures: string[] = [];
      try {
        if (typeof product.features === 'string') {
          parsedFeatures = JSON.parse(product.features);
        } else if (typeof product.features === 'object') {
          // If it's already a JSON object from Prisma
          parsedFeatures = Array.isArray(product.features) ? product.features : [];
        }
      } catch (error) {
        console.error('Error parsing features:', error);
        parsedFeatures = [];
      }

      setFormData({
        ...product,
        features: parsedFeatures
      });
    }
  }, [product]);

  if (!formData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      // Prepare the data
      const productData = {
        ...formData,
        price: Number(formData.price),
        // Ensure features is an array before sending to API
        features: Array.isArray(formData.features) ? formData.features : [],
        media: formData.media.map((m, index) => ({
          ...m,
          order: index
        }))
      };

      console.log('Submitting product data:', productData); // Debug log

      const response = await fetch(`/api/products/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const result = await response.json();
      onUpdate(result);
      closeModal();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: type === 'number' ? parseFloat(value) : value,
      };
    });
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !formData) return;

    setUploadingMedia(true);
    try {
      for (const file of Array.from(files)) {

        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        const newMedia: Media = {
          url: data.url,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          alt: file.name,
          order: formData.media.length
        };

        setFormData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            media: [...prev.media, newMedia]
          };
        });
      }
    } catch (error) {
      console.error('Error uploading media:', error);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleMediaDelete = (index: number) => {
    setFormData(prev => {
      if (!prev) return prev;
      const newMedia = [...prev.media];
      newMedia.splice(index, 1);
      return {
        ...prev,
        media: newMedia.map((m, i) => ({ ...m, order: i }))
      };
    });
  };

  const handleAddFeature = () => {
    if (!formData || !newFeature.trim()) return;

    setFormData(prev => {
      if (!prev) return prev;
      const currentFeatures = Array.isArray(prev.features) ? prev.features : [];
      return {
        ...prev,
        features: [...currentFeatures, newFeature.trim()]
      };
    });
    setNewFeature('');
  };

  const handleRemoveFeature = (index: number) => {
    if (!formData) return;

    setFormData(prev => {
      if (!prev) return prev;
      const currentFeatures = Array.isArray(prev.features) ? prev.features : [];
      return {
        ...prev,
        features: currentFeatures.filter((_, i) => i !== index)
      };
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="div" className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Modifier le produit
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nom
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                        Marque
                      </label>
                      <input
                        type="text"
                        name="brand"
                        id="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        Type
                      </label>
                      <input
                        type="text"
                        name="type"
                        id="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                        Prix
                      </label>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        value={formData.price}
                        onChange={handleChange}
                        step="0.01"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Catégorie
                      </label>
                      <input
                        type="text"
                        name="category"
                        id="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700">
                        Sous-catégorie
                      </label>
                      <input
                        type="text"
                        name="subCategory"
                        id="subCategory"
                        value={formData.subCategory || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Médias
                    </label>
                    <div className="mb-4">
                      <label className="block w-full cursor-pointer">
                        <div className="px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            {uploadingMedia ? 'Téléchargement...' : 'Ajouter des images ou vidéos'}
                          </span>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleMediaUpload}
                          disabled={uploadingMedia}
                        />
                      </label>
                    </div>
                    <div className="space-y-2">
                      {formData.media
                        .sort((a, b) => a.order - b.order)
                        .map((media, index) => (
                          <div
                            key={media.id || index}
                            className="flex items-center gap-2"
                          >
                            {media.type === 'image' ? (
                              <Image
                                src={media.url}
                                alt={media.alt || 'Media'}
                                width={100}
                                height={100}
                                className="rounded-md"
                                quality={75}
                              />
                            ) : (
                              <video
                                src={media.url}
                                controls
                                className="rounded-md w-full max-w-[100px]"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => handleMediaDelete(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Caractéristiques
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                          placeholder="Ajouter une caractéristique"
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddFeature}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Ajouter
                        </button>
                      </div>
                      <ul className="space-y-2">
                        {formData && Array.isArray(formData.features) && formData.features.map((feature, index) => (
                          <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                            <span className="text-sm text-gray-700">{feature}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="inStock" className="block text-sm font-medium text-gray-700">
                      Statut
                    </label>
                    <select
                      name="inStock"
                      id="inStock"
                      value={formData.inStock.toString()}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.value === 'true' })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="true">En stock</option>
                      <option value="false">En rupture</option>
                    </select>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Sauvegarder
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
