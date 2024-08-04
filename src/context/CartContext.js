import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem, clearCart as apiClearCart, getCartTotal as apiGetCartTotal, checkItemAvailability } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuth();
    const [cartItemCount, setCartItemCount] = useState(0);

    const calculateCartItemCount = (items) => {
        return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    };

    const fetchCartData = useCallback(async () => {
    if (!isAuthenticated) {
        setCart([]);
        setTotal(0);
        setCartItemCount(0);
        return;
    }
    setIsLoading(true);
    try {
        const [cartResponse, totalResponse] = await Promise.all([
            getCart(),
            apiGetCartTotal()
        ]);
        console.log('Cart response:', cartResponse);
        console.log('Total response:', totalResponse);
        
        let items = [];
        if (cartResponse && Array.isArray(cartResponse.items)) {
            items = cartResponse.items;
        } else if (Array.isArray(cartResponse)) {
            items = cartResponse;
        }
        
        setCart(items);
        setTotal(typeof totalResponse === 'number' ? totalResponse : 0);
        setCartItemCount(calculateCartItemCount(items));
        setError(null);
    } catch (error) {
        console.error('Failed to fetch cart data:', error);
        setError('Failed to fetch cart data. Please try again.');
        setCart([]);
        setTotal(0);
        setCartItemCount(0);
    } finally {
        setIsLoading(false);
    }
}, [isAuthenticated]);

    const addItemToCart = async (itemId, quantity = 1) => {
    console.log(`Attempting to add item ${itemId} with quantity ${quantity}`);
    if (!isAuthenticated) {
        console.log('User not authenticated');
        setError('Please log in to add items to your cart.');
        return;
    }
    try {
        const currentItem = cart.find(item => item.item.id === itemId);
        if (currentItem && currentItem.quantity + quantity > 2) {
            console.log('Exceeds maximum quantity');
            setError("You can't add more than 2 of the same item to your cart.");
            return;
        }

        console.log('Checking item availability');
        const availability = await checkItemAvailability(itemId);
        console.log('Availability:', availability);
        if (!availability || !availability.inStock || availability.availableQuantity < quantity) {
            console.log('Item not available');
            setError("This item is out of stock or the requested quantity is not available.");
            return;
        }

        console.log('Adding item to cart');
        await apiAddToCart({ itemId, quantity });
        console.log('Fetching updated cart data');
        await fetchCartData();
        console.log('Item added successfully');
    } catch (error) {
        console.error('Failed to add item to cart:', error);
        setError(error.response?.data?.message || "Failed to add item to cart. Please try again later.");
    }
};

    const updateQuantity = async (itemId, newQuantity) => {
        if (!isAuthenticated) {
            setError('Please log in to update your cart.');
            return;
        }
        try {
            if (newQuantity > 2) {
                setError("You can't add more than 2 of the same item to your cart.");
                return;
            }

            const availability = await checkItemAvailability(itemId);
            if (!availability || !availability.inStock || availability.availableQuantity < newQuantity) {
                setError("This item is out of stock or the requested quantity is not available.");
                return;
            }

            await apiUpdateCartItem(itemId, { quantity: newQuantity });
            await fetchCartData();
        } catch (error) {
            console.error('Failed to update item quantity:', error);
            setError("Failed to update item quantity. Please try again later.");
        }
    };

    const removeFromCart = async (itemId) => {
        if (!isAuthenticated) {
            setError('Please log in to remove items from your cart.');
            return;
        }
        try {
            await apiRemoveCartItem(itemId);
            await fetchCartData();
        } catch (error) {
            console.error('Failed to remove item from cart:', error);
            setError("Failed to remove item from cart. Please try again later.");
        }
    };

    const clearCart = async () => {
        if (!isAuthenticated) {
            setError('Please log in to clear your cart.');
            return;
        }
        try {
            await apiClearCart();
            await fetchCartData();
        } catch (error) {
            console.error('Failed to clear cart:', error);
            setError("Failed to clear cart. Please try again later.");
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchCartData();
        } else {
            setCart([]);
            setTotal(0);
            setCartItemCount(0);
        }
    }, [fetchCartData, isAuthenticated]);

    return (
        <CartContext.Provider value={{
            cart,
            total,
            isLoading,
            error,
            addItemToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            fetchCartData,
            cartItemCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
