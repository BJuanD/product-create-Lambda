resource "aws_lambda_function" "create_product" {
  function_name = "create-product"
  filename      = "lambda/product-create/create.zip"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  source_code_hash = filebase64sha256("lambda/product-create/create.zip")

  role = aws_iam_role.lambda_role.arn

  environment {
    variables = {
      JWT_SECRET = "clave_super_segura"
    }
  }
}
