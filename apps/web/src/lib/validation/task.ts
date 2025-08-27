import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Titlul este obligatoriu"),
  description: z.string().optional(),
  status: z.enum([
    "OPEN",
    "IN_PROGRESS",
    "BLOCKED",
    "DONE",
    "LIVRAT_PARTIAL",
    "FINALIZAT",
    "CANCELLED",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  assignees: z.array(z.string()).min(1, "Responsabilul este obligatoriu"),
  dueDate: z.date({ required_error: "Data limită este obligatorie" }),
  orderDate: z.date().optional(),
  orderReceivedDate: z.date().optional(),
  orderNumber: z.string().optional(),
  authority: z.string().optional(),
  orderType: z.string().optional(),
  productsReceivedDate: z.date().optional(),
  earlyDelivery: z.boolean().optional(),
  deliveryDate: z.date().optional(),
  attachments: z.array(z.any()).optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;