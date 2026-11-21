# GitHub Setup for Both Repositories

## Files that should be committed

For `AI-Based City Surveillance`:

- Python scripts
- `requirements*.txt`
- dataset YAML
- small representative `samples/` images
- README and model documentation
- `.gitignore`
- external model download instructions instead of large model binaries

Do not commit raw datasets, `runs/`, `.pt` weights, backups, validation sheets,
ZIP archives, virtual environments, or environment variables.

For `CivicOS`:

- Next.js source
- package manifest and lock file
- `.gitignore`
- `.env.example`
- documentation

Never commit `.env.local`.

## Create repositories

Create two empty GitHub repositories:

1. `ai-based-city-surveillance`
2. `civicos`

## Connect the AI repository

```powershell
Set-Location "D:\ML\AI-Based City Surveillance"
git status
git remote -v
git branch -M main
git remote add origin https://github.com/YOUR_USER/ai-based-city-surveillance.git
git push -u origin main
```

## Connect the CivicOS repository

```powershell
Set-Location "D:\ML\CivicOS"
git init
git branch -M main
git add .
git diff --cached --stat
git diff --cached -- .env.example
git remote add origin https://github.com/YOUR_USER/civicos.git
git commit -m "Initial CivicOS application"
git push -u origin main
```

Before every push:

```powershell
git status
git diff
git diff --cached
git ls-files ".env*"
git grep -n "mongodb+srv://\|JWT_SECRET=\|CCTV_INGEST_API_KEY="
```

The final grep command should not return real credentials.
