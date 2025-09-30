# Security Policy

## 🔒 Security Measures Implemented

### Environment Variables

- All sensitive data is stored in environment variables
- `.env.local` is excluded from version control
- `.env.example` provides template without secrets

### Authentication & Authorization

- Supabase Auth with JWT tokens
- Row Level Security (RLS) policies enforce data isolation
- API routes protected with authentication middleware
- Rate limiting on all API endpoints

### Input Validation

- Zod schemas validate all user inputs
- SQL injection prevention through Supabase client
- XSS protection with proper data sanitization

### Security Headers

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy restrictions

### Webhook Security

- HMAC signature verification for webhooks
- Timing-safe comparison for signature validation

## 🚨 CRITICAL: Remove Exposed Keys

**IMMEDIATE ACTION REQUIRED:**

1. **Remove .env.local from git history:**

   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env.local' --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```

2. **Regenerate Supabase keys:**
   - Go to Supabase Dashboard → Settings → API
   - Regenerate both anon and service role keys
   - Update your local .env.local file

3. **Verify .gitignore:**
   ```bash
   git check-ignore .env.local
   # Should return: .env.local
   ```

## 📋 Security Checklist

- [ ] Remove .env.local from git history
- [ ] Regenerate all Supabase keys
- [ ] Verify .gitignore excludes environment files
- [ ] Enable branch protection rules
- [ ] Set up secret scanning in GitHub
- [ ] Configure Supabase RLS policies
- [ ] Test authentication flows
- [ ] Verify rate limiting works
- [ ] Check security headers in production

## 🔍 Vulnerability Reporting

If you discover a security vulnerability, please:

1. **DO NOT** create a public issue
2. Email security@example.com with details
3. Include steps to reproduce
4. Allow 90 days for response before disclosure

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
