import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {Container, Typography, List, ListItem, ListItemText, Button, Box,CircularProgress, Card, CardContent, Grid, Divider, Paper, IconButton,Tooltip, Alert} from '@mui/material';
import { Delete, Add, ShoppingCart } from '@mui/icons-material';
import { getOrder, removeFromOrder } from '../utils/api';

function OrderProcess() {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const loadOrder = useCallback(async () => {
        if (!id) {
            setError('No order ID provided');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getOrder(id);
            setOrder(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching order:', err);
            setError('Failed to load order. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadOrder();
    }, [loadOrder]);

    const isOrderEditable = order && order.status === 'TEMP';

    const handleRemoveItem = async (orderItemId) => {
        try {
            await removeFromOrder(id, orderItemId);
            await loadOrder();
        } catch (err) {
            console.error('Error removing item:', err);
            setError('Failed to remove item. Please try again.');
        }
    };

    const handleAddMoreItems = () => {
        navigate('/', { state: { orderId: id } });
    };

    const handleProceedToCheckout = () => {
        navigate(`/checkout/${id}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm">
                <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => navigate('/')} 
                    sx={{ mt: 2 }}
                >
                    Return to Home
                </Button>
            </Container>
        );
    }

    if (!order) {
        return (
            <Container maxWidth="sm">
                <Alert severity="warning" sx={{ mt: 4 }}>No order found.</Alert>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => navigate('/')} 
                    sx={{ mt: 2 }}
                >
                    Return to Home
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
                Review Your Order
            </Typography>
            <Typography variant="subtitle1" color={isOrderEditable ? "primary" : "secondary"}>
                Status: {order.status}
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                {order.orderItems && order.orderItems.length > 0 ? (
                    <List>
                        {order.orderItems.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <ListItem alignItems="flex-start">
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12} sm={2}>
                                            {item.imageUrl && (
                                                <img 
                                                    src={item.imageUrl} 
                                                    alt={item.itemName || 'Item'} 
                                                    style={{width: '100%', maxWidth: '80px', height: 'auto', objectFit: 'cover'}}
                                                />
                                            )}
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <ListItemText
                                                primary={<Typography variant="subtitle1" fontWeight="bold">{item.itemName || 'Unknown Item'}</Typography>}
                                                secondary={
                                                    <Typography variant="body2" color="text.secondary">
                                                        Price: ${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                                                        <br />
                                                        Quantity: {item.quantity}
                                                    </Typography>
                                                }
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Box display="flex" alignItems="center" justifyContent="flex-end">
                                                <Tooltip title={isOrderEditable ? "Remove item" : "Order is closed"}>
                                                    <span>
                                                        <IconButton 
                                                            onClick={() => handleRemoveItem(item.id)} 
                                                            color="error" 
                                                            size="small"
                                                            disabled={!isOrderEditable}
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </ListItem>
                                {index < order.orderItems.length - 1 && <Divider variant="inset" component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography>No items in this order.</Typography>
                )}
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleAddMoreItems}
                    sx={{ mt: 2 }}
                    disabled={!isOrderEditable}
                >
                    Add More Items
                </Button>
            </Paper>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Order Summary</Typography>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="body1">Total Price:</Typography>
                        <Typography variant="body1" fontWeight="bold">${order.totalPrice.toFixed(2)}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={2}>
                        <ShoppingCart sx={{ mr: 1 }} color="action" />
                        <Typography variant="body2">Shipping to: {order.shippingAddress}</Typography>
                    </Box>
                    {isOrderEditable ? (
                        <Button 
                            variant="contained" 
                            color="primary" 
                            fullWidth 
                            size="large"
                            onClick={handleProceedToCheckout}
                        >
                            Proceed to Checkout
                        </Button>
                    ) : (
                        <Button 
                            variant="contained" 
                            color="secondary" 
                            fullWidth 
                            size="large"
                            onClick={() => navigate('/orders')}
                        >
                            View Order History
                        </Button>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}

export default OrderProcess;