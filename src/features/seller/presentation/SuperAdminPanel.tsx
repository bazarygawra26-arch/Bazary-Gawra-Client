'use client';

import React, { useEffect, useState, useCallback } from 'react';

type Lang = 'en' | 'ku' | 'ckb' | 'ar';
type Tab = 'applications' | 'products' | 'ai_stats';

interface SellerApplication {
  id: string;
  storeName: string;
  storeAddress: string;
  phone: string;
  governorate: string;
  city: string;
  approvalStatus: string;
  submittedAt: string;
}

interface PendingProduct {
  id: string;
  slug: string;
  name: string;
  sellerName: string;
  price: number;
  category: string;
  submittedAt: string;
}

interface AIStats {
  totalPrompts: number;
  successCount: number;
  errorCount: number;
  blockedCount: number;
  featureBreakdown: { feature: string; count: number }[];
  langBreakdown: { language: string; count: number }[];
}

export default function SuperAdminPanel({ lang = 'en' }: { lang?: Lang }) {
  const [tab, setTab] = useState<Tab>('applications');
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [aiStats, setAiStats] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const isRtl = lang === 'ku' || lang === 'ckb' || lang === 'ar';

  const labels = {
    en: {
      title: 'Super Admin Panel',
      applications: 'Applications',
      products: 'Product Moderation',
      aiStats: 'AI Stats',
      approve: 'Approve',
      reject: 'Reject',
      suspend: 'Suspend',
      noItems: 'No pending items.',
      loading: 'Loading…',
      reason: 'Rejection reason',
      confirm: 'Confirm Rejection',
      cancel: 'Cancel',
      phone: 'Phone',
      location: 'Location',
      submitted: 'Submitted',
      price: 'Price',
      category: 'Category',
      seller: 'Seller',
      totalPrompts: 'Total Prompts',
      success: 'Successful',
      errors: 'Errors',
      blocked: 'Quota Exceeded',
    },
    ku: {
      title: 'پانێلی سوپەر ئەدمین',
      applications: 'داواکاریەکان',
      products: 'بەدواداچوونی بەرهەم',
      aiStats: 'ئامارەکانی AI',
      approve: 'ئەرێکردن',
      reject: 'ڕەتکردنەوە',
      suspend: 'ڕاگرتن',
      noItems: 'هیچ داواکاریەکی چاوەڕوانیکراو نییە.',
      loading: 'بارکردنی…',
      reason: 'هۆکاری ڕەتکردنەوە',
      confirm: 'پشتڕاستکردنەوەی ڕەتکردنەوە',
      cancel: 'پاشگەزبوونەوە',
      phone: 'ژمارە',
      location: 'شوێن',
      submitted: 'تۆماری',
      price: 'نرخ',
      category: 'جۆر',
      seller: 'فرۆشیار',
      totalPrompts: 'کۆی داواکاری',
      success: 'سەرکەوتن',
      errors: 'هەڵەکان',
      blocked: 'سنووری تاقیکردن',
    },
  };

  const t = labels[lang === 'en' ? 'en' : 'ku'];

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/applications?type=seller');
      const json = await res.json();
      setApplications(json.applications || []);
    } catch {
      setErrorMsg('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingProducts = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/products/moderation');
      const json = await res.json();
      setPendingProducts(json.products || []);
    } catch {
      setErrorMsg('Failed to load pending products.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAiStats = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/ai/stats');
      const json = await res.json();
      setAiStats(json.stats || null);
    } catch {
      setErrorMsg('Failed to load AI stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'applications') fetchApplications();
    if (tab === 'products') fetchPendingProducts();
    if (tab === 'ai_stats') fetchAiStats();
  }, [tab, fetchApplications, fetchPendingProducts, fetchAiStats]);

  async function handleSellerAction(id: string, action: 'approve' | 'reject' | 'suspend', reason?: string) {
    setActionLoading(id + action);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'seller', targetId: id, action, reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Action failed.');
      setSuccessMsg(json.message || 'Done.');
      setRejectingId(null);
      setRejectionReason('');
      fetchApplications();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleProductAction(id: string, action: 'approve' | 'reject' | 'suspend', reason?: string) {
    setActionLoading(id + action);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/products/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, action, reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Action failed.');
      setSuccessMsg(json.message || 'Done.');
      setRejectingId(null);
      setRejectionReason('');
      fetchPendingProducts();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-green-700 flex items-center justify-center text-white font-bold text-lg">
            B
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-sm text-gray-500">Bazary Gawra | بازاڕی گەورە</p>
          </div>
        </div>

        {/* Success / Error */}
        {successMsg && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
            ✅ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            ❌ {errorMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {(['applications', 'products', 'ai_stats'] as Tab[]).map((t_) => (
            <button
              key={t_}
              onClick={() => setTab(t_)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                tab === t_
                  ? 'bg-green-700 text-white'
                  : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
              }`}
            >
              {t_ === 'applications' ? t.applications : t_ === 'products' ? t.products : t.aiStats}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 text-gray-500 py-8">
            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            <span>{t.loading}</span>
          </div>
        )}

        {/* Applications Tab */}
        {!loading && tab === 'applications' && (
          <div className="space-y-4">
            {applications.length === 0 && (
              <div className="text-center py-12 text-gray-400">{t.noItems}</div>
            )}
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{app.storeName}</p>
                    <p className="text-sm text-gray-600">
                      {t.phone}: <span className="font-mono">{app.phone || '—'}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      {t.location}: {app.governorate}, {app.city}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {t.submitted}: {new Date(app.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleSellerAction(app.id, 'approve')}
                      disabled={actionLoading === app.id + 'approve'}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === app.id + 'approve' ? '…' : t.approve}
                    </button>
                    <button
                      onClick={() => setRejectingId(app.id)}
                      className="px-4 py-2 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
                    >
                      {t.reject}
                    </button>
                    <button
                      onClick={() => handleSellerAction(app.id, 'suspend')}
                      disabled={actionLoading === app.id + 'suspend'}
                      className="px-4 py-2 bg-amber-50 text-amber-700 text-sm rounded-lg hover:bg-amber-100 border border-amber-200 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === app.id + 'suspend' ? '…' : t.suspend}
                    </button>
                  </div>
                </div>

                {/* Rejection form inline */}
                {rejectingId === app.id && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                    <label className="block text-sm font-medium text-red-700 mb-2">{t.reason}</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full text-sm border border-red-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                      placeholder="Provide a clear reason for rejection…"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleSellerAction(app.id, 'reject', rejectionReason)}
                        disabled={!rejectionReason.trim() || actionLoading === app.id + 'reject'}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg disabled:opacity-50 hover:bg-red-700"
                      >
                        {actionLoading === app.id + 'reject' ? '…' : t.confirm}
                      </button>
                      <button
                        onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                        className="px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Products Tab */}
        {!loading && tab === 'products' && (
          <div className="space-y-4">
            {pendingProducts.length === 0 && (
              <div className="text-center py-12 text-gray-400">{t.noItems}</div>
            )}
            {pendingProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      {t.seller}: {product.sellerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t.category}: {product.category} · {t.price}:{' '}
                      {Number(product.price).toLocaleString()} IQD
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {t.submitted}: {new Date(product.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleProductAction(product.id, 'approve')}
                      disabled={actionLoading === product.id + 'approve'}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === product.id + 'approve' ? '…' : t.approve}
                    </button>
                    <button
                      onClick={() => setRejectingId(product.id)}
                      className="px-4 py-2 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 border border-red-200"
                    >
                      {t.reject}
                    </button>
                    <button
                      onClick={() => handleProductAction(product.id, 'suspend')}
                      disabled={actionLoading === product.id + 'suspend'}
                      className="px-4 py-2 bg-amber-50 text-amber-700 text-sm rounded-lg hover:bg-amber-100 border border-amber-200 disabled:opacity-50"
                    >
                      {actionLoading === product.id + 'suspend' ? '…' : t.suspend}
                    </button>
                  </div>
                </div>

                {rejectingId === product.id && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                    <label className="block text-sm font-medium text-red-700 mb-2">{t.reason}</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full text-sm border border-red-200 rounded-lg p-2 resize-none"
                      placeholder="Provide a reason for rejection…"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleProductAction(product.id, 'reject', rejectionReason)}
                        disabled={!rejectionReason.trim()}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg disabled:opacity-50"
                      >
                        {t.confirm}
                      </button>
                      <button
                        onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                        className="px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* AI Stats Tab */}
        {!loading && tab === 'ai_stats' && aiStats && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: t.totalPrompts, value: aiStats.totalPrompts, color: 'green' },
                { label: t.success, value: aiStats.successCount, color: 'emerald' },
                { label: t.errors, value: aiStats.errorCount, color: 'red' },
                { label: t.blocked, value: aiStats.blockedCount, color: 'amber' },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className={`bg-white rounded-xl border border-${color}-100 p-4 text-center shadow-sm`}
                >
                  <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Feature Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">By Feature</h3>
                {aiStats.featureBreakdown.map(({ feature, count }) => (
                  <div key={feature} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <span className="text-sm text-gray-600 capitalize">{feature}</span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>

              {/* Language Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">By Language</h3>
                {aiStats.langBreakdown.map(({ language, count }) => (
                  <div key={language} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <span className="text-sm text-gray-600">
                      {language === 'ku' || language === 'ckb' ? '🇮🇶 Kurdish Sorani'
                        : language === 'ar' ? '🌍 Arabic'
                        : language === 'en' ? '🇬🇧 English'
                        : language}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
