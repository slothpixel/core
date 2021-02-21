#prod env vars to metadata
gcloud compute project-info add-metadata --metadata-from-file env=./prod.env

#redis
gcloud compute --project "snappy-nomad-263019" disks create "disk-redis" --size "10" --zone "us-central1-b" --type "pd-ssd"
gcloud compute instances delete --quiet redis-1
gcloud compute instances create redis-1 --machine-type n1-standard-1 --image-family ubuntu-1804-lts --image-project gce-uefi-images --disk name=disk-redis --boot-disk-size 10GB --boot-disk-type pd-ssd
gcloud compute instances add-metadata redis-1 --metadata-from-file startup-script=./scripts/redis.sh

#web, health check, loadbalancer
gcloud compute forwarding-rules delete --quiet lb-rule
gcloud compute target-pools delete --quiet lb-pool
gcloud compute http-health-checks delete --quiet lb-check
gcloud compute instance-groups managed delete --quiet web-group-1
gcloud compute instance-templates delete --quiet web-1
gcloud compute instance-templates create web-1 --machine-type g1-small --image-family ubuntu-1804-lts --image-project gce-uefi-images --boot-disk-size 10GB --boot-disk-type pd-ssd --tags "http-server" --metadata-from-file startup-script=./scripts/web.sh
gcloud compute instance-groups managed create "web-group-1" --base-instance-name "web-group-1" --template "web-1" --size "0"
gcloud compute --project "snappy-nomad-263019" http-health-checks create "lb-check" --port "80" --request-path "/healthz" --check-interval "5" --timeout "5" --unhealthy-threshold "2" --healthy-threshold "2"
gcloud compute --project "snappy-nomad-263019" target-pools create "lb-pool" --region "us-central1" --http-health-check "lb-check" --session-affinity "NONE"
gcloud compute --project "snappy-nomad-263019" forwarding-rules create "lb-rule" --region "us-central1" --regional --address "34.67.146.236" --ip-protocol "TCP" --ports "80" --target-pool "lb-pool"
gcloud compute --project "snappy-nomad-263019" instance-groups managed set-target-pools "web-group-1" --zone "us-central1-b" --target-pools "https://www.googleapis.com/compute/v1/projects/snappy-nomad-263019/regions/us-central1/targetPools/lb-pool"
gcloud compute instance-groups managed set-autoscaling "web-group-1" --cool-down-period "60" --max-num-replicas "3" --min-num-replicas "2" --target-cpu-utilization "0.9"

#backend
gcloud compute instance-groups managed delete --quiet backend-group-1
gcloud compute instance-templates delete --quiet backend-1
gcloud compute instance-templates create backend-1 --machine-type n1-standard-2 --preemptible --image-family ubuntu-1804-lts --image-project gce-uefi-images --boot-disk-size 10GB --boot-disk-type pd-ssd --tags "http-server" --metadata-from-file startup-script=./scripts/backend.sh
gcloud compute instance-groups managed create "backend-group-1" --base-instance-name "backend-group-1" --template "backend-1" --size "1"
gcloud compute instance-groups managed set-autoscaling "backend-group-1" --cool-down-period "60" --max-num-replicas "1" --min-num-replicas "1" --target-cpu-utilization "0.6"
