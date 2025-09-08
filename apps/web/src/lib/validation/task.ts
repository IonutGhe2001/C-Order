import { z } from "zod";
import i18n from '../i18n';

export const taskSchema = z.object({
  title: z.string().min(1, i18n.t('validation.titleRequired')),
  description: z.string().optional(),
  status: z.enum([
    "OPEN",
    "IN_PROGRESS",
    "LIVRAT_PARTIAL",
    "FINALIZAT",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  assignees: z.array(z.string()).min(1, i18n.t('validation.assigneeRequired')),
  dueDate: z.date({ required_error: i18n.t('validation.dueDateRequired') }),
  orderDate: z.date().optional(),
  orderReceivedDate: z.date().optional(),
  orderNumber: z.string().optional(),
  authority: z.string().optional(),
  orderType: z.string().optional(),
  productsReceivedDate: z.date().optional(),
  earlyDelivery: z.boolean().optional(),
  deliveryDate: z.date().optional(),
  supplier: z.string().optional(),
  attachments: z.array(z.any()).optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;