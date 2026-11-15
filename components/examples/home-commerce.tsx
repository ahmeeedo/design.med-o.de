/**
 * Home, set "E-Commerce" (Figma 55:4578): a product, orders, package tracking, checkout and a wallet. Loaded only
 * when its tab is chosen. Checkout and Tracking are exported for the Showcase highlights.
 */
'use client';

import { Badge, Button, Image, Link, ListRow, ListView, Radio, RadioGroup, Stack, Step, Stepper } from '@med-o/ui';
import { ExampleWall, type ExampleCard } from './example-wall';
import styles from './examples.module.css';

function ProductExample() {
  return (
    <Stack gap="content">
      <Image src="/examples/landscape-night.jpg" alt="Hills at night under a pale sun" ratio="4:3" radius="md" />
      <div className={styles.between}>
        <p className="medo-text-heading-sm">€59.00</p>
        <Badge tone="brand" size="sm">
          New
        </Badge>
      </div>
      <Button variant="secondary" className={styles.full}>
        Add to cart
      </Button>
    </Stack>
  );
}

function OrdersExample() {
  return (
    <ListView aria-label="Orders" variant="plain">
      <ListRow id="1042" title="Order #1042" description="2 items · Delivered Nov 3" meta="€84.90" />
      <ListRow id="1038" title="Order #1038" description="1 item · Delivered Oct 28" meta="€29.00" />
      <ListRow id="1031" title="Order #1031" description="3 items · Returned" meta="€112.50" />
    </ListView>
  );
}

export function TrackingExample() {
  return (
    <Stack gap="content" align="start">
      <Badge tone="info" size="sm" dot>
        In transit
      </Badge>
      <Stepper current={2} layout="compact" aria-label="Delivery">
        <Step>Ordered</Step>
        <Step>Shipped</Step>
        <Step description="Arrives today, 2–4 pm">Out for delivery</Step>
        <Step>Delivered</Step>
      </Stepper>
      <Link href="#" variant="standalone" size="sm" arrow>
        Track package
      </Link>
    </Stack>
  );
}

export function CheckoutExample() {
  return (
    <Stack gap="content">
      <RadioGroup label="Delivery" defaultValue="standard">
        <Radio value="standard" description="Free · 3–5 days">
          Standard
        </Radio>
        <Radio value="express" description="€9.90 · Tomorrow">
          Express
        </Radio>
      </RadioGroup>
      <div className={styles.between}>
        <p className="medo-text-body-sm medo-text-secondary">Total</p>
        <p className="medo-text-heading-sm">€128.40</p>
      </div>
      <Button className={styles.full}>Pay €128.40</Button>
    </Stack>
  );
}

function WalletExample() {
  return (
    <Stack gap="content">
      <Stack gap="inline">
        <p className="medo-text-caption medo-text-secondary">Available balance</p>
        <p className="medo-text-heading-xl">€240.00</p>
      </Stack>
      <div className={styles.split}>
        <Button>Add money</Button>
        <Button variant="secondary">Send</Button>
      </div>
      <ListView aria-label="Cards" variant="plain">
        <ListRow id="visa" title="Visa •••• 4242" description="Expires 08/28" meta="Default" />
        <ListRow id="mastercard" title="Mastercard •••• 8810" description="Expires 01/27" />
      </ListView>
    </Stack>
  );
}

const PRODUCT: ExampleCard = { title: 'Linen shirt', subtitle: 'Organic cotton · 4 colors', body: <ProductExample /> };
const ORDERS: ExampleCard = { title: 'Orders', subtitle: 'Last 3 months', body: <OrdersExample /> };
const TRACKING: ExampleCard = { title: 'Your package', subtitle: 'Order #1042', body: <TrackingExample /> };
const CHECKOUT: ExampleCard = { title: 'Checkout', subtitle: '2 items', body: <CheckoutExample /> };
const WALLET: ExampleCard = { title: 'Wallet', subtitle: 'Balance and cards', body: <WalletExample /> };

export function HomeCommerce() {
  return (
    <ExampleWall
      label="E-Commerce examples"
      columns={[
        [PRODUCT, ORDERS],
        [TRACKING, CHECKOUT],
        [WALLET, PRODUCT],
      ]}
      row={[PRODUCT, TRACKING, CHECKOUT]}
    />
  );
}
