# Redline on AWS (Terraform)

Deploys Redline to **ap-south-1 (Mumbai)** using only free-tier-eligible services.
Nothing exists in AWS until you run `terraform apply`. `terraform destroy` removes all of it.

## Architecture

```
                      Browser (mic → HTTPS / WSS)
                                 │
                    ┌────────────▼────────────┐
                    │  CloudFront (HTTPS)      │  *.cloudfront.net cert, caches /_next/static
                    │  adds X-Origin-Verify    │
                    └────────────┬────────────┘
                                 │ HTTP :80 (CloudFront prefix list only)
 ┌──────────────── VPC 10.0.0.0/16 ─┼───────────────────────────────────────────┐
 │  public subnet 10.0.1.0/24       │                                            │
 │  ┌───────────────────────────────▼──────────────────────────┐                 │
 │  │ EC2 t3.micro (Amazon Linux 2023, Elastic IP, IAM role)    │──► Sarvam API   │
 │  │  Docker: nginx ─► Next.js frontend                        │    (LLM/STT/TTS)│
 │  │                └► FastAPI backend ─────────────┐          │                 │
 │  └───────┬──────────────┬──────────────────────────┼─────────┘                │
 │          │              │                          │ :5432 (app SG only)      │
 │  private subnets 10.0.11.0/24, 10.0.12.0/24        ▼                          │
 │          │              │                 RDS PostgreSQL 16 (db.t4g.micro)    │
 └──────────┼──────────────┼────────────────────────────────────────────────────┘
            │              │
   SSM Parameter Store   S3 (nightly pg_dump)    CloudWatch Logs + Alarms → SNS email
   (secrets)                                     AWS Budgets ($1 alert)
```

| Service | Purpose | Free tier |
|---|---|---|
| **VPC** | Isolated network: public subnet for EC2, private subnets for RDS, no NAT | Free |
| **EC2** | Runs nginx + backend + frontend in Docker | 750 h/month t3.micro, 30 GB EBS, public IPv4 |
| **RDS PostgreSQL** | Users, sessions, transcripts, debriefs | 750 h/month db.t4g.micro, 20 GB |
| **CloudFront** | HTTPS (required for the mic), WebSockets, edge caching | 1 TB + 10 M requests/month |
| **IAM** | Instance role, least privilege; no access keys on the server | Free |
| **SSM Parameter Store** | Encrypted secrets (Sarvam key, OAuth, JWT, DB URL) | Standard tier free |
| **SSM Session Manager** | Shell access without SSH / port 22 / key pairs | Free |
| **S3** | Nightly database backups, 7-day lifecycle expiry | 5 GB |
| **CloudWatch** | Container logs, 4 alarms incl. EC2 auto-recovery | 5 GB logs, 10 alarms |
| **SNS + Budgets** | Email alerts and a monthly cost guardrail | Free |

## Deploy

Prerequisites: Terraform ≥ 1.6, AWS CLI logged in (`aws login` / `aws sso login`),
optionally the [Session Manager plugin](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html).

```bash
cd infra/aws
cp terraform.tfvars.example terraform.tfvars   # fill in the Sarvam key (+ OAuth, email)
terraform init
terraform plan -out tfplan
terraform apply tfplan                          # ~10–15 min (RDS + CloudFront)
terraform output
```

After `apply`, the instance needs another **~10–15 minutes** to build the Docker images.
Watch it:

```bash
$(terraform output -raw ssm_shell_command)
sudo tail -f /var/log/redline-bootstrap.log     # wait for "REDLINE BOOTSTRAP COMPLETE"
```

**OAuth:** sign-in is Google/GitHub only. The CloudFront URL exists only after the first
apply, so add the URLs from `terraform output oauth_redirect_uris` to your OAuth apps
(GitHub: also set the Homepage URL to `app_url`) and then sign in.

**Custom domain (optional):** set `domain_name` in `terraform.tfvars` and follow the
two-step rollout described at the top of `domain.tf` (ACM validation CNAME first, then the
full apply, then point the domain's CNAME at `cloudfront_domain`). When re-creating the
stack later, delete the domain's CNAME before applying: CloudFront rejects an alias whose
DNS still points at the old distribution (`CNAMEAlreadyExists`).

### Operations

```bash
# Redeploy latest code + secrets without recreating anything
aws ssm send-command --region ap-south-1 --instance-ids "$(terraform output -raw instance_id)" \
  --document-name AWS-RunShellScript --parameters 'commands=["/opt/redline/deploy.sh"]'

# Run a database backup right now, then list backups
sudo systemctl start redline-backup            # on the instance
aws s3 ls "s3://$(terraform output -raw backup_bucket)/pg_dump/"

# Tail container logs from your laptop
aws logs tail "$(terraform output -raw log_group)" --follow --region ap-south-1

# Verify the origin is locked down (should be refused / time out)
curl -m 5 http://<elastic-ip>/
```

## Tear down

```bash
terraform destroy
```

This deletes every resource, including the RDS database (no final snapshot) and the
backup bucket contents. Afterwards check **Billing → Free Tier** and **Tag Editor**
(tag `Project=redline`) to confirm nothing is left.

## Cost notes

- Everything above is inside the free tier for short-lived deployments. The EC2 instance uses
  `unlimited` CPU credits so the first build doesn't crawl; worst case that is a few cents
  (change to `standard` in `compute.tf` to rule it out).
- An Elastic IP is billed while the instance is **stopped** — destroy, don't just stop.
- RDS free tier is single-AZ only; don't enable Multi-AZ.
