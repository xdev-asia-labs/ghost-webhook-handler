# 🔑 GitHub Actions Setup - Quick Guide

This repository is configured to automatically build and push Docker images to:
- **Primary:** `ghcr.io/xdev-asia-labs/ghost-webhook-handler` (GitHub Container Registry)
- **Secondary:** `tdduydev/ghost-webhook-handler` (Docker Hub - optional)

## ⚡ No Setup Required!

GitHub Container Registry push works automatically using `GITHUB_TOKEN` - no additional secrets needed!

### Optional: Add Docker Hub Support

If you also want to push to Docker Hub:

1. Login to [Docker Hub](https://hub.docker.com) with username `tdduydev`
2. Account Settings > Security > New Access Token
3. Permissions: **Read, Write, Delete**
4. Copy the token
5. Add GitHub Secret:
   - Go to repository Settings > Secrets and variables > Actions
   - Name: `DOCKER_TOKEN`
   - Value: Your Docker Hub token

## ✅ Already Working!

Now every time you push code to `main` or `master` branch, GitHub Actions will automatically:

1. ✅ Build Docker image for AMD64 and ARM64
2. ✅ Tag with `latest` and branch name
3. ✅ Push to `tdduydev/ghost-webhook-handler` on Docker Hub

## 🔍 Verify It's Working

### Check GitHub Actions

1. Make a small change and push:
   ```bash
   git add .
   git commit -m "Test GitHub Actions"
   git push origin main
   ```

2. Go to repository > **Actions** tab
3. You should see "Build and Push Docker Image" workflow running
4. Wait 3-5 minutes for completion

### Check Docker Hub

1. Login to [Docker Hub](https://hub.docker.com)
2. Go to repository: `tdduydev/ghost-webhook-handler`
3. Click **Tags** tab
4. You should see new tags: `latest`, `main`, etc.

## 🏷️ Creating Version Releases

To create versioned releases:

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

This will create tags:
- `v1.0.0`
- `1.0`
- `1`
- `latest`

## 🔧 Configuration Details

### Workflow File Location
`.github/workflows/docker-build-push.yml`

### Docker Hub Repository
`tdduydev/ghost-webhook-handler`

### Automatic Triggers
- ✅ Push to `main` or `master` branch
- ✅ Create version tag (`v*.*.*`)
- ✅ Manual workflow dispatch (Actions > Run workflow)

### Build Platforms
- `linux/amd64` - Intel/AMD processors
- `linux/arm64` - ARM processors (Raspberry Pi, Apple Silicon)

## 📦 Using the Built Image

Once the workflow completes:

```bash
# Pull from GitHub Container Registry (primary)
docker pull ghcr.io/xdev-asia-labs/ghost-webhook-handler:latest

# Or pull from Docker Hub (if configured)
docker pull tdduydev/ghost-webhook-handler:latest

# Or just use docker-compose (already configured)
docker-compose up -d
```

## 🆘 Troubleshooting

### Workflow Fails - Authentication Error

**Error:** `denied: requested access to the resource is denied`

**Fix:**
1. Verify `DOCKER_TOKEN` secret exists in GitHub
2. Check token is not expired (regenerate if needed)
3. Confirm token has Write permissions

### Workflow Fails - Build Error

**Check:**
1. Review workflow logs: Actions > failed workflow > build-and-push job
2. Check Dockerfile syntax is correct
3. Verify all dependencies are available

### Image Not Appearing on Docker Hub

**Verify:**
1. Workflow completed successfully (green checkmark)
2. You pushed to `main` or `master` branch (not a PR)
3. Check Docker Hub repository is public
4. Refresh Docker Hub page

## 📚 Full Documentation

For complete details, see:
- **[GITHUB_ACTIONS.md](GITHUB_ACTIONS.md)** - Complete GitHub Actions guide
- **[DOCKER.md](DOCKER.md)** - Docker deployment guide
- **[README.md](README.md)** - Main documentation

---

**Need Help?** Contact: <duy@xdev.asia>
