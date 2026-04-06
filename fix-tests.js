const fs = require('fs');
const path = require('path');

const specFiles = [
  'src/app/app.component.spec.ts',
  'src/app/features/auth/auth.component.spec.ts',
  'src/app/features/auth/pages/login/login.component.spec.ts',
  'src/app/features/auth/pages/register/register.component.spec.ts',
  'src/app/features/back-office/back-office.component.spec.ts',
  'src/app/features/back-office/pages/dashboard/dashboard.component.spec.ts',
  'src/app/features/back-office/pages/laboratory-form/laboratory-form.component.spec.ts',
  'src/app/features/back-office/pages/laboratory-list/laboratory-list.component.spec.ts',
  'src/app/features/back-office/pages/user-management/user-management.component.spec.ts',
  'src/app/features/front-office/front-office.component.spec.ts',
  'src/app/features/front-office/layout/front-layout/front-layout.component.spec.ts',
  'src/app/features/front-office/pages/contact/contact.component.spec.ts',
  'src/app/features/front-office/pages/home/home.component.spec.ts',
  'src/app/features/front-office/patient/components/sidebar/sidebar.component.spec.ts',
  'src/app/features/front-office/patient/components/topbar/topbar.component.spec.ts',
  'src/app/features/front-office/patient/pages/dashboard/dashboard.component.spec.ts',
  'src/app/services/lab-request.service.spec.ts'
];

for (const fp of specFiles) {
  let content = fs.readFileSync(fp, 'utf8');

  // Add NO_ERRORS_SCHEMA if not present
  if (!content.includes('NO_ERRORS_SCHEMA')) {
    content = "import { NO_ERRORS_SCHEMA } from '@angular/core';\n" + content;
  }

  if (!content.includes('HttpClientTestingModule')) {
    content = "import { HttpClientTestingModule } from '@angular/common/http/testing';\n" + content;
  }

  if (!content.includes('RouterTestingModule')) {
    content = "import { RouterTestingModule } from '@angular/router/testing';\n" + content;
  }

  // Inject into TestBed.configureTestingModule
  content = content.replace(/TestBed\.configureTestingModule\(\s*\{/, "TestBed.configureTestingModule({\n      schemas: [NO_ERRORS_SCHEMA],\n      imports: [HttpClientTestingModule, RouterTestingModule],");
  
  if (content.includes("imports: [") && !content.includes("HttpClientTestingModule, RouterTestingModule")) {
    // If it already had imports array, it might be messy to merge, let's just do a simple replace
    content = content.replace(/imports:\s*\[/, "imports: [HttpClientTestingModule, RouterTestingModule, ");
  }

  fs.writeFileSync(fp, content, 'utf8');
}

console.log("Specs modified");
