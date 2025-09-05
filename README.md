# procurement-mvp

## Task detail layout

The task detail page now includes a dedicated `SidePanel` grouping auxiliary fields
such as assignees, supplier and delivery information. On mobile devices the panel
is available through a drawer for a cleaner primary view.

## OnlyOffice integration

Online editing for DOCX, XLSX, PPTX and PDF files is powered by OnlyOffice Document Server. Run the server with JWT enabled and use the same secret in the API configuration.

```
onlyoffice:
  image: onlyoffice/documentserver:latest
  environment:
    - JWT_ENABLED=true
    - JWT_SECRET=changeme_super_secret
```

API environment:

```
DS_JWT_SECRET=changeme_super_secret
DS_PUBLIC_URL=http://localhost:8082
API_PUBLIC_URL=http://api:3001
```

The API signs the editor config and saves changes through the OnlyOffice callback, updating the original file in `uploads/`.