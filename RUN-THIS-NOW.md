# 🚀 RUN THIS ONE SIMPLE COMMAND

**Copy and paste this command into PowerShell:**

```powershell
powershell -ExecutionPolicy Bypass -File "d:\Project-icp\icp-project-app\RUN-FIX-NOW.ps1"
```

When prompted for password, enter:
```
REDACTED_SSH_PASSWORD
```

---

## What it will do automatically:

✅ **Fix #1:** Update `.env` (DB_MODE=remote, NODE_ENV=production)
✅ **Fix #2:** Update test users in database (password → 123456)  
✅ **Fix #3:** Restart backend service (pm2 restart)

---

## Then test login:

```powershell
curl http://10.2.0.6:3000/health
```

If you see JSON response → **Login should work!** ✅

Open: `https://icp.sif.or.th/icp-project-app/`
- Email: `somnuk@mju.ac.th`
- Password: `123456`

---

**That's it! Just run the PowerShell command above and enter password when asked.**


