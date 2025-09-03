import OrderDeliveryPanel from './OrderDeliveryPanel';
import { SaveIndicator } from '../ui/save-indicator';
import { TaskPayload } from '@/lib/api';

interface OrderDetailsSectionProps {
  orderDate: string;
  orderReceivedDate: string;
  orderNumber: string;
  authority: string;
  orderType: string;
  productsReceivedDate: string;
  earlyDelivery: boolean;
  deliveryDate: string;
  orderTypes: { value: string; label: string }[];
  setOrderDate: (val: string) => void;
  setOrderReceivedDate: (val: string) => void;
  setOrderNumber: (val: string) => void;
  setAuthority: (val: string) => void;
  setOrderType: (val: string) => void;
  setProductsReceivedDate: (val: string) => void;
  setEarlyDelivery: (val: boolean) => void;
  setDeliveryDate: (val: string) => void;
  save: (data: Partial<TaskPayload>) => void;
  mutation: any;
}

export default function OrderDetailsSection({
  orderDate,
  orderReceivedDate,
  orderNumber,
  authority,
  orderType,
  productsReceivedDate,
  earlyDelivery,
  deliveryDate,
  orderTypes,
  setOrderDate,
  setOrderReceivedDate,
  setOrderNumber,
  setAuthority,
  setOrderType,
  setProductsReceivedDate,
  setEarlyDelivery,
  setDeliveryDate,
  save,
  mutation,
}: OrderDetailsSectionProps) {
  const handleChange = (d: {
    orderDate?: string;
    orderReceivedDate?: string;
    orderNumber?: string;
    authority?: string;
    orderType?: string;
    productsReceivedDate?: string;
    earlyDelivery?: boolean;
    deliveryDate?: string;
  }) => {
    if (d.orderDate !== undefined) setOrderDate(d.orderDate);
    if (d.orderReceivedDate !== undefined) setOrderReceivedDate(d.orderReceivedDate);
    if (d.orderNumber !== undefined) setOrderNumber(d.orderNumber);
    if (d.authority !== undefined) setAuthority(d.authority);
    if (d.orderType !== undefined) setOrderType(d.orderType);
    if (d.productsReceivedDate !== undefined) setProductsReceivedDate(d.productsReceivedDate);
    if (d.earlyDelivery !== undefined) setEarlyDelivery(d.earlyDelivery);
    if (d.deliveryDate !== undefined) setDeliveryDate(d.deliveryDate);

    const payload: any = {};
    if (d.orderDate !== undefined) payload.orderDate = d.orderDate ? new Date(d.orderDate).toISOString() : null;
    if (d.orderReceivedDate !== undefined)
      payload.orderReceivedDate = d.orderReceivedDate ? new Date(d.orderReceivedDate).toISOString() : null;
    if (d.orderNumber !== undefined) payload.orderNumber = d.orderNumber || null;
    if (d.authority !== undefined) payload.authority = d.authority || null;
    if (d.orderType !== undefined) payload.orderType = d.orderType || null;
    if (d.productsReceivedDate !== undefined)
      payload.productsReceivedDate = d.productsReceivedDate ? new Date(d.productsReceivedDate).toISOString() : null;
    if (d.deliveryDate !== undefined)
      payload.deliveryDate = d.deliveryDate ? new Date(d.deliveryDate).toISOString() : null;
    if (Object.keys(payload).length) save(payload);
  };

  return (
    <div>
      <OrderDeliveryPanel
        orderDate={orderDate}
        orderReceivedDate={orderReceivedDate}
        orderNumber={orderNumber}
        authority={authority}
        orderType={orderType}
        productsReceivedDate={productsReceivedDate}
        earlyDelivery={earlyDelivery}
        deliveryDate={deliveryDate}
        orderTypes={orderTypes}
        onChange={handleChange}
      />
      <SaveIndicator mutation={mutation} />
    </div>
  );
}