variable "github_owner" { type = string }
variable "visibility" { type = string; default = "private"; validation { condition = contains(["private","public","internal"],var.visibility); error_message = "visibility must be private, public, or internal" } }
