import { NextRequest, NextResponse } from 'next/server';
import {
  getCustomerAddresses,
  addCustomerAddress,
  deleteCustomerAddress,
} from '@/server/db/repositories/customer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

    const addresses = await getCustomerAddresses(customerId);
    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    console.error('Failed to fetch addresses:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, title, governorate, city, addressLine, phone, isDefault } = body;

    if (!customerId || !title || !governorate || !city || !addressLine || !phone) {
      return NextResponse.json(
        { error: 'customerId, title, governorate, city, addressLine, and phone are required' },
        { status: 400 }
      );
    }

    const address = await addCustomerAddress({
      customerId,
      title,
      governorate,
      city,
      addressLine,
      phone,
      isDefault: Boolean(isDefault),
    });

    return NextResponse.json({ success: true, address }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to add address:', error);
    return NextResponse.json({ error: error.message || 'Failed to add address' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('addressId');
    const customerId = searchParams.get('customerId');

    if (!addressId || !customerId) {
      return NextResponse.json({ error: 'addressId and customerId are required' }, { status: 400 });
    }

    await deleteCustomerAddress(addressId, customerId);
    return NextResponse.json({ success: true, message: 'Address removed' });
  } catch (error: any) {
    console.error('Failed to delete address:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete address' }, { status: 400 });
  }
}
