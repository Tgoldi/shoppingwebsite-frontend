import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {Box,Typography,List,ListItem,IconButton,Button,Grid,Paper,CircularProgress,Snackbar,Alert,Card,CardContent,CardMedia,} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { createOrderFromCart } from '../utils/api';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, total, isLoading, fetchCartData, updateQuantity, removeFromCart, clearCart } = useCart();
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCartData().catch(err => setError(err.message));
  }, [fetchCartData]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      if (newQuantity > 0) {
        await updateQuantity(itemId, newQuantity);
      } else {
        await removeFromCart(itemId);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const orderId = await createOrderFromCart();
      if (orderId) {
        console.log('Order created successfully with ID:', orderId);
        navigate(`/order-process/${orderId}`);
      } else {
        setError('Failed to create order. Please try again.');
      }
    } catch (err) {
      console.error("Failed to create order:", err);
      setError(err.message || 'Failed to create order. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>Your Cart</Typography>
      {!cart || cart.length === 0 ? (
        <Typography>Your cart is empty</Typography>
      ) : (
        <>
          <List>
            {cart.map((cartItem) => (
              cartItem && cartItem.item && (
                <ListItem
                  key={cartItem.id}
                  component={Paper}
                  variant="outlined"
                  sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Card sx={{ display: 'flex', width: '100%' }}>
                    <CardMedia
                      component="img"
                      image={cartItem.item.imageUrl}
                      alt={cartItem.item.name}
                      sx={{ width: 100 }}
                    />
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography variant="subtitle1">{cartItem.item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${cartItem.item.price ? cartItem.item.price.toFixed(2) : '0.00'} each
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
                        <IconButton onClick={() => handleQuantityChange(cartItem.item.id, cartItem.quantity - 1)} size="small">
                          <Remove />
                        </IconButton>
                        <Typography sx={{ mx: 1, minWidth: '20px', textAlign: 'center' }}>{cartItem.quantity}</Typography>
                        <IconButton onClick={() => handleQuantityChange(cartItem.item.id, cartItem.quantity + 1)} size="small">
                          <Add />
                        </IconButton>
                        <Typography sx={{ ml: 2, minWidth: '80px', textAlign: 'right' }}>
                          ${cartItem.item.price ? (cartItem.item.price * cartItem.quantity).toFixed(2) : '0.00'}
                        </Typography>
                        <IconButton edge="end" onClick={() => handleQuantityChange(cartItem.item.id, 0)}>
                          <Delete />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </ListItem>
              )
            ))}
          </List>
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Typography variant="h6">
                  Subtotal: ${total.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item>
                <Button variant="contained" color="primary" onClick={handleCreateOrder} sx={{ mr: 1 }}>
                  Proceed to Checkout
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleClearCart}>
                  Clear Cart
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Cart;
