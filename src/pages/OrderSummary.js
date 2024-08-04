import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, List, ListItem, ListItemText, Button, Box, CircularProgress, Paper, Grid, Divider, Card, CardContent, Avatar} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Edit, CheckCircle } from '@mui/icons-material';
import { getOrder, closeOrder } from '../utils/api';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 60,
    height: 60,
    marginRight: theme.spacing(2),
}));

function OrderSummary() {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const loadOrder = async () => {
            try {
                setLoading(true);
                const data = await getOrder(id);
                setOrder(data);
                setError(null);
            } catch (err) {
                setError('Failed to load order. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [id]);

    const handlePlaceOrder = async () => {
        try {
            await closeOrder(order.id);
            alert('Order placed successfully!');
            navigate('/orders');
        } catch (err) {
            setError('Failed to place order. Please try again.');
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!order || order.orderItems.length === 0) {
        return (
            <Container maxWidth="sm">
                <StyledPaper elevation={3}>
                    <Typography variant="h5" gutterBottom>Your order is empty.</Typography>
                    <Button variant="contained" color="primary" onClick={() => navigate('/')}>
                        Continue Shopping
                    </Button>
                </StyledPaper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Typography variant="h4" component="h1" gutterBottom align="center">
                Order Summary
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <StyledPaper elevation={3}>
                        <List>
                            {order.orderItems.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    <ListItem alignItems="flex-start">
                                        <StyledAvatar src={item.imageUrl} alt={item.itemName} variant="rounded" />
                                        <ListItemText
                                            primary={item.itemName}
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" color="text.primary">
                                                        ${item.price.toFixed(2)}
                                                    </Typography>
                                                    {` — Quantity: ${item.quantity}`}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {index < order.orderItems.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    </StyledPaper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Order Total</Typography>
                            <Typography variant="h4" color="primary">${order.totalPrice.toFixed(2)}</Typography>
                            <Box mt={2}>
                                <Typography variant="body2" color="text.secondary">
                                    Shipping to: {order.shippingAddress || 'Address not available'}
                                </Typography>
                            </Box>
                            <Box mt={3}>
                                <Button 
                                    variant="outlined" 
                                    color="primary" 
                                    fullWidth 
                                    startIcon={<Edit />}
                                    onClick={() => navigate(`/order-process/${id}`)}
                                    style={{ marginBottom: '1rem' }}
                                >
                                    Edit Order
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    fullWidth
                                    startIcon={<CheckCircle />}
                                    onClick={handlePlaceOrder}
                                >
                                    Place Order
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}

export default OrderSummary;