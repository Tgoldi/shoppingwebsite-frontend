import React, { useState } from "react";
import {AppBar,Toolbar,Typography,Button,Badge,Box,IconButton,Drawer,List,ListItem,ListItemIcon,ListItemText,Divider,useTheme,useMediaQuery,} from "@mui/material";
import {ShoppingCart,History,Favorite,Person,ExitToApp,Menu,Home,Login,PersonAdd,} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { cartItemCount } = useCart();
    const { isAuthenticated, logout } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [drawerOpen, setDrawerOpen] = useState(false);

    const NavButton = ({ to, icon, label }) => (
        <Button
            color="inherit"
            component={Link}
            to={to}
            startIcon={icon}
            sx={{
                mx: 1,
                px: 2,
                py: 1,
                textTransform: "none",
                borderRadius: 2,
                transition: "background-color 0.3s",
                "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
            }}
        >
            {!isMobile && label}
        </Button>
    );

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const drawer = (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={handleDrawerToggle}
            onKeyDown={handleDrawerToggle}
        >
            <List>
                <ListItem button component={Link} to="/">
                    <ListItemIcon>
                        <Home />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItem>
                <Divider />
                {isAuthenticated ? (
                    <>
                        <ListItem button component={Link} to="/profile">
                            <ListItemIcon>
                                <Person />
                            </ListItemIcon>
                            <ListItemText primary="Profile" />
                        </ListItem>
                        <ListItem button component={Link} to="/order-history">
                            <ListItemIcon>
                                <History />
                            </ListItemIcon>
                            <ListItemText primary="Orders" />
                        </ListItem>
                        <ListItem button component={Link} to="/favorites">
                            <ListItemIcon>
                                <Favorite />
                            </ListItemIcon>
                            <ListItemText primary="Favorites" />
                        </ListItem>
                        <ListItem button onClick={logout}>
                            <ListItemIcon>
                                <ExitToApp />
                            </ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItem>
                    </>
                ) : (
                    <>
                        <ListItem button component={Link} to="/login">
                            <ListItemIcon>
                                <Login />
                            </ListItemIcon>
                            <ListItemText primary="Login" />
                        </ListItem>
                        <ListItem button component={Link} to="/register">
                            <ListItemIcon>
                                <PersonAdd />
                            </ListItemIcon>
                            <ListItemText primary="Register" />
                        </ListItem>
                    </>
                )}
                <Divider />
                <ListItem button component={Link} to="/cart">
                    <ListItemIcon>
                        <Badge
                            badgeContent={cartItemCount || 0}
                            color="secondary"
                        >
                            <ShoppingCart />
                        </Badge>
                    </ListItemIcon>
                    <ListItemText primary="Cart" />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    background:
                        "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                }}
            >
                <Toolbar
                    sx={{ justifyContent: "space-between", padding: "0 16px" }}
                >
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: "none",
                            color: "inherit",
                            fontWeight: "bold",
                            letterSpacing: 1,
                            paddingRight: 2,
                        }}
                    >
                        Tomer's Shop
                    </Typography>

                    {isMobile ? (
                        <>
                            <IconButton
                                color="inherit"
                                aria-label="menu"
                                onClick={handleDrawerToggle}
                            >
                                <Menu />
                            </IconButton>
                            <Drawer
                                anchor="right"
                                open={drawerOpen}
                                onClose={handleDrawerToggle}
                            >
                                {drawer}
                            </Drawer>
                        </>
                    ) : (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            {isAuthenticated ? (
                                <>
                                    <NavButton
                                        to="/profile"
                                        icon={<Person />}
                                        label="Profile"
                                    />
                                    <NavButton
                                        to="/order-history"
                                        icon={<History />}
                                        label="Orders"
                                    />
                                    <NavButton
                                        to="/favorites"
                                        icon={<Favorite />}
                                        label="Favorites"
                                    />
                                    <Button
                                        color="inherit"
                                        onClick={logout}
                                        startIcon={<ExitToApp />}
                                        sx={{
                                            mx: 1,
                                            px: 2,
                                            py: 1,
                                            textTransform: "none",
                                            borderRadius: 2,
                                            transition: "background-color 0.3s",
                                            "&:hover": {
                                                backgroundColor:
                                                    "rgba(255, 255, 255, 0.2)",
                                            },
                                        }}
                                    >
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        color="inherit"
                                        component={Link}
                                        to="/login"
                                        sx={{
                                            mx: 1,
                                            fontWeight: "bold",
                                            px: 2,
                                            py: 1,
                                            textTransform: "none",
                                            borderRadius: 2,
                                            transition: "background-color 0.3s",
                                            "&:hover": {
                                                backgroundColor:
                                                    "rgba(255, 255, 255, 0.2)",
                                            },
                                        }}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        color="inherit"
                                        component={Link}
                                        to="/register"
                                        variant="outlined"
                                        sx={{
                                            mx: 1,
                                            fontWeight: "bold",
                                            px: 2,
                                            py: 1,
                                            textTransform: "none",
                                            borderRadius: 2,
                                            borderColor: "inherit",
                                            "&:hover": {
                                                backgroundColor:
                                                    "rgba(255, 255, 255, 0.2)",
                                            },
                                        }}
                                    >
                                        Register
                                    </Button>
                                </>
                            )}
                            <Badge
                                badgeContent={cartItemCount || 0}
                                color="secondary"
                                sx={{
                                    "& .MuiBadge-badge": {
                                        right: -3,
                                        top: 13,
                                        border: `2px solid ${theme.palette.background.paper}`,
                                        padding: "0 4px",
                                    },
                                }}
                            >
                                <NavButton
                                    to="/cart"
                                    icon={<ShoppingCart />}
                                    label="Cart"
                                />
                            </Badge>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
        </>
    );
};

export default Navbar;
