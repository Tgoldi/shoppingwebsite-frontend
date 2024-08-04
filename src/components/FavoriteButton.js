import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { addToFavorites, removeFromFavorites } from '../utils/api';

const FavoriteButton = ({ itemId, initialIsFavorite }) => {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

    const handleToggleFavorite = async () => {
        try {
            if (isFavorite) {
                await removeFromFavorites(itemId);
            } else {
                await addToFavorites(itemId);
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    return (
        <IconButton onClick={handleToggleFavorite} color="primary">
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
        </IconButton>
    );
};

export default FavoriteButton;