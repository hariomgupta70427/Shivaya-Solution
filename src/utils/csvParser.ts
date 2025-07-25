import Papa from 'papaparse';
import { Product } from '../types';
import { CSV_CONFIG } from './constants';

export const parseCSV = (file: File): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const products: Product[] = results.data
            .filter((row: any) => row.product_name && row.image_url)
            .map((row: any, index: number) => ({
              id: `product-${index}`,
              product_name: row.product_name || '',
              image_url: row.image_url || '',
              category: row.category || 'uncategorized',
              description: row.description || ''
            }));
          resolve(products);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const fetchCSVFromURL = async (url: string): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: (results) => {
        try {
          const products: Product[] = results.data
            .filter((row: any) => row.product_name && row.image_url)
            .map((row: any, index: number) => ({
              id: `product-${Date.now()}-${index}`,
              product_name: row.product_name || '',
              image_url: row.image_url || '',
              category: row.category || 'uncategorized',
              description: row.description || ''
            }));
          resolve(products);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const generateSampleCSV = (): string => {
  const sampleData = [
    {
      product_name: 'Plastic Storage Container',
      image_url: 'https://images.pexels.com/photos/4226881/pexels-photo-4226881.jpeg',
      category: 'plasticware',
      description: 'Durable plastic storage container with airtight seal'
    },
    {
      product_name: 'Stainless Steel Mixing Bowl',
      image_url: 'https://images.pexels.com/photos/4226924/pexels-photo-4226924.jpeg',
      category: 'kitchenware',
      description: 'Professional grade stainless steel mixing bowl'
    },
    {
      product_name: 'Industrial Storage Crate',
      image_url: 'https://images.pexels.com/photos/4226792/pexels-photo-4226792.jpeg',
      category: 'industrial-crates',
      description: 'Heavy-duty industrial storage and transport crate'
    }
  ];

  return Papa.unparse(sampleData);
};