import React, { useState, useRef, useEffect } from 'react';
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
        transactions: []
    });
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [stockNumberOptions, setStockNumberOptions] = useState([
        { value: '', label: 'Select Stock No.' },
        { value: 'A1', label: 'A1' },
        { value: 'A2', label: 'A2' },
        { value: 'A3', label: 'A3' },
        { value: 'A4', label: 'A4' },
    ]);
    const [customStockNumber, setCustomStockNumber] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [stockNumberToDelete, setStockNumberToDelete] = useState(null);
    const navigate = useNavigate();
    const tableRef = useRef(null);
    const exportRef = useRef(null);
    const stockNumberInputRef = useRef(null);

    const officeOptions = ['OS', 'CBTS', 'RRMS', 'PDPS', 'ORD', 'BAC', 'FMU', 'Admin', 'GSU', 'HRMU', 'DRMD'];

    useEffect(() => {
        if (stockData.stocknumber) {
            fetchStockData(stockData.stocknumber);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setShowExportOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatNumber = (value, isCurrency = false) => {
        if (value === '' || value === null) return '';
        const num = parseFloat(value);
        if (isNaN(num)) return '';
        
        if (isCurrency) {
            return num.toFixed(2);
        }
        return Math.max(0, num).toString();
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
        receiptqty: formatNumber(item.receiptqty),
        receiptunitcost: formatNumber(item.receiptunitcost, true),
        receipttotalcost: item.receipttotalcost || '',
        issueqty: formatNumber(item.issueqty),
        issueoffice: item.issueoffice || '',
        balanceqty: formatNumber(item.balanceqty),
        balanceunitcost: formatNumber(item.balanceunitcost, true),
        balancetotalcost: item.balancetotalcost || '',
        daystoconsume: item.daystoconsume || ''
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
        if (value === 'add-new') {
            setShowCustomInput(true);
            setTimeout(() => {
                stockNumberInputRef.current?.focus();
            }, 0);
            return;
        }

        if (value === 'delete-mode') {
            if (stockData.stocknumber && stockNumberOptions.some(opt => opt.value === stockData.stocknumber && opt.value !== '')) {
                setStockNumberToDelete(stockData.stocknumber);
                setShowDeleteConfirm(true);
            } else {
                setError('Please select a valid stock number to delete');
            }
            return;
        }

        if (hasChanges) {
            if (window.confirm('You have unsaved changes. Do you want to discard them?')) {
                proceedWithStockNumberChange(value);
            }
        } else {
            proceedWithStockNumberChange(value);
        }
    };

    const deleteStockNumber = () => {
        if (stockNumberToDelete) {
            const updatedOptions = stockNumberOptions.filter(opt => opt.value !== stockNumberToDelete);
            setStockNumberOptions(updatedOptions);
            
            if (stockData.stocknumber === stockNumberToDelete) {
                proceedWithStockNumberChange('');
            }
            
            setShowDeleteConfirm(false);
            setStockNumberToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setStockNumberToDelete(null);
    };

    const addCustomStockNumber = () => {
        if (customStockNumber.trim() && !stockNumberOptions.some(opt => opt.value === customStockNumber)) {
            const newOption = {
                value: customStockNumber,
                label: customStockNumber
            };
            setStockNumberOptions([...stockNumberOptions, newOption]);
            setShowCustomInput(false);
            setCustomStockNumber('');
            proceedWithStockNumberChange(newOption.value);
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
        const numericFields = ['receiptqty', 'receiptunitcost', 'issueqty', 'balanceqty', 'balanceunitcost'];
        const currencyFields = ['receiptunitcost', 'balanceunitcost'];
        
        let validatedValue = value;
        
        if (numericFields.includes(field)) {
            validatedValue = value.replace(/[^0-9.]/g, '');
            
            const decimalCount = validatedValue.split('.').length - 1;
            if (decimalCount > 1) {
                validatedValue = validatedValue.substring(0, validatedValue.lastIndexOf('.'));
            }
            
            if (currencyFields.includes(field)) {
                const parts = validatedValue.split('.');
                if (parts.length > 1) {
                    validatedValue = parts[0] + '.' + parts[1].slice(0, 2);
                }
            }
        }
        
        const updatedTransactions = [...stockData.transactions];
        updatedTransactions[index] = {
            ...updatedTransactions[index],
            [field]: validatedValue
        };
        
        // Calculate TotalCostReceipt for all rows
        for (let i = 0; i < updatedTransactions.length; i++) {
            const qty = parseFloat(updatedTransactions[i].receiptqty) || 0;
            const unitCost = parseFloat(updatedTransactions[i].receiptunitcost) || 0;
            updatedTransactions[i].receipttotalcost = (qty * unitCost).toFixed(2);
        }
        
        // Calculate balance for each row
        for (let i = 0; i < updatedTransactions.length; i++) {
            if (i === 0) {
                // First row calculations (unchanged)
                const receiptQty = parseFloat(updatedTransactions[i].receiptqty) || 0;
                const receiptUnitCost = parseFloat(updatedTransactions[i].receiptunitcost) || 0;
                const receiptTotalCost = receiptQty * receiptUnitCost;
                
                updatedTransactions[i].balanceqty = receiptQty.toString();
                updatedTransactions[i].balanceunitcost = receiptUnitCost.toFixed(2);
                updatedTransactions[i].balancetotalcost = receiptTotalCost.toFixed(2);
                updatedTransactions[i].receipttotalcost = receiptTotalCost.toFixed(2);
            } else {
                // Subsequent rows calculations
                const prevBalanceQty = parseFloat(updatedTransactions[i-1].balanceqty) || 0;
                const currentReceiptQty = parseFloat(updatedTransactions[i].receiptqty) || 0;
                const currentReceiptUnitCost = parseFloat(updatedTransactions[i].receiptunitcost) || 0;
                const currentIssueQty = parseFloat(updatedTransactions[i].issueqty) || 0;
                
                // Calculate current receipt total
                const currentReceiptTotalCost = currentReceiptQty * currentReceiptUnitCost;
                updatedTransactions[i].receipttotalcost = currentReceiptTotalCost.toFixed(2);
                
                // Calculate balance quantity
                let balanceQty = prevBalanceQty + currentReceiptQty - currentIssueQty;
                updatedTransactions[i].balanceqty = balanceQty.toString();
                
                // Calculate UnitCostBalance (SPECIAL FORMULA without parentheses)
                let balanceUnitCost = 0;
                if (currentReceiptQty > 0) {
                    if (i === 1) {
                        // Second row: First term + (Second term / 2)
                        const prevReceiptUnitCost = parseFloat(updatedTransactions[i-1].receiptunitcost) || 0;
                        balanceUnitCost = prevReceiptUnitCost + currentReceiptUnitCost / 2;
                    } else {
                        // Third row+: First term + (Second term / 2)
                        const prevBalanceUnitCost = parseFloat(updatedTransactions[i-1].balanceunitcost) || 0;
                        balanceUnitCost = prevBalanceUnitCost + currentReceiptUnitCost / 2;
                    }
                } else {
                    balanceUnitCost = parseFloat(updatedTransactions[i-1].balanceunitcost) || 0;
                }
                updatedTransactions[i].balanceunitcost = balanceUnitCost.toFixed(2);
                
                // Calculate TotalCostBalance (SPECIAL FORMULA without parentheses)
                let balanceTotalCost = 0;
                if (currentReceiptQty > 0) {
                    if (i === 1) {
                        // Second row: First term + (Second term / 2)
                        const prevReceiptTotalCost = parseFloat(updatedTransactions[i-1].receipttotalcost) || 0;
                        balanceTotalCost = prevReceiptTotalCost + currentReceiptTotalCost / 2;
                    } else {
                        // Third row+: First term + (Second term / 2)
                        const prevBalanceTotalCost = parseFloat(updatedTransactions[i-1].balancetotalcost) || 0;
                        balanceTotalCost = prevBalanceTotalCost + currentReceiptTotalCost / 2;
                    }
                } else {
                    balanceTotalCost = parseFloat(updatedTransactions[i-1].balancetotalcost) || 0;
                }
                updatedTransactions[i].balancetotalcost = balanceTotalCost.toFixed(2);
            }
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
            
            for (let i = 0; i < updatedTransactions.length; i++) {
                if (i === 0) {
                    const receiptQty = parseFloat(updatedTransactions[i].receiptqty) || 0;
                    const receiptUnitCost = parseFloat(updatedTransactions[i].receiptunitcost) || 0;
                    
                    updatedTransactions[i].balanceqty = receiptQty.toString();
                    updatedTransactions[i].balanceunitcost = receiptUnitCost.toFixed(2);
                    updatedTransactions[i].balancetotalcost = (receiptQty * receiptUnitCost).toFixed(2);
                } else {
                    const prevBalanceQty = parseFloat(updatedTransactions[i-1].balanceqty) || 0;
                    const prevUnitCost = parseFloat(updatedTransactions[i-1].balanceunitcost) || 0;
                    const currentReceiptQty = parseFloat(updatedTransactions[i].receiptqty) || 0;
                    const currentReceiptUnitCost = parseFloat(updatedTransactions[i].receiptunitcost) || 0;
                    const currentIssueQty = parseFloat(updatedTransactions[i].issueqty) || 0;
                    
                    let balanceQty = prevBalanceQty + currentReceiptQty;
                    
                    if (currentIssueQty > 0) {
                        balanceQty = prevBalanceQty - currentIssueQty;
                        if (balanceQty < 0) balanceQty = 0;
                    }
                    
                    updatedTransactions[i].balanceqty = balanceQty.toString();
                    
                    let balanceUnitCost = prevUnitCost;
                    if (currentReceiptQty > 0 && currentReceiptUnitCost > 0) {
                        if (prevUnitCost > 0) {
                            balanceUnitCost = ((prevUnitCost + currentReceiptUnitCost) / 2);
                        } else {
                            balanceUnitCost = currentReceiptUnitCost;
                        }
                    }
                    updatedTransactions[i].balanceunitcost = balanceUnitCost.toFixed(2);
                    updatedTransactions[i].balancetotalcost = (balanceQty * balanceUnitCost).toFixed(2);
                }
            }
            
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

    const toggleExportOptions = () => {
        setShowExportOptions(!showExportOptions);
    };

    const exportToExcel = () => {
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
                'ISSUE', '', 
                'BALANCE', '', '', 
                'No. of Days to Consume'
            ],
            [
                '', '', 
                'Qty', 'Unit Cost', 'Total Cost', 
                'Qty', 'Office', 
                'Qty', 'Unit Cost', 'Total Cost', 
                ''
            ],
            ...stockData.transactions.map(t => [
                t.date,
                t.reference,
                t.receiptqty,
                t.receiptunitcost,
                t.receipttotalcost,
                t.issueqty,
                t.issueoffice,
                t.balanceqty,
                t.balanceunitcost,
                t.balancetotalcost,
                t.daystoconsume
            ])
        ];

        const ws = XLSX.utils.aoa_to_sheet(exportData);
        ws['!cols'] = [
            { width: 15 }, { width: 15 }, 
            { width: 10 }, { width: 12 }, { width: 12 },
            { width: 10 }, { width: 15 },
            { width: 10 }, { width: 12 }, { width: 12 },
            { width: 20 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "StockCard");
        XLSX.writeFile(wb, `StockCard_${stockData.stocknumber || 'Inventory'}.xlsx`);
        setShowExportOptions(false);
    };

    const exportToPDF = () => {
        setError('PDF export functionality will be implemented soon');
        setShowExportOptions(false);
    };

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

            {showDeleteConfirm && (
                <div className="confirmation-modal">
                    <div className="confirmation-content">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete stock number: {stockNumberToDelete}?</p>
                        <div className="confirmation-buttons">
                            <button onClick={deleteStockNumber}>Yes</button>
                            <button onClick={cancelDelete}>No</button>
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
                                    {showCustomInput ? (
                                        <div className="custom-stocknumber-input">
                                            <input
                                                type="text"
                                                ref={stockNumberInputRef}
                                                value={customStockNumber}
                                                onChange={(e) => setCustomStockNumber(e.target.value)}
                                                placeholder="Enter new stock number"
                                            />
                                            <button onClick={addCustomStockNumber}>Add</button>
                                            <button onClick={() => setShowCustomInput(false)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="stock-number-controls">
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
                                                <option value="add-new">+ Add New Stock Number</option>
                                                {stockData.stocknumber && stockNumberOptions.some(opt => opt.value === stockData.stocknumber) && (
                                                    <option value="delete-mode">- Delete Current Stock Number</option>
                                                )}
                                            </select>
                                            {stockData.stocknumber && stockNumberOptions.some(opt => opt.value === stockData.stocknumber) && (
                                                <button 
                                                    className="delete-stocknumber-button"
                                                    onClick={() => {
                                                        setStockNumberToDelete(stockData.stocknumber);
                                                        setShowDeleteConfirm(true);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    )}
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
                                                <th colSpan="2">ISSUE</th>
                                                <th colSpan="3">BALANCE</th>
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
                                                <th>Office</th>
                                                <th>Qty</th>
                                                <th>Unit Cost</th>
                                                <th>Total Cost</th>
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
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={transaction.receiptqty}
                                                            onChange={(e) => handleTransactionChange(index, 'receiptqty', e.target.value)}
                                                            className="qty-input"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={transaction.receiptunitcost}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                                                const parts = value.split('.');
                                                                if (parts.length > 1) {
                                                                    e.target.value = parts[0] + '.' + parts[1].slice(0, 2);
                                                                }
                                                                handleTransactionChange(index, 'receiptunitcost', e.target.value);
                                                            }}
                                                            onBlur={(e) => {
                                                                if (e.target.value && !isNaN(e.target.value)) {
                                                                    const formatted = parseFloat(e.target.value).toFixed(2);
                                                                    handleTransactionChange(index, 'receiptunitcost', formatted);
                                                                }
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={transaction.receipttotalcost}
                                                            onChange={(e) => handleTransactionChange(index, 'receipttotalcost', e.target.value)}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={transaction.issueqty}
                                                            onChange={(e) => handleTransactionChange(index, 'issueqty', e.target.value)}
                                                            className="qty-input"
                                                        />
                                                    </td>
                                                    <td>
                                                        <select
                                                            value={transaction.issueoffice}
                                                            onChange={(e) => handleTransactionChange(index, 'issueoffice', e.target.value)}
                                                            className="office-select"
                                                        >
                                                            <option value="">Select Office</option>
                                                            {officeOptions.map(office => (
                                                                <option key={office} value={office}>{office}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={transaction.balanceqty}
                                                            onChange={(e) => handleTransactionChange(index, 'balanceqty', e.target.value)}
                                                            className="qty-input"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={transaction.balanceunitcost}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                                                const parts = value.split('.');
                                                                if (parts.length > 1) {
                                                                    e.target.value = parts[0] + '.' + parts[1].slice(0, 2);
                                                                }
                                                                handleTransactionChange(index, 'balanceunitcost', e.target.value);
                                                            }}
                                                            onBlur={(e) => {
                                                                if (e.target.value && !isNaN(e.target.value)) {
                                                                    const formatted = parseFloat(e.target.value).toFixed(2);
                                                                    handleTransactionChange(index, 'balanceunitcost', formatted);
                                                                }
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={transaction.balancetotalcost}
                                                            onChange={(e) => handleTransactionChange(index, 'balancetotalcost', e.target.value)}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
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
                <div className="export-dropdown" ref={exportRef}>
                    <button 
                        className="export-button"
                        onClick={toggleExportOptions}
                        disabled={!stockData.transactions.length}
                    >
                        Export
                    </button>
                    {showExportOptions && (
                        <div className="export-options">
                            <button onClick={exportToExcel}>Export to Excel</button>
                            <button onClick={exportToPDF}>Export to PDF</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="right-image-section">
                <img src={logo} alt="OCD logo" className="vertical-OCD-image" />
            </div>
        </div>
    );
};

export default StockCardsPage;