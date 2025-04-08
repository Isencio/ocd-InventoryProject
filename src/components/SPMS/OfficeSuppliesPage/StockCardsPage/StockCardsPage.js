import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './StockCardsPage.css';
import logo from '../../../../Assets/OCD-main.jpg';
import { SiHackclub } from 'react-icons/si';

const StockCardsPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stockData, setStockData] = useState({
        fundcluster: '',
        stocknumber: '',
        item: '',
        description: '',
        unitofmeasurement: '',
        transactions: []
    });
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const navigate = useNavigate();
    const tableRef = useRef(null);

    useEffect(() => {
        if (stockData.stocknumber) {
            fetchStockData(stockData.stocknumber);
        }
    }, []);

    const validateNumber = (value) => {
        if (value === '' || value === null) return '';
        const num = parseFloat(value);
        return isNaN(num) ? '' : Math.max(0, num).toString();
    };

    const fetchStockData = async (stockNumber) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`http://localhost/project/stockcards.php?stocknumber=${stockNumber}`);
            
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Expected array but received different data structure');
            }

            const processedData = {
                fundcluster: data[0]?.fundcluster || '',
                stocknumber: data[0]?.stocknumber || stockNumber,
                item: data[0]?.item || '',
                description: data[0]?.description || '',
                unitofmeasurement: data[0]?.unitofmeasurement || '',
                transactions: data.length > 0 ? data.map(processTransaction) : [createEmptyTransaction()]
            };

            setStockData(processedData);
            setOriginalData(JSON.parse(JSON.stringify(processedData)));
            setHasChanges(false);
            
        } catch (error) {
            console.error('Error in fetchStockData:', error);
            setError(error.message || 'Failed to load stock data');
            const emptyData = {
                fundcluster: '',
                stocknumber: stockNumber,
                item: '',
                description: '',
                unitofmeasurement: '',
                transactions: [createEmptyTransaction()]
            };
            setStockData(emptyData);
            setOriginalData(JSON.parse(JSON.stringify(emptyData)));
        } finally {
            setLoading(false);
        }
    };

    const processTransaction = (item) => ({
        id: item.StockID || Date.now().toString(),
        date: item.date || '',
        reference: item.reference || '',
        receiptqty: validateNumber(item.receiptqty),
        receiptunitcost: validateNumber(item.receiptunitcost),
        receipttotalcost: validateNumber(item.receipttotalcost),
        issueqty: validateNumber(item.issueqty),
        issueoffice: item.issueoffice || '',
        balanceqty: validateNumber(item.balanceqty),
        balanceunitcost: validateNumber(item.balanceunitcost),
        balancetotalcost: validateNumber(item.balancetotalcost),
        daystoconsume: validateNumber(item.daystoconsume)
    });

    const createEmptyTransaction = () => ({
        id: Date.now().toString(),
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
    });

    const handleStockNumberChange = (value) => {
        if (hasChanges) {
            if (window.confirm('You have unsaved changes. Do you want to discard them?')) {
                proceedWithStockNumberChange(value);
            }
        } else {
            proceedWithStockNumberChange(value);
        }
    };

    const proceedWithStockNumberChange = (value) => {
        const updatedData = {
            ...stockData,
            stocknumber: value
        };
        setStockData(updatedData);
        
        if (value) {
            fetchStockData(value);
        } else {
            const emptyData = {
                fundcluster: '',
                stocknumber: '',
                item: '',
                description: '',
                unitofmeasurement: '',
                transactions: [createEmptyTransaction()]
            };
            setStockData(emptyData);
            setOriginalData(JSON.parse(JSON.stringify(emptyData)));
            setHasChanges(false);
        }
    };

    const handleHeaderChange = (field, value) => {
        setStockData(prev => ({
            ...prev,
            [field]: value
        }));
        checkForChanges({ ...stockData, [field]: value });
    };

    const handleTransactionChange = (index, field, value) => {
        const numericFields = [
            'receiptqty', 'receiptunitcost', 'receipttotalcost',
            'issueqty', 'balanceqty', 'balanceunitcost',
            'balancetotalcost', 'daystoconsume'
        ];
        
        const validatedValue = numericFields.includes(field) ? validateNumber(value) : value;
        
        const updatedTransactions = [...stockData.transactions];
        updatedTransactions[index] = {
            ...updatedTransactions[index],
            [field]: validatedValue
        };
        
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
        
        const updatedData = {
            ...stockData,
            transactions: updatedTransactions
        };
        
        setStockData(updatedData);
        checkForChanges(updatedData);
    };

    const checkForChanges = (currentData) => {
        const changed = JSON.stringify(currentData) !== JSON.stringify(originalData);
        setHasChanges(changed);
    };

    const addNewRow = () => {
        const updatedData = {
            ...stockData,
            transactions: [...stockData.transactions, createEmptyTransaction()]
        };
        setStockData(updatedData);
        checkForChanges(updatedData);
        
        setTimeout(() => {
            const rows = tableRef.current?.querySelectorAll('tbody tr');
            if (rows && rows.length > 0) {
                const lastRow = rows[rows.length - 1];
                const firstInput = lastRow.querySelector('input');
                firstInput?.focus();
            }
        }, 50);
    };

    const deleteRow = (index) => {
        if (stockData.transactions.length <= 1) {
            setError('At least one transaction must remain');
            return;
        }

        if (window.confirm('Are you sure you want to delete this transaction?')) {
            const updatedTransactions = [...stockData.transactions];
            updatedTransactions.splice(index, 1);
            
            const updatedData = {
                ...stockData,
                transactions: updatedTransactions
            };
            
            setStockData(updatedData);
            checkForChanges(updatedData);
        }
    };

    const saveData = async () => {
        try {
            setLoading(true);
            
            // Prepare the data with proper numeric values
            const dataToSend = {
                ...stockData,
                transactions: stockData.transactions.map(t => ({
                    ...t,
                    receiptqty: parseFloat(t.receiptqty) || 0,
                    receiptunitcost: parseFloat(t.receiptunitcost) || 0,
                    receipttotalcost: parseFloat(t.receipttotalcost) || 0,
                    issueqty: parseFloat(t.issueqty) || 0,
                    balanceqty: parseFloat(t.balanceqty) || 0,
                    balanceunitcost: parseFloat(t.balanceunitcost) || 0,
                    balancetotalcost: parseFloat(t.balancetotalcost) || 0,
                    daystoconsume: parseInt(t.daystoconsume) || 0
                }))
            };
    
            const response = await fetch('http://localhost/project/save_stockcards.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    stockData: dataToSend
                })
            });
    
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.message || `Server error: ${response.status}`);
            }
    
            setOriginalData(JSON.parse(JSON.stringify(stockData)));
            setHasChanges(false);
            alert('Data saved successfully!');
        } catch (error) {
            console.error('Error saving data:', error);
            setError(error.message || 'Failed to save data. Check console for details.');
        } finally {
            setLoading(false);
            setShowSaveConfirm(false);
        }
    };

    const confirmSave = () => {
        setShowSaveConfirm(true);
    };

    const cancelSave = () => {
        setShowSaveConfirm(false);
    };

    const onExport = () => {
        if (!stockData.transactions.length) {
            setError('No data to export');
            return;
        }

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
            {loading && (
                <div className="loading-modal">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <p>Loading stock data...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="error-modal">
                    <div className="error-content">
                        <h3>Error</h3>
                        <p>{error}</p>
                        <button onClick={() => setError(null)}>OK</button>
                    </div>
                </div>
            )}

            {showSaveConfirm && (
                <div className="confirmation-modal">
                    <div className="confirmation-content">
                        <h3>Confirm Save</h3>
                        <p>Are you sure you want to save these changes?</p>
                        <div className="confirmation-buttons">
                            <button onClick={saveData}>Yes</button>
                            <button onClick={cancelSave}>No</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="header-top">
                <button className="return-button" onClick={() => navigate(-1)}> &larr; </button>
                <h1>Stock Card</h1>
                {hasChanges && (
                    <span className="unsaved-changes">Unsaved Changes</span>
                )}
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
                                                <th>Action</th>
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
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stockData.transactions?.map((transaction, index) => (
                                                <tr key={transaction.id}>
                                                    <td>
                                                        <input
                                                            type="date"
                                                            value={transaction.date}
                                                            onChange={(e) => handleTransactionChange(index, 'date', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={transaction.reference}
                                                            onChange={(e) => handleTransactionChange(index, 'reference', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={transaction.receiptqty}
                                                            onChange={(e) => handleTransactionChange(index, 'receiptqty', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={transaction.receiptunitcost}
                                                            onChange={(e) => handleTransactionChange(index, 'receiptunitcost', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={transaction.receipttotalcost}
                                                            onChange={(e) => handleTransactionChange(index, 'receipttotalcost', e.target.value)}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={transaction.balanceqty}
                                                            onChange={(e) => handleTransactionChange(index, 'balanceqty', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={transaction.balanceunitcost}
                                                            onChange={(e) => handleTransactionChange(index, 'balanceunitcost', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={transaction.balancetotalcost}
                                                            onChange={(e) => handleTransactionChange(index, 'balancetotalcost', e.target.value)}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={transaction.issueqty}
                                                            onChange={(e) => handleTransactionChange(index, 'issueqty', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={transaction.issueoffice}
                                                            onChange={(e) => handleTransactionChange(index, 'issueoffice', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={transaction.daystoconsume}
                                                            onChange={(e) => handleTransactionChange(index, 'daystoconsume', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="delete-row-button"
                                                            onClick={() => deleteRow(index)}
                                                        >
                                                            Delete
                                                        </button>
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
                <button 
                    className="add-row-button"
                    onClick={addNewRow}
                >
                    Add New Row
                </button>
                <button 
                    className="save-button"
                    onClick={confirmSave}
                    disabled={!hasChanges}
                >
                    Save Changes
                </button>
                <button 
                    className="export-button" 
                    onClick={onExport}
                    disabled={!stockData.transactions.length}
                >
                    Export to Excel
                </button>
            </div>

            <div className="right-image-section">
                <img src={logo} alt="OCD logo" className="vertical-OCD-image" />
            </div>
        </div>
    );
};

export default StockCardsPage;