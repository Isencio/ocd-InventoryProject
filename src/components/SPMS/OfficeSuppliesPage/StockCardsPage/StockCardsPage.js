import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './StockCardsPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const StockCardsPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stockData, setStockData] = useState({
        fundcluster: '',
        stocknumber: '',
        item: '',
        description: '',
        unitofmeasurement: '',
        transactions: [{
            date: '',
            reference: '',
            receiptqty: '',
            receiptunitcost: '',
            receipttotalcost: '',
            issueqty: '',
            issueoffice: '',
            balanceqty: '',
            balanceunitcost: '',
            balancetotalcost: '',
            daystoconsume: ''
        }]
    });
    const navigate = useNavigate();
    const tableRef = useRef(null);

    const fetchStockData = async (stockNumber) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`https://10.16.4.97/project/stockcards.php?stocknumber=${stockNumber}`);
            
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                // First item contains header info
                const headerData = data[0];
                // The rest are transactions
                const transactions = data.slice(1);
                
                setStockData({
                    fundcluster: headerData.fundcluster || '',
                    stocknumber: headerData.stocknumber || '',
                    item: headerData.item || '',
                    description: headerData.description || '',
                    unitofmeasurement: headerData.unitofmeasurement || '',
                    transactions: transactions.length > 0 ? 
                        transactions.map(t => ({
                            date: t.date || '',
                            reference: t.reference || '',
                            receiptqty: t.receiptqty || '',
                            receiptunitcost: t.receiptunitcost || '',
                            receipttotalcost: t.receipttotalcost || '',
                            issueqty: t.issueqty || '',
                            issueoffice: t.issueoffice || '',
                            balanceqty: t.balanceqty || '',
                            balanceunitcost: t.balanceunitcost || '',
                            balancetotalcost: t.balancetotalcost || '',
                            daystoconsume: t.daystoconsume || ''
                        })) : 
                        [{
                            date: '',
                            reference: '',
                            receiptqty: '',
                            receiptunitcost: '',
                            receipttotalcost: '',
                            issueqty: '',
                            issueoffice: '',
                            balanceqty: '',
                            balanceunitcost: '',
                            balancetotalcost: '',
                            daystoconsume: ''
                        }]
                });
            } else {
                // Initialize with empty data if no record found
                setStockData({
                    fundcluster: '',
                    stocknumber: stockNumber,
                    item: '',
                    description: '',
                    unitofmeasurement: '',
                    transactions: [{
                        date: '',
                        reference: '',
                        receiptqty: '',
                        receiptunitcost: '',
                        receipttotalcost: '',
                        issueqty: '',
                        issueoffice: '',
                        balanceqty: '',
                        balanceunitcost: '',
                        balancetotalcost: '',
                        daystoconsume: ''
                    }]
                });
            }
            
            setLoading(false);
        } catch (error) {
            setError(error.message || 'Failed to load data. Please check your connection.');
            setLoading(false);
            console.error('Fetch error:', error);
        }
    };

    const handleStockNumberChange = (value) => {
        const updatedData = {
            ...stockData,
            stocknumber: value
        };
        setStockData(updatedData);
        
        if (value) {
            fetchStockData(value);
        } else {
            // Clear all data if stock number is empty
            setStockData({
                fundcluster: '',
                stocknumber: '',
                item: '',
                description: '',
                unitofmeasurement: '',
                transactions: [{
                    date: '',
                    reference: '',
                    receiptqty: '',
                    receiptunitcost: '',
                    receipttotalcost: '',
                    issueqty: '',
                    issueoffice: '',
                    balanceqty: '',
                    balanceunitcost: '',
                    balancetotalcost: '',
                    daystoconsume: ''
                }]
            });
        }
    };

    const handleHeaderChange = (field, value) => {
        setStockData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTransactionChange = (index, field, value) => {
        const updatedTransactions = [...stockData.transactions];
        updatedTransactions[index] = {
            ...updatedTransactions[index],
            [field]: value
        };
        
        // Calculate totals if relevant fields change
        if (field === 'receiptqty' || field === 'receiptunitcost') {
            const qty = parseFloat(updatedTransactions[index].receiptqty) || 0;
            const unitCost = parseFloat(updatedTransactions[index].receiptunitcost) || 0;
            updatedTransactions[index].receipttotalcost = (qty * unitCost).toFixed(2);
        }
        
        if (field === 'balanceqty' || field === 'balanceunitcost') {
            const qty = parseFloat(updatedTransactions[index].balanceqty) || 0;
            const unitCost = parseFloat(updatedTransactions[index].balanceunitcost) || 0;
            updatedTransactions[index].balancetotalcost = (qty * unitCost).toFixed(2);
        }
        
        setStockData(prev => ({
            ...prev,
            transactions: updatedTransactions
        }));
    };

    const addNewRow = (index) => {
        // Check if we're editing the last row
        if (index === stockData.transactions.length - 1) {
            const newTransaction = {
                date: '',
                reference: '',
                receiptqty: '',
                receiptunitcost: '',
                receipttotalcost: '',
                issueqty: '',
                issueoffice: '',
                balanceqty: '',
                balanceunitcost: '',
                balancetotalcost: '',
                daystoconsume: ''
            };
            
            setStockData(prev => ({
                ...prev,
                transactions: [...prev.transactions, newTransaction]
            }));
            
            // Focus on the first cell of the new row after a small delay
            setTimeout(() => {
                const rows = tableRef.current.querySelectorAll('tbody tr');
                const lastRow = rows[rows.length - 1];
                if (lastRow) {
                    const firstInput = lastRow.querySelector('input');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }
            }, 50);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addNewRow(index);
        }
    };

    const onBack = () => {
        navigate(-1);
    };

    const onExport = () => {
        const exportData = [
            ['Republic of the Philippines'],
            ['Department of National Defense'],
            ['OFFICE OF CIVIL DEFENSE'],
            ['NATIONAL CAPITAL REGION'],
            ['NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY'],
            ['Telephone No: (02) 421-1918; OPCEN Mobile Number: 0917-827-6325'],
            ['E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com'],
            [],
            ['STOCK CARD'],
            [],
            ['Fund Cluster:', stockData.fundcluster],
            ['Item:', stockData.item, 'Stock No.:', stockData.stocknumber],
            ['Description:', stockData.description],
            ['Unit of Measurement:', stockData.unitofmeasurement],
            [],
            [
                'Date', 'Reference', 
                'RECEIPT', '', '', 
                'BALANCE', '', '', 
                'ISSUE', '', 
                'No. of Days to Consume'
            ],
            [
                '', '', 
                'Qty', 'Unit Cost', 'Total Cost', 
                'Qty', 'Unit Cost', 'Total Cost', 
                'Qty', 'Office', 
                ''
            ],
            ...stockData.transactions.map(t => [
                t.date,
                t.reference,
                t.receiptqty,
                t.receiptunitcost,
                t.receipttotalcost,
                t.balanceqty,
                t.balanceunitcost,
                t.balancetotalcost,
                t.issueqty,
                t.issueoffice,
                t.daystoconsume
            ])
        ];

        const ws = XLSX.utils.aoa_to_sheet(exportData);
        ws['!cols'] = [
            { width: 15 }, { width: 15 }, 
            { width: 10 }, { width: 12 }, { width: 12 },
            { width: 10 }, { width: 12 }, { width: 12 },
            { width: 10 }, { width: 15 },
            { width: 20 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "StockCard");
        XLSX.writeFile(wb, `StockCard_${stockData.stocknumber || 'Inventory'}.xlsx`);
    };

    const stockNumberOptions = [
        { value: '', label: 'Select Stock No.' },
        { value: 'A1', label: 'A1' },
        { value: 'A2', label: 'A2' },
        { value: 'A3', label: 'A3' },
        { value: 'A4', label: 'A4' },
    ];

    return (
        <div className="stock-cards-container">
            {/* Loading Modal */}
            {loading && (
                <div className="loading-modal">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <p>Loading stock data...</p>
                        {error && <p className="error-text">{error}</p>}
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {error && !loading && (
                <div className="error-modal">
                    <div className="error-content">
                        <h3>Error</h3>
                        <p>{error}</p>
                        <div className="error-actions">
                            <button onClick={() => setError(null)}>OK</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="header-top">
                <button className="return-button" onClick={onBack}> &larr; </button>
                <h1>Stock Card</h1>
            </div>
            <div className="stock-cards-header">
                <div className="header-text">
                    <p>Republic of the Philippines</p>
                    <p>Department of National Defense</p>
                    <p>OFFICE OF CIVIL DEFENSE</p>
                    <p>NATIONAL CAPITAL REGION</p>
                    <p>NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY</p>
                    <p>Telephone No: (02) 421-1918; OPCEN Mobile Number: 0917-827-6325</p>
                    <p>E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com</p>
                </div>

                <div className="table-container" ref={tableRef}>
                    <table>
                        <thead>
                            <tr>
                                <th className="Item-right-align">Fund Cluster:</th>
                                <td className="input-Fundcluster-cell">
                                    <input
                                        type="text"
                                        value={stockData.fundcluster}
                                        onChange={(e) => handleHeaderChange('fundcluster', e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th className="Item-left-align">Item:</th>
                                <td className="input-Item-cell">
                                    <input
                                        type="text"
                                        value={stockData.item}
                                        onChange={(e) => handleHeaderChange('item', e.target.value)}
                                    />
                                </td>
                                <th className="Item-right-align">Stock No. :</th>
                                <td className="input-stockno-cell">
                                    <select
                                        value={stockData.stocknumber}
                                        onChange={(e) => handleStockNumberChange(e.target.value)}
                                        className="dropdown-select"
                                    >
                                        {stockNumberOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th className="Item-left-align">Description:</th>
                                <td>
                                    <input
                                        type="text"
                                        value={stockData.description}
                                        onChange={(e) => handleHeaderChange('description', e.target.value)}
                                    />
                                </td>
                                <th className="Item-right-align">Unit of Measurement:</th>
                                <td>
                                    <input
                                        type="text"
                                        value={stockData.unitofmeasurement}
                                        onChange={(e) => handleHeaderChange('unitofmeasurement', e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th colSpan="4">
                                    <table className="inner-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Reference</th>
                                                <th colSpan="3">RECEIPT</th>
                                                <th colSpan="3">BALANCE</th>
                                                <th colSpan="2">ISSUE</th>
                                                <th>No. of Days to Consume</th>
                                            </tr>
                                            <tr>
                                                <th></th>
                                                <th></th>
                                                <th>Qty</th>
                                                <th>Unit Cost</th>
                                                <th>Total Cost</th>
                                                <th>Qty</th>
                                                <th>Unit Cost</th>
                                                <th>Total Cost</th>
                                                <th>Qty</th>
                                                <th>Office</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stockData.transactions.map((transaction, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <input
                                                            type="date"
                                                            value={transaction.date}
                                                            onChange={(e) => handleTransactionChange(index, 'date', e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={transaction.reference}
                                                            onChange={(e) => handleTransactionChange(index, 'reference', e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            value={transaction.receiptqty}
                                                            onChange={(e) => handleTransactionChange(index, 'receiptqty', e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={transaction.receiptunitcost}
                                                            onChange={(e) => handleTransactionChange(index, 'receiptunitcost', e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={transaction.receipttotalcost}
                                                            onChange={(e) => handleTransactionChange(index, 'receipttotalcost', e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            value={transaction.balanceqty}
                                                            onChange={(e) => handleTransactionChange(index, 'balanceqty', e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={transaction.balanceunitcost}
                                                            onChange={(e) => handleTransactionChange(index, 'balanceunitcost', e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={transaction.balancetotalcost}
                                                            onChange={(e) => handleTransactionChange(index, 'balancetotalcost', e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            value={transaction.issueqty}
                                                            onChange={(e) => handleTransactionChange(index, 'issueqty', e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={transaction.issueoffice}
                                                            onChange={(e) => handleTransactionChange(index, 'issueoffice', e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            value={transaction.daystoconsume}
                                                            onChange={(e) => handleTransactionChange(index, 'daystoconsume', e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
            <div className="action-buttons">
                <button className="export-button" onClick={onExport}>Export to Excel</button>
            </div>
            <div className="right-image-section">
                <img src={logo} alt="OCD logo" className="vertical-OCD-image" />
            </div>
        </div>
    );
};

export default StockCardsPage;