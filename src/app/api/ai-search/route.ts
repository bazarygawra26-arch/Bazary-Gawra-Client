import { NextResponse } from 'next/server';
import { mockProducts } from '@/data/mockData';

export async function POST(request: Request) {
  try {
    const { query, language = 'en' } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Detect target city
    const qLower = query.toLowerCase();
    let location = 'Kurdistan';
    if (qLower.includes('sulaymaniyah') || query.includes('سلێمانی')) location = 'Sulaymaniyah';
    else if (qLower.includes('erbil') || query.includes('هەولێر') || query.includes('أربيل')) location = 'Erbil';
    else if (qLower.includes('duhok') || query.includes('دهۆک')) location = 'Duhok';

    // In Phase 2, provide the structured mock response while preparing for direct Gemini integration in Phase 8
    const matchingProducts = mockProducts.filter((p) => {
      return (
        p.name.toLowerCase().includes(qLower) ||
        p.category.toLowerCase().includes(qLower) ||
        p.location.toLowerCase().includes(location.toLowerCase())
      );
    });

    return NextResponse.json({
      success: true,
      hasGeminiKey: Boolean(apiKey),
      interpretation: {
        query,
        detected_language: language,
        product_type: 'Local Products',
        target_location: location,
        extracted_preferences: ['Warranty verified', 'Local vendor delivery', 'Price transparency'],
        explanation: {
          en: `Identified search request for ${location} local merchants with verified warranty details.`,
          ckb: `داواکاری گەڕان دەستنیشانکرا بۆ فرۆشیارانی ناوخۆی ${location} بە زانیاری گەرەنتی ڕوون.`,
          ar: `تم تحديد طلب البحث لمتاجر ${location} المحلية مع تفاصيل الضمان الواضحة.`,
        },
      },
      products: matchingProducts.length > 0 ? matchingProducts : mockProducts.slice(0, 4),
    });
  } catch (error: any) {
    console.error('AI search route error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
