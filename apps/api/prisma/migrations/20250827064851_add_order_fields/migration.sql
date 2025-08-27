-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "authority" TEXT,
ADD COLUMN     "deliveryDate" TIMESTAMP(3),
ADD COLUMN     "orderDate" TIMESTAMP(3),
ADD COLUMN     "orderNumber" TEXT,
ADD COLUMN     "orderReceivedDate" TIMESTAMP(3),
ADD COLUMN     "orderType" TEXT,
ADD COLUMN     "productsReceivedDate" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
