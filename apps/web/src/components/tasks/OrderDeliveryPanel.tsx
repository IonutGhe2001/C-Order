import { Input } from '../ui/input';
import { useTranslation } from 'react-i18next';

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
      <div>
        <label className="block text-sm font-medium">{t('labels.orderDate')}</label>
        <Input type="date" className="mt-1" value={orderDate} onChange={e => onChange({ orderDate: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium">{t('labels.orderReceivedDate')}</label>
        <Input type="date" className="mt-1" value={orderReceivedDate} onChange={e => onChange({ orderReceivedDate: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium">{t('labels.orderNumber')}</label>
        <Input className="mt-1" value={orderNumber} onChange={e => onChange({ orderNumber: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium">{t('labels.authority')}</label>
        <Input className="mt-1" value={authority} onChange={e => onChange({ authority: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium">{t('labels.orderType')}</label>
        <select className="mt-1 w-full border p-2" value={orderType} onChange={e => onChange({ orderType: e.target.value })}>
          <option value="">{t('placeholders.selectType')}</option>
          {orderTypes?.map((o: any) => (
            <option key={o.id || o.value} value={o.value || o.id}>{o.label || o.name || o.value}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">{t('labels.productsReceivedDate')}</label>
        <Input type="date" className="mt-1" value={productsReceivedDate} onChange={e => onChange({ productsReceivedDate: e.target.value })} />
      </div>
      <div className="md:col-span-2">
        <label className="inline-flex items-center text-sm font-medium">
          <input type="checkbox" className="mr-2" checked={earlyDelivery} onChange={e => onChange({ earlyDelivery: e.target.checked })} />
          {t('labels.earlyDelivery')}
        </label>
        {earlyDelivery && (
          <Input type="date" className="mt-1" value={deliveryDate} onChange={e => onChange({ deliveryDate: e.target.value })} />
        )}
      </div>
    </div>
  );
}