import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {Container,Typography,List,ListItem,CircularProgress,Card,CardContent,CardMedia,Box,Divider,} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { getOrder } from '../utils/api';

function OrderDetails() {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { orderId } = useParams();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const data = await getOrder(orderId);
                setOrder(data);
            } catch (error) {
                console.error('Error fetching order details:', error);
                setError('Failed to load order details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!order) return <Typography>Order not found.</Typography>;

    return (
        <Container sx={{ marginTop: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
                Order Details
            </Typography>
            <Card variant="outlined" sx={{ marginTop: 2, boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Order #{order.id}
                        </Typography>
                        <Typography variant="subtitle1" color={order.status === 'Delivered' ? 'success.main' : 'error.main'}>
                            {order.status} {order.status === 'Delivered' ? <CheckCircleOutlineIcon color="success" /> : <ErrorOutlineIcon color="error" />}
                        </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ marginTop: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Date: {new Date(order.orderDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Total: ${order.totalPrice.toFixed(2)}
                        </Typography>
                    </Box>
                    <Divider sx={{ marginY: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Items:
                    </Typography>
                    <List>
                        {order.orderItems.map((item) => (
                            <ListItem key={item.id} sx={{ paddingLeft: 0 }}>
                                <Card sx={{ display: 'flex', width: '100%', boxShadow: 1, borderRadius: 1, marginBottom: 2 }}>
                                    <CardMedia
                                        component="img"
                                        image={item.imageUrl}
                                        alt={item.itemName}
                                        sx={{ width: 100 }}
                                    />
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <Typography variant="body1">
                                            {item.itemName}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Quantity: {item.quantity} - Price: ${(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ marginY: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                        Shipping Address:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        {order.shippingAddress}
                    </Typography>
                </CardContent>
            </Card>
        </Container>
    );
}

export default OrderDetails;
