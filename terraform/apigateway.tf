resource "aws_api_gateway_rest_api" "product_api" {
  name        = "product-api"
  description = "API para manejar productos"
}

resource "aws_api_gateway_resource" "products" {
  rest_api_id = aws_api_gateway_rest_api.product_api.id
  parent_id   = aws_api_gateway_rest_api.product_api.root_resource_id
  path_part   = "products"
}

resource "aws_api_gateway_method" "post_products" {
  rest_api_id   = aws_api_gateway_rest_api.product_api.id
  resource_id   = aws_api_gateway_resource.products.id
  http_method   = "POST"
  authorization = "NONE" # Puedes cambiar a "CUSTOM" si usas auth más adelante
}

resource "aws_api_gateway_integration" "post_products_integration" {
  rest_api_id             = aws_api_gateway_rest_api.product_api.id
  resource_id             = aws_api_gateway_resource.products.id
  http_method             = aws_api_gateway_method.post_products.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.create_product.invoke_arn
}

resource "aws_lambda_permission" "allow_apigw_invoke_create_product" {
  statement_id  = "AllowInvokeCreateProduct"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_product.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.product_api.execution_arn}//"
}

resource "aws_api_gateway_deployment" "product_api_deployment" {
  depends_on  = [aws_api_gateway_integration.post_products_integration]
  rest_api_id = aws_api_gateway_rest_api.product_api.id
}

resource "aws_api_gateway_stage" "product_stage" {
  deployment_id = aws_api_gateway_deployment.product_api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.product_api.id
  stage_name    = "prod"
}