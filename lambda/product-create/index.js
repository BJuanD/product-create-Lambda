const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const dynamo = new AWS.DynamoDB.DocumentClient();

const JWT_SECRET = process.env.JWT_SECRET;

exports.handler = async (event) => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Token requerido" })
      };
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Token inválido o expirado" })
      };
    }

    const { name, price } = JSON.parse(event.body);
    if (!name || !price) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Faltan campos obligatorios" })
      };
    }

    const productItem = {
      uuid: uuidv4(),
      name,
      price,
      user_id: decoded.uuid,
      createdAt: new Date().toISOString()
    };

    await dynamo.put({
      TableName: "Products",
      Item: productItem
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Producto creado", product: productItem })
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno" })
    };
  }
};
