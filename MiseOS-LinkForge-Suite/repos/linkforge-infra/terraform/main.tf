terraform {
  required_version = ">= 1.8.0"
  required_providers {
    github = { source = "integrations/github", version = "~> 6.0" }
  }
}
provider "github" { owner = var.github_owner }
locals { repositories = toset(["linkforge-core","linkforge-research","linkforge-render","linkforge-api","linkforge-web","linkforge-mcp","linkforge-actions","linkforge-infra"]) }
resource "github_repository" "repo" {
  for_each = local.repositories
  name = each.key
  description = "MiseOS LinkForge component — Save the source. Trace the truth. Ship the packet."
  visibility = var.visibility
  has_issues = true
  has_projects = false
  vulnerability_alerts = true
  delete_branch_on_merge = true
  allow_squash_merge = true
  allow_merge_commit = false
  allow_rebase_merge = false
  security_and_analysis {
    secret_scanning { status = "enabled" }
    secret_scanning_push_protection { status = "enabled" }
  }
}
resource "github_branch_protection" "main" {
  for_each = github_repository.repo
  repository_id = each.value.node_id
  pattern = "main"
  enforce_admins = true
  allows_deletions = false
  allows_force_pushes = false
  required_pull_request_reviews { required_approving_review_count = 1; dismiss_stale_reviews = true; require_last_push_approval = true }
  required_status_checks { strict = true; contexts = ["test"] }
}
