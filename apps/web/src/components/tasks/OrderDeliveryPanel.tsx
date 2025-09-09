import { Input } from '../ui/input';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  orderDate: string;
  orderReceivedDate: string;
  orderNumber: string;
  authority: string;
  orderType: string;
  productsReceivedDate: string;
  earlyDelivery: boolean;
  deliveryDate: string;
  orderTypes: any[];
  onChange: (data: Record<string, any>) => void;
}

export default function OrderDeliveryPanel({
  orderDate,
  orderReceivedDate,
  orderNumber,
  authority,
  orderType,
  productsReceivedDate,
  earlyDelivery,
  deliveryDate,
  orderTypes,
  onChange,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">{t('labels.orderDate')}</label>
        <DatePicker
          selected={orderDate ? new Date(orderDate) : null}
          onChange={(d: Date | null) =>
            onChange({ orderDate: d ? d.toISOString().slice(0, 10) : '' })
          }
          dateFormat="yyyy-MM-dd"
          className="w-full border p-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">{t('labels.orderReceivedDate')}</label>
        <DatePicker
          selected={orderReceivedDate ? new Date(orderReceivedDate) : null}
          onChange={(d: Date | null) =>
            onChange({ orderReceivedDate: d ? d.toISOString().slice(0, 10) : '' })
          }
          dateFormat="yyyy-MM-dd"
          className="w-full border p-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">{t('labels.orderNumber')}</label>
        <Input value={orderNumber} onChange={e => onChange({ orderNumber: e.target.value })} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">{t('labels.authority')}</label>
        <Input value={authority} onChange={e => onChange({ authority: e.target.value })} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">{t('labels.orderType')}</label>
        <select className="w-full border p-2" value={orderType} onChange={e => onChange({ orderType: e.target.value })}>
          <option value="">{t('placeholders.selectType')}</option>
          {orderTypes?.map((o: any) => (
            <option key={o.id || o.value} value={o.value || o.id}>{o.label || o.name || o.value}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">{t('labels.productsReceivedDate')}</label>
        <DatePicker
          selected={productsReceivedDate ? new Date(productsReceivedDate) : null}
          onChange={(d: Date | null) =>
            onChange({ productsReceivedDate: d ? d.toISOString().slice(0, 10) : '' })
          }
          dateFormat="yyyy-MM-dd"
          className="w-full border p-2"
        />
      </div>
      <div className="md:col-span-2 flex flex-col gap-1">
        <label className="inline-flex items-center text-sm font-medium">
          <input type="checkbox" className="mr-2" checked={earlyDelivery} onChange={e => onChange({ earlyDelivery: e.target.checked })} />
          {t('labels.earlyDelivery')}
        </label>
        {earlyDelivery && (
          <DatePicker
            selected={deliveryDate ? new Date(deliveryDate) : null}
            onChange={(d: Date | null) =>
              onChange({ deliveryDate: d ? d.toISOString().slice(0, 10) : '' })
            }
            dateFormat="yyyy-MM-dd"
            className="w-full border p-2"
          />
        )}
      </div>
    </div>
  );
}