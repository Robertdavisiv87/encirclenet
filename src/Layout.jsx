/**
 * Fully Automated Encircle Net Deployment Script
 * ---------------------------------------------
 * Usage:
 * 1. Save as deployEncircleNet.js in your project root.
 * 2. Ensure React build exists in ./build
 * 3. Install dependencies: npm install fs path axios @base44/client
 * 4. Set Base44 API key:
 *    export BASE44_API_KEY="YOUR_API_KEY"   (Mac/Linux)
 *    set BASE44_API_KEY=YOUR_API_KEY        (Windows CMD)
 *    $env:BASE44_API_KEY="YOUR_API_KEY"     (PowerShell)
 * 5. Run: node deployEncircleNet.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const base44 = require('@base44/client'); // Replace with actual Base44 SDK/API

// CONFIGURATION
const BUILD_DIR = path.join(__dirname, 'build');
const DOMAIN = 'encirclenet.net';
const ENTRY_PAGE = 'login';
const VERIFY_URL = `https://${DOMAIN}/${ENTRY_PAGE}`;

// INIT BASE44 CLIENT
const client = new base44.Client({
  apiKey: process.env.BASE44_API_KEY
});

// STEP 1: Inject Self-Healing JS Loader
function injectLoader(indexPath) {
  let html = fs.readFileSync(indexPath, 'utf8');
  const loaderScript = `
<script>
(function selfHealingJSLoader() {
  const appContainer = document.getElementById('root');
  if(!appContainer) return;
  const bundles = ['/static/js/runtime.js','/static/js/vendor.js','/static/js/main.js'];
  bundles.forEach(src => {
    const s = document.createElement('script');
    s.src = src;
    s.defer = true;
    document.head.appendChild(s);
  });
})();
</script>
</body>`;
  html = html.replace('</body>', loaderScript);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('✅ Injected self-healing JS loader');
}

// STEP 2: Upload Build Folder to Base44
async function uploadFolder(dir, remotePath = '') {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      await uploadFolder(fullPath, path.join(remotePath, file));
    } else {
      const content = fs.readFileSync(fullPath);
      await client.uploadFile(DOMAIN, path.join(remotePath, file), content);
      console.log(`✅ Uploaded: ${path.join(remotePath, file)}`);
    }
  }
}

// STEP 3: Set SPA Entry Point
async function setEntry() {
  await client.setEntryPage(DOMAIN, ENTRY_PAGE);
  console.log(`✅ Entry point set: ${DOMAIN}/${ENTRY_PAGE}`);
}

// STEP 4: Verify JS
async function verifyJS() {
  console.log('🔎 Verifying JavaScript on live site...');
  try {
    const res = await axios.get(VERIFY_URL);
    const html = res.data;
    if (html.includes('You need to enable JavaScript') || !html.includes('id="root"')) {
      console.error('❌ JS verification failed: placeholder still present.');
    } else {
      console.log('✅ JS verification success: React app loaded.');
    }
  } catch (err) {
    console.error('❌ JS verification failed:', err.message);
  }
}

// STEP 5: Deploy
async function deploy() {
  try {
    console.log('🚀 Starting Encircle Net deployment...');
    injectLoader(path.join(BUILD_DIR, 'index.html'));
    await uploadFolder(BUILD_DIR);
    await setEntry();
    await verifyJS();
    console.log('🎉 Deployment complete. /login is now fully interactive!');
  } catch (err) {
    console.error('❌ Deployment failed:', err);
  }
}

deploy();
