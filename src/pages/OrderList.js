import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button, Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { getUserOrders } from '../utils/api';

function OrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await getUserOrders();
            setOrders(data);
            setError(null);
        } catch (err) {
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Your Orders
            </Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : orders.length === 0 ? (
                <Typography>You don't have any orders yet.</Typography>
            ) : (
                <List>
                    {orders.map(order => (
                        <ListItem key={order.id} divider sx={{ alignItems: 'flex-start' }}>
                            <ListItemText
                                primary={`Order #${order.id}`}
                                secondary={
                                    <>
                                        <Typography component="span" display="block">Status: {order.status}</Typography>
                                        <Typography component="span" display="block">Date: {new Date(order.orderDate).toLocaleDateString()}</Typography>
                                        <Typography component="span" display="block">Total: ${order.totalPrice}</Typography>
                                    </>
                                }
                            />
                            <Box>
                                {order.status === 'TEMP' ? (
                                    <Button 
                                        component={Link} 
                                        to={`/order-process/${order.id}`} 
                                        variant="contained" 
                                        color="primary"
                                        sx={{ ml: 2 }}
                                    >
                                        Continue Order
                                    </Button>
                                ) : (
                                    <Button 
                                        component={Link} 
                                        to={`/order-details/${order.id}`} 
                                        variant="outlined" 
                                        color="primary"
                                        sx={{ ml: 2 }}
                                    >
                                        View Details
                                    </Button>
                                )}
                            </Box>
                        </ListItem>
                    ))}
                </List>
            )}
            <Button onClick={loadOrders} variant="contained" color="secondary" sx={{ mt: 3 }}>
                Refresh Orders
            </Button>
            <Snackbar
                open={Boolean(error)}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default OrderList;
