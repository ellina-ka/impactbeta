# impactbeta
My Impact Beta Version

## Frontend deployment checklist
1. Build from the frontend folder:
   - `cd frontend && npm ci && npm run build`
2. Publish the `frontend/build` directory (not `frontend/src`).
3. If hosted under a subpath, set CRA base path at build time:
   - `PUBLIC_URL=/your-subpath npm run build`
4. Bust CDN/browser cache for admin avatars by changing:
   - `REACT_APP_ADMIN_ASSET_VERSION=<new-value> npm run build`

Admin avatars are served from `${PUBLIC_URL}/admins/lio.png` and `${PUBLIC_URL}/admins/ellina.png`.
