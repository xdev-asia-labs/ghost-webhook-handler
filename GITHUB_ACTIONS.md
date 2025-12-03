# 🔄 GitHub Actions - Automatic Docker Build & Push

This project includes GitHub Actions workflow to automatically build and push Docker images to Docker Hub.

## 🎯 Features

- ✅ **Automatic build** on push to `main` or `master` branch
- ✅ **Multi-platform support** (linux/amd64, linux/arm64)
- ✅ **Tag management** - automatic tagging based on branch/version
- ✅ **Build cache** optimization for faster builds
- ✅ **Manual trigger** via workflow_dispatch

## 📋 Setup Instructions

### Step 1: GitHub Secrets Already Configured ✅

The workflow is already configured to use:
- **Docker Hub Username:** `tdduydev`
- **Docker Hub Repository:** `tdduydev/ghost-webhook-handler`

You only need to add the access token:

1. Go to your GitHub repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add secret:
   - Name: `DOCKER_TOKEN`
   - Value: Your Docker Hub access token

### Step 2: Create Docker Hub Access Token (if not already done)

1. Login to [Docker Hub](https://hub.docker.com)
2. Click on your username (top right) > **Account Settings**
3. Go to **Security** tab
4. Click **New Access Token**
5. Description: `GitHub Actions - ghost-webhook-handler`
6. Access permissions: **Read, Write, Delete**
7. Click **Generate**
8. **Copy the token immediately** (you won't see it again!)

### Step 3: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**

**Add two secrets:**

| Name | Value | Description |
|------|-------|-------------|
| `DOCKER_USERNAME` | Your Docker Hub username | e.g., `johnsmith` |
| `DOCKER_TOKEN` | Token from Step 2 | e.g., `dckr_pat_xxxxx...` |

### Step 4: Push Code to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Add GitHub Actions for Docker build"

# Add remote (replace with your repo)
git remote add origin https://github.com/yourusername/ghost-webhook-handler.git

# Push to main branch
git push -u origin main
```

### Step 5: Verify Workflow

1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see "Build and Push Docker Image" workflow running
4. Wait for completion (usually 2-5 minutes)
5. Check Docker Hub - your image should appear!

## 🏷️ Image Tags

The workflow automatically creates multiple tags:

| Trigger | Tags Generated | Example |
|---------|---------------|---------|
| Push to main | `latest`, `main`, `main-<sha>` | `latest`, `main`, `main-abc1234` |
| Push tag `v1.2.3` | `v1.2.3`, `1.2`, `1`, `latest` | Multiple semantic versions |
| Pull Request | `pr-<number>` | `pr-123` |
| Manual dispatch | `<branch>`, `<branch>-<sha>` | `develop-xyz5678` |

## 🚀 Using the Published Image

After successful build, pull your image from Docker Hub:

```bash
# Pull latest version
docker pull tdduydev/ghost-webhook-handler:latest

# Pull specific version
docker pull tdduydev/ghost-webhook-handler:v1.0.0

# Run the image
docker run -d \
  --name ghost-webhook \
  -p 3000:3000 \
  --env-file .env \
  tdduydev/ghost-webhook-handler:latest
```

## 📝 Update docker-compose.yml

The docker-compose.yml is already configured to use the published image:

```yaml
services:
  app:
    # Using pre-built image from Docker Hub
    image: tdduydev/ghost-webhook-handler:latest
    
    # Rest of configuration stays the same...
```

## 🔄 Workflow Triggers

### Automatic Triggers

1. **Push to main/master:**
   ```bash
   git push origin main
   ```
   → Builds and pushes image with `latest` tag

2. **Create version tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   → Builds and pushes with version tags: `v1.0.0`, `1.0`, `1`, `latest`

3. **Pull Request:**
   ```bash
   # Create PR on GitHub
   ```
   → Builds image (doesn't push to Docker Hub)

### Manual Trigger

1. Go to GitHub repository
2. Click **Actions** tab
3. Select "Build and Push Docker Image" workflow
4. Click **Run workflow** button
5. Select branch
6. Click **Run workflow**

## 🏗️ Multi-Platform Builds

The workflow builds for multiple architectures:

- **linux/amd64** - Intel/AMD processors (most cloud servers)
- **linux/arm64** - ARM processors (Raspberry Pi, Apple Silicon, AWS Graviton)

This means your image works on:
- ✅ Standard cloud VPS (DigitalOcean, Linode, etc.)
- ✅ AWS EC2 (x86 and Graviton instances)
- ✅ Raspberry Pi 4/5
- ✅ Apple Silicon Macs (M1/M2/M3)
- ✅ ARM-based cloud instances

## ⚡ Build Cache

The workflow uses Docker layer caching to speed up builds:

- **First build:** ~3-5 minutes
- **Subsequent builds:** ~1-2 minutes (if no dependency changes)

Cache is stored in Docker Hub with tag `:buildcache`.

## 🔍 Troubleshooting

### Build Fails - Authentication Error

**Error:** `denied: requested access to the resource is denied`

**Solution:**
1. Verify `DOCKER_USERNAME` secret is correct
2. Verify `DOCKER_TOKEN` is valid (not expired)
3. Regenerate token if needed
4. Update GitHub secrets

### Build Fails - Docker Hub Rate Limit

**Error:** `toomanyrequests: You have reached your pull rate limit`

**Solution:**
1. Login to Docker Hub in workflow (already configured)
2. Upgrade to Docker Hub Pro for higher limits
3. Wait for rate limit to reset (6 hours for free tier)

### Image Not Found on Docker Hub

**Checklist:**
1. Check workflow completed successfully (green checkmark)
2. Verify you pushed to `main` or `master` branch
3. Check repository is public on Docker Hub
4. Confirm image name matches: `username/ghost-webhook-handler`

### Multi-platform Build Too Slow

**Options:**
1. Remove platforms you don't need from workflow
2. Use GitHub-hosted runners with more resources
3. Set up self-hosted runner

To build only for amd64:
```yaml
# In .github/workflows/docker-build-push.yml
platforms: linux/amd64  # Remove linux/arm64
```

## 📊 Monitoring Builds

### View Build Logs

1. Go to GitHub repository
2. Click **Actions** tab
3. Click on workflow run
4. Click on job name
5. View detailed logs

### Check Docker Hub

1. Login to [Docker Hub](https://hub.docker.com)
2. Go to your repository
3. Click **Tags** tab
4. See all published tags with sizes and dates

## 🔒 Security Best Practices

### ✅ Do's

- ✅ Use Docker Hub Access Tokens (not password)
- ✅ Set token permissions to minimum needed (Read, Write)
- ✅ Rotate tokens every 6-12 months
- ✅ Use GitHub Secrets for sensitive data
- ✅ Review workflow logs for exposed secrets

### ❌ Don'ts

- ❌ Never commit Docker Hub credentials to code
- ❌ Don't use your Docker Hub password in GitHub Actions
- ❌ Don't share access tokens publicly
- ❌ Don't use tokens with excessive permissions

## 🎯 Advanced Usage

### Build Only on Release

To build only when creating GitHub releases:

```yaml
# In .github/workflows/docker-build-push.yml
on:
  release:
    types: [published]
```

### Add Environment Variables to Build

```yaml
# In .github/workflows/docker-build-push.yml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    build-args: |
      NODE_VERSION=18
      BUILD_DATE=${{ github.event.head_commit.timestamp }}
```

### Scan for Vulnerabilities

Add security scanning:

```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.DOCKER_IMAGE }}:latest
    format: 'sarif'
    output: 'trivy-results.sarif'
```

## 📚 Related Documentation

- **[DOCKER.md](DOCKER.md)** - Docker deployment guide
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Deployment checklist
- **[README.md](README.md)** - Main documentation

## 🆘 Need Help?

1. Check [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Check [Docker Hub documentation](https://docs.docker.com/docker-hub/)
3. Review workflow logs for error messages
4. Contact: <duy@xdev.asia>

---

**Last Updated:** December 2024
