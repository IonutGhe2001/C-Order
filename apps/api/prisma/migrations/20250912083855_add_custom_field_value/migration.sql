-- CreateTable
CREATE TABLE "CustomField" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskCustomFieldValue" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT,

    CONSTRAINT "TaskCustomFieldValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomField_name_key" ON "CustomField"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TaskCustomFieldValue_taskId_fieldId_key" ON "TaskCustomFieldValue"("taskId", "fieldId");

-- AddForeignKey
ALTER TABLE "TaskCustomFieldValue" ADD CONSTRAINT "TaskCustomFieldValue_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskCustomFieldValue" ADD CONSTRAINT "TaskCustomFieldValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "CustomField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
