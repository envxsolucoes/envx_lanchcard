# Manual GitHub Setup Instructions

Since Git isn't installed on the current system, here are manual instructions for setting up this project on GitHub:

## 1. Upload to GitHub

1. Go to https://github.com/envxsolucoes/envx_lanchcard
2. If the repository doesn't exist yet, create it with the name "envx_lanchcard" (without any initialization files like README)
3. Upload the files by either:
   - Using the web interface: Click "Add file" → "Upload files" and select all project files
   - Or extract the LancheCard.zip and use GitHub Desktop or another Git client on a system where Git is installed

## 2. Using GitHub Authentication

If you're using Git from the command line on a system with Git installed:

```bash
# Clone the repository
git clone https://github.com/envxsolucoes/envx_lanchcard.git
cd envx_lanchcard

# Configure your credentials
git config user.name "Your Name"
git config user.email "your-email@envxsolucoes.com"

# Add all files
git add .

# Commit the files
git commit -m "Initial project setup"

# Push to GitHub (you'll be prompted for credentials)
git push origin main
```

Use your GitHub credentials or a personal access token when prompted.

## 3. Project Structure

Once set up, your repository should have the following structure:

```
envx_lanchcard/
├── app/
│   ├── frontend/         # Frontend PWA with Next.js
│   └── backend/          # Backend API with Express
├── package.json          # Root package.json with scripts
├── .gitignore            # Git ignore file
└── README.md             # Project documentation
```

## 4. After Setup

After the repository is set up, you can:

1. Install Git on this system
2. Clone the repository: `git clone https://github.com/envxsolucoes/envx_lanchcard.git`
3. Run `npm run install:all` to install all dependencies
4. Start development with `npm run dev` 