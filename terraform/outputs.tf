output "ecs_public_ip" {
  value = alicloud_instance.ecs.public_ip
}

output "rds_connection_endpoint" {
  value = alicloud_db_instance.rds.connection_string
}

output "redis_connection_endpoint" {
  value = alicloud_kvstore_instance.redis.connection_domain
}

output "slb_ip_address" {
  value = alicloud_slb_load_balancer.slb.address
}
