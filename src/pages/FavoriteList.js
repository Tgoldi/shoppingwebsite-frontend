import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, CardActions, Button, CircularProgress, Snackbar, Alert, Box } from '@mui/material';
import { getFavorites, removeFromFavorites } from '../utils/api';

function FavoriteList() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            const data = await getFavorites();
            setFavorites(data);
            setError(null);
        } catch (err) {
            setError('Failed to load favorites. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromFavorites = async (itemId) => {
        try {
            await removeFromFavorites(itemId);
            setFavorites(favorites.filter(item => item.id !== itemId));
        } catch (err) {
            setError('Failed to remove item from favorites. Please try again.');
        }
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Your Favorite Items
            </Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : favorites.length === 0 ? (
                <Typography>You don't have any favorite items yet.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {favorites.map(item => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <Card sx={{ transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={item.imageUrl}
                                    alt={item.name}
                                />
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div">
                                        {item.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Price: ${item.price}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        In stock: {item.stockQuantity}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button variant="contained" color="secondary" size="small" onClick={() => handleRemoveFromFavorites(item.id)}>
                                        Remove from Favorites
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
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
        </Container>
    );
}

export default FavoriteList;
