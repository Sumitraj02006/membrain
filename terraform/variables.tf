variable "region" {
  type    = string
  default = "ap-southeast-1" # Singapore (International Zone)
}

variable "availability_zone" {
  type    = string
  default = "ap-southeast-1a"
}

variable "oss_bucket_name" {
  type    = string
  default = "membrain-obituaries-production-bucket"
}
