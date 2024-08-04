import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Grid, TextField, Button, Card, CardContent, CardMedia, CardActions, Snackbar, IconButton, Box, Fade, Grow, CircularProgress, InputAdornment } from '@mui/material';
import { Favorite, FavoriteBorder, Search } from '@mui/icons-material';
import { getItems, searchItems, addToFavorites, removeFromFavorites } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { debounce } from 'lodash';

function Home() {
    const [items, setItems] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const { isAuthenticated } = useAuth();
    const { addItemToCart: addToCart } = useCart();

    const loadItems = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getItems();
            setItems(data);
            setError(null);
        } catch (err) {
            setError('Failed to load items. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const handleSearch = useCallback(async (query) => {
        if (!query.trim()) {
            loadItems();
            return;
        }
        try {
            setSearchLoading(true);
            const data = await searchItems(query);
            setItems(data);
            setError(null);
        } catch (err) {
            console.error('Failed to search items:', err);
            setError('Failed to search items. Please try again.');
            setItems([]);
        } finally {
            setSearchLoading(false);
        }
    }, [loadItems]);

    const debouncedSearch = useCallback((query) => {
        const delayedSearch = debounce(async (searchQuery) => {
            await handleSearch(searchQuery);
        }, 500);
        delayedSearch(query);
        return () => delayedSearch.cancel();
    }, [handleSearch]);

    const handleSearchInputChange = (e) => {
        const newValue = e.target.value;
        setSearchInput(newValue);
        debouncedSearch(newValue);
    };

    const handleAddToCart = async (item) => {
        if (!isAuthenticated) {
            setSnackbar({ open: true, message: 'Please log in to add items to cart.' });
            return;
        }
        try {
            await addToCart(item.id, 1);
            setSnackbar({ open: true, message: 'Item added to cart!' });
        } catch (error) {
            console.error('Error adding item to cart:', error);
            setError('Failed to add item to cart. Please try again.');
        }
    };

    const handleToggleFavorite = async (item) => {
        if (!isAuthenticated) {
            setSnackbar({ open: true, message: 'Please log in to manage favorites.' });
            return;
        }
        try {
            if (item.isFavorite) {
                await removeFromFavorites(item.id);
            } else {
                await addToFavorites(item.id);
            }
            setItems(items.map(i => i.id === item.id ? { ...i, isFavorite: !i.isFavorite } : i));
            setSnackbar({ open: true, message: item.isFavorite ? 'Removed from favorites' : 'Added to favorites' });
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setError('Failed to update favorites. Please try again.');
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Fade in={true} timeout={1000}>
                <Box textAlign="center" mb={4}>
                    <Typography variant="h2" component="h1" gutterBottom fontWeight="bold" color="primary">
                        Welcome to Tomer's Shop
                    </Typography>
                    <Typography variant="h5" color="text.secondary" paragraph>
                        Discover amazing products at great prices!
                    </Typography>
                </Box>
            </Fade>

            <Box sx={{ display: 'flex', mb: 4 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    placeholder="Search items..."
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                        endAdornment: searchLoading && <CircularProgress size={20} />,
                    }}
                />
            </Box>

            <Grid container spacing={4}>
                {items.map((item, index) => (
                    <Grow in={true} timeout={(index + 1) * 300} key={item.id}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={item.imageUrl}
                                    alt={item.name}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h5" component="div" fontWeight="bold">
                                        {item.name}
                                    </Typography>
                                    <Typography variant="h6" color="primary" gutterBottom>
                                        ${item.price.toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2" color={item.stockQuantity > 0 ? "success.main" : "error.main"}>
                                        {item.stockQuantity > 0
                                            ? `In stock: ${item.stockQuantity}` 
                                            : 'Out of stock'}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleAddToCart(item)}
                                        disabled={item.stockQuantity === 0 || !isAuthenticated}
                                        sx={{ flexGrow: 1, mr: 1 }}
                                    >
                                        {isAuthenticated ? (item.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart') : 'Login to Add'}
                                    </Button>
                                    <IconButton 
                                        onClick={() => handleToggleFavorite(item)}
                                        color={item.isFavorite ? "secondary" : "default"}
                                        disabled={!isAuthenticated}
                                    >
                                        {item.isFavorite ? <Favorite /> : <FavoriteBorder />}
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    </Grow>
                ))}
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            />
        </Container>
    );
}

export default Home;
