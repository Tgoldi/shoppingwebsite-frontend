import React, { useState, useEffect } from 'react';
import {Container,Typography,List,ListItem,Accordion,AccordionSummary,AccordionDetails,CircularProgress,Card,CardContent,CardMedia,Grid,Box} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { getUserOrderHistory } from '../utils/api';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getUserOrderHistory();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
        </Box>
    );

    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Order History
            </Typography>
            {orders.length === 0 ? (
                <Typography>You have no past orders.</Typography>
            ) : (
                <List>
                    {orders.map((order) => (
                        <ListItem key={order.id}>
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h6" component="div">
                                        Order #{order.id} - {new Date(order.orderDate).toLocaleDateString()}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Card variant="outlined" sx={{ width: '100%' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Status: {order.status} {order.status === 'Delivered' ? <CheckCircleOutlineIcon color="success" /> : <ErrorOutlineIcon color="error" />}
                                            </Typography>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Total: ${order.totalPrice.toFixed(2)}
                                            </Typography>
                                            <Typography variant="h6" gutterBottom>
                                                Items:
                                            </Typography>
                                            <List>
                                                {order.orderItems.map((item) => (
                                                    <ListItem key={item.id} sx={{ paddingLeft: 0 }}>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={4}>
                                                                <CardMedia
                                                                    component="img"
                                                                    image={item.imageUrl}
                                                                    alt={item.itemName}
                                                                    sx={{ maxWidth: '100px' }}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={8}>
                                                                <Typography>
                                                                    {item.itemName} - Quantity: {item.quantity} - Price: ${(item.price * item.quantity).toFixed(2)}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </ListItem>
                                                ))}
                                            </List>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Shipping Address: {order.shippingAddress}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </AccordionDetails>
                            </Accordion>
                        </ListItem>
                    ))}
                </List>
            )}
        </Container>
    );
}

export default OrderHistory;
