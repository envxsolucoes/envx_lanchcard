'use client';

import { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  IconButton,
  Paper,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction
} from '@mui/material';
import {
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountCircle as AccountCircleIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Fastfood as FastfoodIcon,
  LocalCafe as LocalCafeIcon,
  Restaurant as RestaurantIcon
} from '@mui/icons-material';

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [value, setValue] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  // Verificar status de conexão
  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const categories = [
    { id: 1, name: 'Lanches', icon: <FastfoodIcon />, image: '/images/burgers.jpg' },
    { id: 2, name: 'Bebidas', icon: <LocalCafeIcon />, image: '/images/drinks.jpg' },
    { id: 3, name: 'Refeições', icon: <RestaurantIcon />, image: '/images/meals.jpg' },
  ];

  const featuredProducts = [
    { id: 1, name: 'X-Bacon', price: 12.90, image: '/images/x-bacon.jpg', category: 'Lanches' },
    { id: 2, name: 'Refrigerante Lata', price: 4.50, image: '/images/soda.jpg', category: 'Bebidas' },
    { id: 3, name: 'Prato do Dia', price: 15.90, image: '/images/daily-meal.jpg', category: 'Refeições' },
    { id: 4, name: 'Suco Natural', price: 6.50, image: '/images/juice.jpg', category: 'Bebidas' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        paddingBottom: isMobile ? '64px' : 0
      }}
    >
      {/* Indicador de offline */}
      {!isOnline && (
        <Box
          sx={{
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
            py: 0.5,
            textAlign: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1100
          }}
        >
          <Typography variant="body2">
            Você está offline. Algumas funcionalidades podem estar limitadas.
          </Typography>
        </Box>
      )}

      {/* AppBar / Header */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}
          >
            <Box 
              component="img" 
              src="/logo-white.png" 
              alt="LancheCard" 
              sx={{ height: 40, mr: 1, display: { xs: 'none', sm: 'block' } }} 
            />
            LancheCard
          </Typography>
          
          <IconButton color="inherit" aria-label="search">
            <SearchIcon />
          </IconButton>
          
          <IconButton color="inherit" aria-label="cart">
            <ShoppingCartIcon />
          </IconButton>
          
          {!isMobile && (
            <Button 
              color="inherit" 
              startIcon={<AccountCircleIcon />}
              sx={{ ml: 1 }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Banner principal */}
      <Paper
        sx={{
          position: 'relative',
          height: { xs: 200, md: 300 },
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(/images/banner.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          padding: 2,
          mb: 4
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Faça seu pedido sem filas!
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Peça e pague pelo aplicativo. Retire na lanchonete sem espera.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ 
              bgcolor: 'primary.light',
              px: 4,
              py: 1.5
            }}
          >
            Pedir Agora
          </Button>
        </Box>
      </Paper>

      <Container maxWidth="lg" sx={{ mb: 4 }}>
        {/* Categorias */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
          Categorias
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 5 }}>
          {categories.map((category) => (
            <Grid item xs={4} key={category.id}>
              <Card 
                sx={{ 
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height={isMobile ? 70 : 100}
                  image={category.image}
                  alt={category.name}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    {category.icon}
                  </Box>
                  <Typography variant={isMobile ? "body2" : "body1"} component="div">
                    {category.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Destaque */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
          Mais Pedidos
        </Typography>
        
        <Grid container spacing={2}>
          {featuredProducts.map((product) => (
            <Grid item xs={6} md={3} key={product.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height={140}
                  image={product.image}
                  alt={product.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {product.category}
                  </Typography>
                  <Typography variant="h6" component="div" gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    R$ {product.price.toFixed(2)}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="primary"
                    size="small"
                  >
                    Adicionar
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Bottom Navigation (Mobile) */}
      {isMobile && (
        <BottomNavigation
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
            bgcolor: 'primary.main',
            zIndex: 1100
          }}
        >
          <BottomNavigationAction label="Início" icon={<HomeIcon />} />
          <BottomNavigationAction label="Explorar" icon={<SearchIcon />} />
          <BottomNavigationAction label="Carrinho" icon={<ShoppingCartIcon />} />
          <BottomNavigationAction label="Perfil" icon={<AccountCircleIcon />} />
        </BottomNavigation>
      )}
    </Box>
  );
} 