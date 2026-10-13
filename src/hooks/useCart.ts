
import { db } from "../data/db"
import { useState, useEffect, useMemo } from "react"


export const useCart = () => {
    // funcionalidad



    const initialCart = () => {
        const localStorageCart = localStorage.getItem('cart');
        try {
            const parsed = localStorageCart ? JSON.parse(localStorageCart) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("Error al leer el carrito de localStorage:", error);
            localStorage.removeItem('cart');
            return [];
        }
    }

    const [data] = useState(db);
    const [cart, setCart] = useState(initialCart);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart)); // guarda carrito convertido a string
    }, [cart]);

    const MIN_ITEMS = 1;
    const MAX_ITEMS = 5;

    function addToCart(item) {
        const itemExist = cart.findIndex(guitar => guitar.id === item.id);
        if (itemExist >= 0) {
            if (cart[itemExist].quantity >= MAX_ITEMS) return
            const updatedCart = [...cart];
            updatedCart[itemExist] = {
                ...updatedCart[itemExist],
                quantity: updatedCart[itemExist].quantity + 1
            };
            setCart(updatedCart);
        } else {
            const newItem = { ...item, quantity: 1 };
            setCart([...cart, newItem]);
        }
    }
    function decreaseQuantity(id) {
        const updateCart = cart.map(
            (item) => {
                if (item.id === id && item.quantity > MIN_ITEMS) {
                    return {
                        ...item,
                        quantity: item.quantity - 1
                    }
                }
                return item
            })
        setCart(updateCart)
    }
    function increaseQuantity(id) {
        const updateCart = cart.map(
            (item) => {
                if (item.id === id && item.quantity < MAX_ITEMS) {
                    return {
                        ...item,
                        quantity: item.quantity + 1
                    }
                }
                return item
            })
        setCart(updateCart)
    }
    function removeFromCart(id) {
        setCart(prevcart => prevcart.filter(guitar => guitar.id !== id));

    }
    function clearCart() {
        setCart([])
    }






    const isEmpty = useMemo(() => cart.length === 0, [cart]);
    const cartTotal = useMemo(() => cart.reduce((total, item) => total + (item.quantity * item.price), 0),[cart] )








    return {
        // todo lo que se necesita retornar
        //metodos / variables
        cart,
        data,
        addToCart,
        decreaseQuantity,
        increaseQuantity,
        removeFromCart,
        clearCart,
        isEmpty,
        cartTotal

    }
}