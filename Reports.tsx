import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function Import() {
  const { tenants, addTenant, addRentRecord } = useApp();
  const [inputData, setInputData] = useState('');
  const [importMonth, setImportMonth] = useState('2026-02');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [previewData, setPreviewData] = useState<Array<{
    name: string;
    premises: string;
    rent: number;
    outstanding: number;
    paid: number;
    balance: number;
    effectiveDate: string;
    iescoNo: string;
    depositAccount: string;
  }>>([]);

  function parseData() {
    if (!inputData.trim()) {
      setMessage('Please paste data first');
      setMessageType('error');
      return;
    }

    var lines = inputData.trim().split('\n');
    if (lines.length < 2) {
      setMessage('Need at least header row and one data row');
      setMessageType('error');
      return;
    }

    // Parse headers
    var headerLine = lines[0];
    var headers: string[] = [];
    var headerParts = headerLine.split('\t');
    if (headerParts.length < 3) {
      headerParts = headerLine.split(',');
    }
    for (var h = 0; h < headerParts.length; h++) {
      headers.push(headerParts[h].trim().toLowerCase());
    }

    // Find column indexes
    var nameIdx = -1;
    var premisesIdx = -1;
    var rentIdx = -1;
    var outstandingIdx = -1;
    var paidIdx = -1;
    var balanceIdx = -1;
    var effectiveDateIdx = -1;
    var iescoIdx = -1;
    var depositAccIdx = -1;

    for (var i = 0; i < headers.length; i++) {
      var col = headers[i];
      if (col.indexOf('tenant') >= 0 && col.indexOf('name') >= 0) nameIdx = i;
      if (col === 'premises' || col === 'shop') premisesIdx = i;
      if (col === 'rent' || col === 'monthly rent') rentIdx = i;
      if (col.indexOf('outstanding') >= 0) outstandingIdx = i;
      if (col.indexOf('paid') >= 0 && col.indexOf('current') >= 0) paidIdx = i;
      if (col === 'balance' || col.indexOf('carry') >= 0) balanceIdx = i;
      if (col.indexOf('effective') >= 0) effectiveDateIdx = i;
      if (col.indexOf('iesco') >= 0) iescoIdx = i;
      if (col.indexOf('deposit') >= 0 && col.indexOf('account') >= 0) depositAccIdx = i;
    }

    if (nameIdx === -1) {
      // Try to find by position
      nameIdx = 1; // Usually second column
      premisesIdx = 2;
      rentIdx = 4;
      outstandingIdx = 5;
      paidIdx = 6;
      balanceIdx = 7;
    }

    // Parse data rows
    var data: typeof previewData = [];
    for (var j = 1; j < lines.length; j++) {
      var line = lines[j];
      if (!line.trim()) continue;

      var parts = line.split('\t');
      if (parts.length < 3) {
        parts = line.split(',');
      }

      var tenantName = parts[nameIdx] ? parts[nameIdx].trim() : '';
      
      // Skip vacated or empty
      if (!tenantName) continue;
      if (tenantName.toLowerCase().indexOf('vacate') >= 0) continue;
      if (tenantName.toLowerCase() === '-') continue;

      function parseNumber(val: string): number {
        if (!val) return 0;
        var cleaned = val.replace(/,/g, '').replace(/[^0-9.-]/g, '');
        var num = parseInt(cleaned);
        return isNaN(num) ? 0 : num;
      }

      data.push({
        name: tenantName,
        premises: parts[premisesIdx] ? parts[premisesIdx].trim() : '',
        rent: parseNumber(parts[rentIdx] || ''),
        outstanding: parseNumber(parts[outstandingIdx] || ''),
        paid: parseNumber(parts[paidIdx] || ''),
        balance: parseNumber(parts[balanceIdx] || ''),
        effectiveDate: parts[effectiveDateIdx] ? parts[effectiveDateIdx].trim() : '',
        iescoNo: parts[iescoIdx] ? parts[iescoIdx].trim() : '',
        depositAccount: parts[depositAccIdx] ? parts[depositAccIdx].trim() : '',
      });
    }

    if (data.length === 0) {
      setMessage('No valid data found. Make sure you have tenant names.');
      setMessageType('error');
      return;
    }

    setPreviewData(data);
    setMessage('Found ' + data.length + ' tenants to import');
    setMessageType('success');
  }

  function handleImport() {
    if (previewData.length === 0) {
      setMessage('No data to import. Click Preview first.');
      setMessageType('error');
      return;
    }

    var imported = 0;
    var updated = 0;

    for (var k = 0; k < previewData.length; k++) {
      var row = previewData[k];
      if (!row.name || !row.premises) continue;

      // Check if tenant exists
      var existingTenant = null;
      if (tenants) {
        for (var m = 0; m < tenants.length; m++) {
          if (tenants[m] && tenants[m].premises === row.premises) {
            existingTenant = tenants[m];
            break;
          }
        }
      }

      var tenantId = '';
      if (existingTenant) {
        tenantId = existingTenant.id;
        updated++;
      } else {
        tenantId = 'T' + Date.now() + '-' + k;
        addTenant({
          id: tenantId,
          name: row.name,
          premises: row.premises,
          phone: '',
          email: '',
          cnic: '',
          rent: row.rent,
          deposit: 0,
          depositAccountNo: row.depositAccount,
          iescoNo: row.iescoNo,
          effectiveDate: row.effectiveDate,
          status: 'active',
        });
        imported++;
      }

      // Add rent record
      addRentRecord({
        id: 'RR' + Date.now() + '-' + k,
        tenantId: tenantId,
        monthYear: importMonth,
        rent: row.rent,
        outstanding: row.outstanding,
        paid: row.paid,
        balance: row.balance,
        carryForward: row.balance,
      });
    }

    setMessage('✅ Success! Imported ' + imported + ' new tenants, updated ' + updated + ' existing.');
    setMessageType('success');
    setPreviewData([]);
    setInputData('');
  }

  function loadSample() {
    var sample = 'Sr No\tTenant Name\tPremises\tEffective Date\tRent\tOutstanding previous Months\tPaid of current Month\tBalance\tDepositd Account No\tIesco No\n';
    sample += '1\tZafar Mahmood\t1M\t01-Jul-23\t97437\t170183\t0\t267620\t172\t6855087\n';
    sample += '2\tZahoor ul Hassan\t3M\t20-Sep-23\t53944\t71154\t50000\t75098\t172\t4298250\n';
    sample += '3\tNadeem Qaiser\t4M\t01-Jul-22\t50820\t24080\t0\t74900\t521\t4534401\n';
    setInputData(sample);
    setMessage('Sample data loaded. Click Preview to see the data.');
    setMessageType('info');
  }

  function clearAll() {
    setInputData('');
    setPreviewData([]);
    setMessage('');
  }

  function formatNum(num: number) {
    if (!num || isNaN(num)) return '0';
    return num.toLocaleString();
  }

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📥 Import Rent Sheet Data</h1>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-800 mb-2">📋 How to Import:</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
            <li>Open your Excel rent sheet</li>
            <li>Select all data including headers (Ctrl+A)</li>
            <li>Copy (Ctrl+C)</li>
            <li>Paste in the box below (Ctrl+V)</li>
            <li>Click <strong>Preview</strong> to check data</li>
            <li>Click <strong>Import</strong> to save</li>
          </ol>
        </div>

        {/* Month Selection */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Import for Month *</label>
              <input
                type="month"
                className="w-full border rounded-lg px-3 py-2"
                value={importMonth}
                onChange={function(e) { setImportMonth(e.target.value); }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadSample}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                📄 Load Sample
              </button>
              <button
                onClick={clearAll}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                🗑️ Clear
              </button>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste Excel Data Here:
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
            rows={10}
            placeholder="Copy from Excel and paste here...&#10;&#10;Example:&#10;Sr No	Tenant Name	Premises	Rent	Outstanding	Paid	Balance&#10;1	Zafar Mahmood	1M	97437	170183	0	267620"
            value={inputData}
            onChange={function(e) { setInputData(e.target.value); }}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={parseData}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-bold"
            >
              👁️ Preview Data
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={
            messageType === 'error' ? 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4' :
            messageType === 'success' ? 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4' :
            'bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4'
          }>
            {message}
          </div>
        )}

        {/* Preview Table */}
        {previewData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">📋 Preview ({previewData.length} tenants)</h3>
              <button
                onClick={handleImport}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-bold"
              >
                ✅ Import Data
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Tenant Name</th>
                    <th className="p-2 text-left">Premises</th>
                    <th className="p-2 text-right">Rent</th>
                    <th className="p-2 text-right">Outstanding</th>
                    <th className="p-2 text-right">Paid</th>
                    <th className="p-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map(function(row, idx) {
                    return (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{idx + 1}</td>
                        <td className="p-2 font-medium">{row.name}</td>
                        <td className="p-2">{row.premises}</td>
                        <td className="p-2 text-right">{formatNum(row.rent)}</td>
                        <td className="p-2 text-right text-orange-600">{formatNum(row.outstanding)}</td>
                        <td className="p-2 text-right text-green-600">{formatNum(row.paid)}</td>
                        <td className="p-2 text-right font-bold">{formatNum(row.balance)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}