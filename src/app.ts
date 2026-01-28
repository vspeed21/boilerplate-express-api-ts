import express, { Application } from 'express';
import cors, { CorsOptions } from 'cors';

// Imports de rutas
import categoriasRoutes from './routes/categoriasRoutes';
import productosRoutes from './routes/productosRoutes';
import carritoRoutes from './routes/carritoRoutes';
import authRoutes from './routes/authRoutes';
import usuariosRoutes from './routes/usuariosRoutes';
import pedidosRoutes from './routes/pedidosRoutes';

const app: Application = express();

const whitelist = [process.env.FRONTEND_URL];

const corsOpt: CorsOptions = {
  origin: (origin, calback) => {
    if (whitelist.indexOf(origin) !== -1) {
      calback(null, true);
    } else {
      calback(new Error('Not allowed by cors'));
    }
  }
};

app.use(express.json({ limit: '100MB' }));

// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors(corsOpt));


app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);

export default app;
