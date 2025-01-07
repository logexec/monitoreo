import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();
const port = 3000;

app.use(cors({
  origin: '*'
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT COUNT(*) FROM onix_viajes');
    connection.release();
    res.json({ 
      status: 'healthy',
      message: 'Successfully connected to MySQL and verified onix_viajes table access'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Get all trips for a specific date
app.get('/api/trips', async (req, res) => {
  try {
    const { date, projects } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const projectsList = projects ? projects.split(',') : ['all'];

    const query = `
      SELECT DISTINCT
        id,
        codigo as trip_id,
        fecha_entrega as delivery_date,
        conductor as driver_name,
        telefono_conductor as driver_phone,
        origen,
        destino as destination,
        proyecto as project,
        placa as plate_number,
        tipo_propiedad as property_type,
        jornada as shift,
        proveedor_gps as gps_provider
      FROM onix_viajes 
      WHERE DATE(fecha_entrega) = DATE(?)
      ${projectsList.includes('all') ? '' : 'AND proyecto IN (?)'}
      AND estado = 1
      ORDER BY fecha_entrega DESC
    `;

    res.json(rows);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});