import { useState, useMemo } from 'react';
import {
  Download,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  FileText,
  DollarSign,
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';

type ReportType = 'defaulters' | 'highOutstanding' | 'advancePaid' | 'leaseExpiry' | 'paymentHistory';

export function Reports() {
  const { tenants, leases, rentRecords, payments } = useApp();
  const [selectedReport, setSelectedReport] = useState<ReportType>('defaulters');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const currentMonthYear = format(new Date(), 'yyyy-MM');

  const reportData = useMemo(() => {
    switch (selectedReport) {
      case 'defaulters': {
        const records = rentRecords.filter(
          (r) => r.monthYear === selectedMonth && r.balance > 0
        );
        return records.map((r) => {
          const tenant = tenants.find((t) => t.id === r.tenantId);
          return {
            id: r.id,
            tenantName: tenant?.name || 'Unknown',
            premises: tenant?.premises || '-',
            rent: r.rent,
            paid: r.paid,
            balance: r.balance,
          };
        }).sort((a, b) => b.balance - a.balance);
      }

      case 'highOutstanding': {
        const records = rentRecords.filter((r) => r.monthYear === currentMonthYear);
        return records
          .map((r) => {
            const tenant = tenants.find((t) => t.id === r.tenantId);
            return {
              id: r.id,
              tenantName: tenant?.name || 'Unknown',
              premises: tenant?.premises || '-',
              monthlyRent: tenant?.monthlyRent || 0,
              outstanding: r.carryForward,
            };
          })
          .filter((r) => r.outstanding > r.monthlyRent)
          .sort((a, b) => b.outstanding - a.outstanding);
      }

      case 'advancePaid': {
        const records = rentRecords.filter((r) => r.monthYear === currentMonthYear);
        return records
          .map((r) => {
            const tenant = tenants.find((t) => t.id === r.tenantId);
            return {
              id: r.id,
              tenantName: tenant?.name || 'Unknown',
              premises: tenant?.premises || '-',
              rent: r.rent,
              paid: r.paid,
              advance: r.paid - r.rent - r.outstandingPrevious,
            };
          })
          .filter((r) => r.advance > 0)
          .sort((a, b) => b.advance - a.advance);
      }

      case 'leaseExpiry': {
        return leases
          .filter((l) => l.status !== 'expired')
          .map((l) => {
            const tenant = tenants.find((t) => t.id === l.tenantId);
            const daysToExpiry = differenceInDays(parseISO(l.endDate), new Date());
            return {
              id: l.id,
              tenantName: tenant?.name || 'Unknown',
              premises: tenant?.premises || '-',
              startDate: l.startDate,
              endDate: l.endDate,
              daysToExpiry,
              status: l.status,
            };
          })
          .filter((l) => l.daysToExpiry <= 90)
          .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
      }

      case 'paymentHistory': {
        return payments
          .filter((p) => p.monthYear === selectedMonth)
          .map((p) => {
            const tenant = tenants.find((t) => t.id === p.tenantId);
            return {
              id: p.id,
              tenantName: tenant?.name || 'Unknown',
              premises: tenant?.premises || '-',
              amount: p.amount,
              date: p.paymentDate,
              method: p.paymentMethod,
              transactionNo: p.transactionNo,
            };
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }

      default:
        return [];
    }
  }, [selectedReport, selectedMonth, tenants, leases, rentRecords, payments, currentMonthYear]);

  const reportCards = [
    {
      type: 'defaulters' as ReportType,
      title: 'Defaulters List',
      description: 'Tenants with pending payments',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      type: 'highOutstanding' as ReportType,
      title: 'High Outstanding',
      description: 'Tenants with high balances',
      icon: TrendingUp,
      color: 'bg-amber-500',
    },
    {
      type: 'advancePaid' as ReportType,
      title: 'Advance Paid',
      description: 'Tenants with advance payments',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      type: 'leaseExpiry' as ReportType,
      title: 'Lease Expiry',
      description: 'Leases expiring soon',
      icon: Clock,
      color: 'bg-blue-500',
    },
    {
      type: 'paymentHistory' as ReportType,
      title: 'Payment History',
      description: 'All payments received',
      icon: FileText,
      color: 'bg-indigo-500',
    },
  ];

  const handleExport = () => {
    let csv = '';
    
    switch (selectedReport) {
      case 'defaulters':
        csv = 'Tenant,Premises,Rent,Paid,Balance\n';
        csv += (reportData as { tenantName: string; premises: string; rent: number; paid: number; balance: number }[]).map((r) => 
          `${r.tenantName},${r.premises},${r.rent},${r.paid},${r.balance}`
        ).join('\n');
        break;
      case 'highOutstanding':
        csv = 'Tenant,Premises,Monthly Rent,Outstanding\n';
        csv += (reportData as { tenantName: string; premises: string; monthlyRent: number; outstanding: number }[]).map((r) => 
          `${r.tenantName},${r.premises},${r.monthlyRent},${r.outstanding}`
        ).join('\n');
        break;
      case 'advancePaid':
        csv = 'Tenant,Premises,Rent,Paid,Advance\n';
        csv += (reportData as { tenantName: string; premises: string; rent: number; paid: number; advance: number }[]).map((r) => 
          `${r.tenantName},${r.premises},${r.rent},${r.paid},${r.advance}`
        ).join('\n');
        break;
      case 'leaseExpiry':
        csv = 'Tenant,Premises,Start Date,End Date,Days to Expiry\n';
        csv += (reportData as { tenantName: string; premises: string; startDate: string; endDate: string; daysToExpiry: number }[]).map((r) => 
          `${r.tenantName},${r.premises},${r.startDate},${r.endDate},${r.daysToExpiry}`
        ).join('\n');
        break;
      case 'paymentHistory':
        csv = 'Tenant,Premises,Amount,Date,Method,Transaction\n';
        csv += (reportData as { tenantName: string; premises: string; amount: number; date: string; method: string; transactionNo: string }[]).map((r) => 
          `${r.tenantName},${r.premises},${r.amount},${r.date},${r.method},${r.transactionNo}`
        ).join('\n');
        break;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport}-${selectedMonth}.csv`;
    a.click();
  };

  const getMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy'),
      });
    }
    return months;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-500 mt-1">Generate and export various reports</p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Report Type Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {reportCards.map((card) => (
            <button
              key={card.type}
              onClick={() => setSelectedReport(card.type)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedReport === card.type
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`p-2 rounded-lg ${card.color} w-fit mb-3`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{card.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </button>
          ))}
        </div>

        {/* Month Filter */}
        {(selectedReport === 'defaulters' || selectedReport === 'paymentHistory') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {getMonthOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Report Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {reportCards.find((c) => c.type === selectedReport)?.title}
            </h3>
          </div>
          <div className="overflow-x-auto">
            {selectedReport === 'defaulters' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premises</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rent</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(reportData as { id: string; tenantName: string; premises: string; rent: number; paid: number; balance: number }[]).map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.tenantName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{row.premises}</td>
                      <td className="px-6 py-4 text-sm text-right">Rs {row.rent.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right text-green-600">Rs {row.paid.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">Rs {row.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedReport === 'highOutstanding' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premises</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monthly Rent</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(reportData as { id: string; tenantName: string; premises: string; monthlyRent: number; outstanding: number }[]).map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.tenantName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{row.premises}</td>
                      <td className="px-6 py-4 text-sm text-right">Rs {row.monthlyRent.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">Rs {row.outstanding.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedReport === 'advancePaid' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premises</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rent</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Advance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(reportData as { id: string; tenantName: string; premises: string; rent: number; paid: number; advance: number }[]).map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.tenantName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{row.premises}</td>
                      <td className="px-6 py-4 text-sm text-right">Rs {row.rent.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right text-green-600">Rs {row.paid.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-blue-600">Rs {row.advance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedReport === 'leaseExpiry' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premises</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Days Left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(reportData as { id: string; tenantName: string; premises: string; startDate: string; endDate: string; daysToExpiry: number }[]).map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.tenantName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{row.premises}</td>
                      <td className="px-6 py-4 text-sm">{format(parseISO(row.startDate), 'dd MMM yyyy')}</td>
                      <td className="px-6 py-4 text-sm">{format(parseISO(row.endDate), 'dd MMM yyyy')}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className={`px-2 py-1 rounded font-medium ${
                          row.daysToExpiry <= 30 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {row.daysToExpiry} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedReport === 'paymentHistory' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premises</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(reportData as { id: string; tenantName: string; premises: string; amount: number; date: string; method: string; transactionNo: string }[]).map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.tenantName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{row.premises}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">Rs {row.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">{format(parseISO(row.date), 'dd MMM yyyy')}</td>
                      <td className="px-6 py-4 text-sm capitalize">{row.method}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{row.transactionNo || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {reportData.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No data found for this report</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
