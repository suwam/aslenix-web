const fs = require('fs');
const files = [
  'src/pages/admin/AdminSetup.tsx', 
  'src/pages/admin/AdminResetPassword.tsx', 
  'src/pages/admin/AdminLogin.tsx', 
  'src/pages/admin/AdminForgotPassword.tsx', 
  'src/components/admin/AdminLayout.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/.*<div className="absolute[^>]+blur-\[\d+px\].*>\n?/g, '');
  fs.writeFileSync(f, content);
  console.log('Updated ' + f);
});
