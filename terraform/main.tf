terraform {
  required_providers {
    alicloud = {
      source  = "aliyun/alicloud"
      version = "~> 1.200"
    }
  }
}

provider "alicloud" {
  region = var.region
}

# 1. VPC & Network setup
resource "alicloud_vpc" "vpc" {
  vpc_name   = "membrain-vpc"
  cidr_block = "172.16.0.0/12"
}

resource "alicloud_vswitch" "vswitch" {
  vpc_id       = alicloud_vpc.vpc.id
  cidr_block   = "172.16.1.0/24"
  zone_id      = var.availability_zone
  vswitch_name = "membrain-vswitch"
}

# 2. Security Group
resource "alicloud_security_group" "sg" {
  name        = "membrain-sg"
  vpc_id      = alicloud_vpc.vpc.id
  description = "Security group for MemBrain production server"
}

resource "alicloud_security_group_rule" "allow_http" {
  type              = "ingress"
  ip_protocol       = "tcp"
  nic_type          = "intranet"
  policy            = "accept"
  port_range        = "80/80"
  priority          = 1
  security_group_id = alicloud_security_group.sg.id
  cidr_ip           = "0.0.0.0/0"
}

resource "alicloud_security_group_rule" "allow_https" {
  type              = "ingress"
  ip_protocol       = "tcp"
  nic_type          = "intranet"
  policy            = "accept"
  port_range        = "443/443"
  priority          = 1
  security_group_id = alicloud_security_group.sg.id
  cidr_ip           = "0.0.0.0/0"
}

# 3. Alibaba Cloud ECS (Virtual Server)
resource "alicloud_instance" "ecs" {
  availability_zone    = var.availability_zone
  security_groups      = [alicloud_security_group.sg.id]
  instance_type        = "ecs.g8i.xlarge"
  system_disk_category = "cloud_essd"
  system_disk_size     = 50
  image_id             = "ubuntu_22_04_x64_20G_alibase_20230515.vhd"
  instance_name        = "membrain-backend-ecs"
  vswitch_id           = alicloud_vswitch.vswitch.id
  internet_max_bandwidth_out = 10
}

# 4. Alibaba RDS PostgreSQL 16 (Database)
resource "alicloud_db_instance" "rds" {
  engine           = "PostgreSQL"
  engine_version   = "16.0"
  instance_type    = "pg.x8.medium.2c"
  instance_storage = 50
  instance_name    = "membrain-postgresql-rds"
  vswitch_id       = alicloud_vswitch.vswitch.id
  security_ips     = ["0.0.0.0/0"]
}

# 5. Alibaba ElastiCache Redis 7.2 (Cache)
resource "alicloud_kvstore_instance" "redis" {
  db_instance_name  = "membrain-redis-elasticache"
  vswitch_id        = alicloud_vswitch.vswitch.id
  zone_id           = var.availability_zone
  engine_version    = "7.2"
  instance_class    = "redis.logic.sharding.2g.8db.0connection"
  security_ips      = ["0.0.0.0/0"]
}

# 6. Object Storage Service OSS (Obituary Cold Archive)
resource "alicloud_oss_bucket" "oss" {
  bucket = var.oss_bucket_name
  acl    = "private"
}

# 7. Server Load Balancer (SLB)
resource "alicloud_slb_load_balancer" "slb" {
  load_balancer_name   = "membrain-slb"
  address_type         = "internet"
  internet_charge_type = "PayByTraffic"
}

# 8. Alibaba Cloud CDN (Static distribution)
resource "alicloud_cdn_domain_new" "cdn" {
  domain_name = "membrain-cdn.example.com"
  cdn_type    = "web"
  scope       = "overseas"
  sources {
    content  = alicloud_slb_load_balancer.slb.address
    type     = "ipaddr"
    priority = 20
    port     = 80
  }
}
