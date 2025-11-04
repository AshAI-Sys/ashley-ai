import BatchQRPrinter from "@/components/inventory/batch-qr-printer";

export const metadata = {
  title: "Print Labels | Ashley AI",
  description: "Batch QR code and barcode label printing system",
};

export default function PrintLabelsPage() {
  return (
    <div className="container mx-auto p-6">
      <BatchQRPrinter />
    </div>
  );
}
