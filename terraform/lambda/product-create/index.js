const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_segura';

exports.handler = async (event) => {
  try {
    // 1. Validar token JWT
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Token no proporcionado' }),
      };
    }

    const token = authHeader.split(' ')[1];
    let payload;

    try {
      payload = jwt.verify(token, JWT_SECRET); // Validación completa del token
    } catch (err) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Token inválido o expirado' }),
      };
    }

    const userId = payload.id; // Este campo viene del login

    // 2. Parsear body y validar campos
    const body = JSON.parse(event.body);
    const { name, brand, categories, price } = body;

    if (!name || !brand || !Array.isArray(categories) || typeof price !== 'number') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Datos incompletos o inválidos' }),
      };
    }

    // 3. Guardar producto en DynamoDB
    const newProduct = {
      id: uuidv4(),
      name,
      brand,
      categories,
      price,
      userId,
      createdAt: new Date().toISOString(),
    };

    const params = {
      TableName: 'Products',
      Item: newProduct,
    };

    await dynamodb.put(params).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Producto registrado exitosamente',
        data: newProduct,
      }),
    };

  } catch (err) {
    console.error('Error al crear producto:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error interno al registrar producto' }),
    };
  }
};