terraform {
  backend "s3" {
    bucket              = "section1983-tfstate-942370948729"
    key                 = "bootstrap/terraform.tfstate"
    region              = "us-east-1"
    encrypt             = true
    use_lockfile        = true
    allowed_account_ids = ["942370948729"]
  }
}
