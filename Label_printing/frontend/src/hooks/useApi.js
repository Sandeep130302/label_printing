import { useState, useEffect, useCallback } from 'react';

// ============================================
// useApi HOOK
// ============================================
// Custom hook for handling API calls
// Manages loading, error, and data states
// Automatically fetches data on mount

export function useApi(apiFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFunction();
        if (isMounted) {
          if (response.success) {
            setData(response.data);
          } else {
            setError(response.message || 'Failed to fetch data');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error };
}

// ============================================
// useMutation HOOK
// ============================================
// For POST, PUT, DELETE operations
// Does NOT fetch on mount, only when called

export function useMutation(apiFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(...args);
      if (response.success) {
        setData(response.data);
        return response;
      } else {
        setError(response.message || 'Operation failed');
        return response;
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { data, loading, error, mutate };
}

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: Using useApi for GET requests
/*
import { useApi } from '../hooks/useApi';
import * as api from '../services/api';

function ProductList() {
  const { data: products, loading, error } = useApi(api.getProducts);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products?.map(product => (
        <div key={product.product_id}>{product.product_name}</div>
      ))}
    </div>
  );
}
*/

// Example 2: Using useMutation for POST/PUT/DELETE
/*
import { useMutation } from '../hooks/useApi';
import * as api from '../services/api';

function CreateProduct() {
  const { mutate, loading, error } = useMutation(api.createProduct);

  const handleCreate = async (productName) => {
    try {
      const result = await mutate(productName);
      console.log('Product created:', result.data);
    } catch (err) {
      console.error('Failed to create:', err);
    }
  };

  return (
    <button onClick={() => handleCreate('New Product')} disabled={loading}>
      {loading ? 'Creating...' : 'Create Product'}
    </button>
  );
}
*/

// Example 3: Combining useApi and useMutation
/*
import { useApi, useMutation } from '../hooks/useApi';
import * as api from '../services/api';

function ProductManagement() {
  // Fetch products on mount
  const { data: products, loading: fetchLoading } = useApi(api.getProducts);
  
  // For creating product
  const { mutate: createProduct, loading: createLoading } = useMutation(api.createProduct);
  
  // For deleting product
  const { mutate: deleteProduct } = useMutation(api.deleteProduct);

  const handleCreate = async (name) => {
    const result = await createProduct(name);
    if (result.success) {
      // Refresh list (can also call useApi again or manually add)
      console.log('Product created');
    }
  };

  const handleDelete = async (id) => {
    const result = await deleteProduct(id);
    if (result.success) {
      console.log('Product deleted');
    }
  };

  if (fetchLoading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={() => handleCreate('Test')} disabled={createLoading}>
        {createLoading ? 'Creating...' : 'Create'}
      </button>
      {products?.map(p => (
        <div key={p.product_id}>
          {p.product_name}
          <button onClick={() => handleDelete(p.product_id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
*/
