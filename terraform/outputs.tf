output "create_product_api_url" {
  value = "https://${aws_api_gateway_rest_api.product_api.id}.execute-api.${var.aws_region}.amazonaws.com/prod/products"
}