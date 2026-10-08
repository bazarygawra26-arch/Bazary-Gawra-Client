import { NextResponse } from 'next/server';
import { mockProducts } from '@/data/mockData';

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType = 'image/jpeg', sampleType } = await request.json();

    if (!imageBase64 && !sampleType) {
      return NextResponse.json({ error: 'Image data or sample type is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Helper: Build prompt with strict non-hallucination rules
    const systemPrompt = `You are the lead product inspection AI for BAZARY GAWRA, a Kurdistan local product discovery and comparison marketplace.
Your task is to analyze the VISIBLE product information in this photo.

CRITICAL RULES:
1. ONLY describe what can be directly seen in the image.
2. AI MUST NOT invent, guess, or extrapolate information that cannot be seen.
3. If an attribute cannot be determined from the image, explicitly set it to "Not visible" or "Not provided".
4. NEVER guess: price, warranty, seller name, seller location, delivery fees, return policy, product origin, or hidden internal specs.
5. Identify clearly visible text, labels, brand logos, model numbers, visible capacity markings, and visible physical controls.

Respond with ONLY valid JSON with this exact schema (no markdown fences, no extra text):
{
  "category": "Kitchen & Home" | "Coffee & Espresso" | "Home Appliances" | "Local Food & Honey" | "Handmade & Crafts" | "Electronics" | "Other",
  "product_type": "Short name of product type (e.g. Dual Basket Air Fryer, Espresso Machine)",
  "brand_name": "Visible brand name or 'Not visible'",
  "model_number": "Visible model number or 'Not visible'",
  "visible_capacity": "Visible capacity (e.g. 5L, 1.1L, 1000g) or 'Not visible'",
  "visible_power": "Visible wattage/voltage markings or 'Not visible'",
  "visible_features": ["Array of 2-5 physical features clearly visible in the photo"],
  "visible_labels_text": "Any legible text seen on product/packaging or 'Not visible'",
  "available_signals": [
    "Array of 2-4 verified visible signals, e.g. 'Product category identified', 'Capacity label visible', 'Physical controls visible'"
  ],
  "missing_signals": [
    "Price not provided (not in image)",
    "Warranty terms not visible",
    "Seller and shop identity not provided",
    "Delivery information not provided",
    "Return policy not stated"
  ],
  "summary": "Concise factual 2-sentence summary based STRICTLY on what is visible. Mention that price, warranty, and seller are not visible in the image.",
  "suggested_search_query": "Keywords to find similar products in local database",
  "draft_listing": {
    "suggested_title": "Clean proposed title based only on visible brand/type",
    "category": "Matched category",
    "visible_specs": "Summary of visible capacity/features",
    "missing_required_fields": [
      "Price (IQD)",
      "Seller Name & Physical Location",
      "Warranty Duration",
      "Delivery Terms",
      "Return Policy"
    ]
  }
}`;

    // If Gemini API Key exists and imageBase64 is provided, attempt live Gemini 3.8 Flash call
    if (apiKey && imageBase64) {
      try {
        // Strip data:image/...;base64, prefix if present
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: systemPrompt },
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: cleanBase64,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

          if (rawText) {
            // Clean any potential formatting
            const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanedText);

            // Find matching local database products
            const queryKeywords = (parsed.suggested_search_query || parsed.product_type || '').toLowerCase();
            const similarProducts = mockProducts.filter((p) => {
              return (
                p.category.toLowerCase().includes(parsed.category.toLowerCase()) ||
                p.name.toLowerCase().includes(queryKeywords) ||
                queryKeywords.includes(p.name.toLowerCase().split(' ')[0])
              );
            });

            return NextResponse.json({
              success: true,
              source: 'gemini-3.8-flash',
              analysis: parsed,
              similar_products: similarProducts.length > 0 ? similarProducts.slice(0, 3) : mockProducts.slice(0, 3),
            });
          }
        } else {
          console.warn('Gemini vision API response not ok, status:', geminiRes.status);
        }
      } catch (geminiErr) {
        console.error('Gemini vision call error:', geminiErr);
        // Fall back to robust sample-based analysis below
      }
    }

    // High-quality fallback / sample simulation if API key is rate-limited or sample is requested
    const sampleAnalyses: Record<string, any> = {
      airfryer: {
        category: 'Kitchen & Home',
        product_type: 'Dual Basket Air Fryer',
        brand_name: 'Ninja Foodi (Visible badge)',
        model_number: 'AF400 series style',
        visible_capacity: 'Dual Basket (~9.5L estimated capacity)',
        visible_power: 'Digital touch display controls visible',
        visible_features: ['Two independent cooking baskets', 'Digital touch panel', 'Cool-touch front handles'],
        visible_labels_text: 'Match Cook / Sync Finish on panel',
        available_signals: [
          'Product category identified: Kitchen Appliances',
          'Dual basket form factor visible',
          'Digital control interface verified',
        ],
        missing_signals: [
          'Price not provided (not in image)',
          'Warranty terms not visible',
          'Seller and shop identity not provided',
          'Delivery information not provided',
          'Return policy not stated',
        ],
        summary:
          'AI identified this as a dual basket kitchen air fryer with digital control interface. Price, warranty, seller location, and delivery terms are not visible in the photo.',
        suggested_search_query: 'air fryer',
        draft_listing: {
          suggested_title: 'Ninja DualZone Air Fryer (Pre-filled from Photo)',
          category: 'Kitchen & Home',
          visible_specs: 'Dual Independent Baskets with Touch Interface',
          missing_required_fields: [
            'Price (IQD)',
            'Seller Name & Physical Location',
            'Warranty Duration',
            'Delivery Terms',
            'Return Policy',
          ],
        },
      },
      coffee: {
        category: 'Coffee & Espresso',
        product_type: 'Manual Espresso Machine',
        brand_name: 'DeLonghi (Visible front badge)',
        model_number: 'Dedica style slim body',
        visible_capacity: '1.1L water reservoir marking',
        visible_power: '15-Bar pressure indicator visible',
        visible_features: ['Stainless steel portafilter', 'Steam frother wand', 'Slim 15cm metallic body'],
        visible_labels_text: 'Dedica / DeLonghi',
        available_signals: [
          'Product category identified: Coffee & Espresso',
          'Stainless steel body construction visible',
          'Manual portafilter attachment present',
        ],
        missing_signals: [
          'Price not provided (not in image)',
          'Warranty terms not visible',
          'Seller and shop identity not provided',
          'Delivery information not provided',
          'Return policy not stated',
        ],
        summary:
          'AI identified this as a slim stainless steel manual espresso machine. Price, warranty coverage, seller identity, and delivery information are not visible.',
        suggested_search_query: 'espresso machine',
        draft_listing: {
          suggested_title: 'DeLonghi Dedica Espresso Machine (Pre-filled from Photo)',
          category: 'Coffee & Espresso',
          visible_specs: 'Slim Stainless Steel Manual Espresso with Steam Wand',
          missing_required_fields: [
            'Price (IQD)',
            'Seller Name & Physical Location',
            'Warranty Duration',
            'Delivery Terms',
            'Return Policy',
          ],
        },
      },
      honey: {
        category: 'Local Food & Honey',
        product_type: 'Mountain Wild Honey Jar',
        brand_name: 'Penjwen Mountain Harvest',
        model_number: 'Not visible',
        visible_capacity: '1kg (1000g Glass Jar)',
        visible_power: 'Not visible (Natural food item)',
        visible_features: ['Heavy clear glass jar with metal twist lid', 'Golden natural amber honey hue', 'Kurdish harvest label'],
        visible_labels_text: 'هەنگوینی سروشتی شاخ / 100% Raw Wild Honey',
        available_signals: [
          'Product category identified: Local Food & Honey',
          'Net weight marking visible (1kg)',
          'Natural harvest certification badge visible on label',
        ],
        missing_signals: [
          'Price not provided (not in image)',
          'Warranty / Purity guarantee certificate not provided',
          'Seller shop address not visible',
          'Delivery terms not stated',
          'Return policy not stated',
        ],
        summary:
          'AI identified this as a 1kg glass jar of wild mountain honey with Arabic/Kurdish labeling. Price, seller contact, and delivery options are not visible in the image.',
        suggested_search_query: 'honey',
        draft_listing: {
          suggested_title: 'Wild Mountain Honey 1kg Jar (Pre-filled from Photo)',
          category: 'Local Food & Honey',
          visible_specs: '1000g Net Glass Jar Pure Wild Mountain Honey',
          missing_required_fields: [
            'Price (IQD)',
            'Seller Name & Physical Location',
            'Laboratory Certificate',
            'Delivery Terms',
            'Return Policy',
          ],
        },
      },
    };

    const chosenSampleKey = sampleType || 'airfryer';
    const analysis = sampleAnalyses[chosenSampleKey] || sampleAnalyses.airfryer;

    const similarProducts = mockProducts.filter((p) => {
      return (
        p.category.toLowerCase().includes(analysis.category.toLowerCase()) ||
        p.name.toLowerCase().includes(analysis.suggested_search_query.toLowerCase())
      );
    });

    return NextResponse.json({
      success: true,
      source: 'fallback-demo',
      analysis,
      similar_products: similarProducts.length > 0 ? similarProducts.slice(0, 3) : mockProducts.slice(0, 3),
    });
  } catch (error: any) {
    console.error('Error in /api/ai-image-analyze:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
