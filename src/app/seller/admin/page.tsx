import { redirect } from 'next/navigation';

export default function SellerAdminRootRedirect() {
  redirect('/ku/seller/dashboard?tab=admin');
}
