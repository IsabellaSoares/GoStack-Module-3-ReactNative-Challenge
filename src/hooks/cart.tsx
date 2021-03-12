import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const prods = await AsyncStorage.getItem('@GoMarketplace:products');

      if (prods) {
        setProducts(JSON.parse(prods));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const copy = [...products];
      const index = products.findIndex(
        (item: Product) => item.id === product.id,
      );

      if (index !== -1) {
        copy[index].quantity += 1;
      } else {
        // eslint-disable-next-line no-param-reassign
        product.quantity = 1;
      }

      setProducts([...copy, product]);

      AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify([...copy, product]),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const copy = [...products];
      const index = products.findIndex((item: Product) => item.id === id);

      if (index !== -1) {
        copy[index].quantity += 1;

        setProducts([...copy]);

        AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...copy]),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const copy = [...products];
      const index = products.findIndex((item: Product) => item.id === id);

      if (index !== -1) {
        copy[index].quantity -= 1;

        setProducts([...copy]);

        AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...copy]),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
