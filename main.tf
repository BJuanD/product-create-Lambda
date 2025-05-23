resource "aws_s3_bucket" "lambda_bucket" {
    bucket = "mi-lamda-artifacts-bucket-${random_id.bucket_id.hex}"
}

resource "random_id" "bucket_id" {
    byte_length = 4
}