import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,Card, CardContent, CardActions, Avatar, Grid, Divider} from '@mui/material';
import { Email, Phone, Public, LocationCity, Edit, DeleteForever } from '@mui/icons-material';
import { getUserProfile, deleteUserProfile } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function UserProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const data = await getUserProfile();
            setProfile(data);
            setError('');
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setError('Failed to load profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProfile = async () => {
        setOpenDeleteConfirm(false);
        try {
            setLoading(true);
            await deleteUserProfile();
            logout();
            navigate('/');
        } catch (error) {
            console.error('Error deleting profile:', error);
            setError(`Failed to delete profile: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        setOpenDeleteConfirm(false);
        try {
            setLoading(true);
            await deleteUserProfile();
            localStorage.removeItem('jwtToken');
            navigate('/');
        } catch (error) {
            console.error('Error deleting profile:', error);
            setError('Failed to delete profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!profile) return null;

    return (
        <Container maxWidth="sm">
            <Card elevation={3} sx={{ mt: 4, mb: 4 }}>
                <CardContent>
                    <Box display="flex" justifyContent="center" mb={3}>
                        <Avatar 
                            sx={{ width: 100, height: 100, fontSize: '3rem', bgcolor: 'primary.main' }}
                        >
                            {profile.firstName[0]}
                        </Avatar>
                    </Box>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        {profile.firstName} {profile.lastName}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center">
                                <Email sx={{ mr: 2, color: 'text.secondary' }} />
                                <Typography>{profile.email}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center">
                                <Phone sx={{ mr: 2, color: 'text.secondary' }} />
                                <Typography>{profile.phone}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center">
                                <Public sx={{ mr: 2, color: 'text.secondary' }} />
                                <Typography>{profile.country}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center">
                                <LocationCity sx={{ mr: 2, color: 'text.secondary' }} />
                                <Typography>{profile.city}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        startIcon={<Edit />}
                        onClick={() => navigate('/edit-profile')}
                    >
                        Edit Profile
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="error" 
                        startIcon={<DeleteForever />}
                        onClick={handleDeleteProfile}
                    >
                        Delete Profile
                    </Button>
                </CardActions>
            </Card>
            <Dialog
                open={openDeleteConfirm}
                onClose={() => setOpenDeleteConfirm(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete your profile? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteConfirm(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default UserProfile;