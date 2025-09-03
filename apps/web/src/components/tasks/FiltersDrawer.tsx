import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface FiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FiltersDrawer({ open, onOpenChange }: FiltersDrawerProps) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-64">
        <SheetHeader>
          <SheetTitle>{t("buttons.filters")}</SheetTitle>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}