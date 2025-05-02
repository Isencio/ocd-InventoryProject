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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAddRowOptions, setShowAddRowOptions] = useState(false);
    const [showItemForm, setShowItemForm] = useState(false);
    const [newItemData, setNewItemData] = useState({
        fundcluster: '',
        description: '',
        item: '',
        stocknumber: '',
        unitofmeasurement: ''
    });
    const navigate = useNavigate();
    const tableRef = useRef(null);
    const exportRef = useRef(null);
    const addRowButtonRef = useRef(null);

    const officeOptions = ['OS', 'CBTS', 'RRMS', 'PDPS', 'ORD', 'BAC', 'FMU', 'Admin', 'GSU', 'HRMU', 'DRMD'];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setShowExportOptions(false);
            }
            if (addRowButtonRef.current && !addRowButtonRef.current.contains(event.target)) {
                setShowAddRowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatNumber = (value, isCurrency = false) => {
        if (value === '' || value === null || value === undefined) return '';
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
            
            const response = await fetch(`http://10.16.4.136/project/stockcards.php?stocknumber=${stockNumber}`);
            
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
        receiptqty: item.receiptqty === '' ? '' : formatNumber(item.receiptqty),
        receiptunitcost: item.receiptunitcost === '' ? '' : formatNumber(item.receiptunitcost, true),
        receipttotalcost: item.receipttotalcost || '',
        issueqty: item.issueqty === '' ? '' : formatNumber(item.issueqty),
        issueoffice: item.issueoffice || '',
        balanceqty: item.balanceqty === '' ? '' : formatNumber(item.balanceqty),
        balanceunitcost: item.balanceunitcost === '' ? '' : formatNumber(item.balanceunitcost, true),
        balancetotalcost: item.balancetotalcost || '',
        daystoconsume: item.daystoconsume || '',
        isRISRow: item.isRISRow || false
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
        daystoconsume: '',
        isRISRow: false
    });

    const createEmptyDRRow = () => ({
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
        daystoconsume: '',
        isRISRow: false
    });

    const createEmptyRISRow = () => ({
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
        daystoconsume: '',
        isRISRow: true
    });

    const handleLoadData = () => {
        if (!stockData.stocknumber) {
            setError('Please enter a stock number');
            return;
        }
        
        if (hasChanges) {
            if (window.confirm('You have unsaved changes. Do you want to discard them?')) {
                fetchStockData(stockData.stocknumber);
            }
        } else {
            fetchStockData(stockData.stocknumber);
        }
    };

    const handleDeleteStock = () => {
        if (!stockData.stocknumber) {
            setError('Please enter a stock number to delete');
            return;
        }
        
        setShowDeleteConfirm(true);
    };

    const deleteStockNumber = () => {
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
        setShowDeleteConfirm(false);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const handleHeaderChange = (field, value) => {
        setStockData(prev => ({
            ...prev,
            [field]: value
        }));
        checkForChanges({ ...stockData, [field]: value });
    };

    const handleNewItemChange = (field, value) => {
        setNewItemData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const saveNewItem = () => {
        if (!newItemData.stocknumber.trim()) {
            setError('Stock Number is required');
            return;
        }

        const updatedData = {
            ...newItemData,
            transactions: [createEmptyTransaction()]
        };
        
        setStockData(updatedData);
        setOriginalData(JSON.parse(JSON.stringify(updatedData)));
        setShowItemForm(false);
        setNewItemData({
            fundcluster: '',
            description: '',
            item: '',
            stocknumber: '',
            unitofmeasurement: ''
        });
        setHasChanges(true);
    };

    const handleNonCalculatingFieldChange = (index, field, value) => {
        const updatedTransactions = [...stockData.transactions];
        updatedTransactions[index] = {
            ...updatedTransactions[index],
            [field]: value
        };
        
        const updatedData = {
            ...stockData,
            transactions: updatedTransactions
        };
        
        setStockData(updatedData);
        checkForChanges(updatedData);
    };

    const handleNumericFieldChange = (index, field, value) => {
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
        
        // Recalculate all rows starting from the first row
        for (let i = 0; i < updatedTransactions.length; i++) {
            if (i === 0) {
                // First row calculations
                if (!updatedTransactions[i].isRISRow) {
                    const receiptQty = updatedTransactions[i].receiptqty === '' ? '' : parseFloat(updatedTransactions[i].receiptqty);
                    const receiptUnitCost = updatedTransactions[i].receiptunitcost === '' ? '' : parseFloat(updatedTransactions[i].receiptunitcost);
                    
                    if (receiptQty !== '' && receiptUnitCost !== '') {
                        const receiptTotalCost = receiptQty * receiptUnitCost;
                        updatedTransactions[i].receipttotalcost = receiptTotalCost.toFixed(2);
                        updatedTransactions[i].balanceqty = receiptQty.toString();
                        updatedTransactions[i].balanceunitcost = receiptUnitCost.toFixed(2);
                        updatedTransactions[i].balancetotalcost = receiptTotalCost.toFixed(2);
                    } else {
                        updatedTransactions[i].receipttotalcost = '';
                        updatedTransactions[i].balanceqty = '';
                        updatedTransactions[i].balanceunitcost = '';
                        updatedTransactions[i].balancetotalcost = '';
                    }
                } else {
                    // For first row being RIS, clear receipt fields
                    updatedTransactions[i].receiptqty = '';
                    updatedTransactions[i].receiptunitcost = '';
                    updatedTransactions[i].receipttotalcost = '';
                    updatedTransactions[i].balanceunitcost = '';
                    updatedTransactions[i].balancetotalcost = '';
                }
            } else {
                const prevRow = updatedTransactions[i-1];
                const currentRow = updatedTransactions[i];
                
                if (currentRow.isRISRow) {
                    // RIS row calculations
                    const prevBalanceQty = prevRow.balanceqty === '' ? '' : parseFloat(prevRow.balanceqty);
                    const currentIssueQty = currentRow.issueqty === '' ? '' : parseFloat(currentRow.issueqty);
                    
                    if (prevBalanceQty !== '' && currentIssueQty !== '') {
                        currentRow.balanceqty = Math.max(0, prevBalanceQty - currentIssueQty).toString();
                        currentRow.balanceunitcost = prevRow.balanceunitcost;
                        if (currentRow.balanceqty !== '' && currentRow.balanceunitcost !== '') {
                            currentRow.balancetotalcost = (parseFloat(currentRow.balanceqty) * 
                                parseFloat(currentRow.balanceunitcost)).toFixed(2);
                        } else {
                            currentRow.balancetotalcost = '';
                        }
                    } else {
                        currentRow.balanceqty = '';
                        currentRow.balancetotalcost = '';
                    }
                    
                    // Clear receipt fields for RIS rows
                    currentRow.receiptqty = '';
                    currentRow.receiptunitcost = '';
                    currentRow.receipttotalcost = '';
                } else {
                    // DR row calculations
                    const prevBalanceQty = prevRow.balanceqty === '' ? '' : parseFloat(prevRow.balanceqty);
                    const currentReceiptQty = currentRow.receiptqty === '' ? '' : parseFloat(currentRow.receiptqty);
                    const currentReceiptUnitCost = currentRow.receiptunitcost === '' ? '' : parseFloat(currentRow.receiptunitcost);
                    const currentIssueQty = currentRow.issueqty === '' ? '' : parseFloat(currentRow.issueqty);
                    
                    // Calculate receipt total cost
                    if (currentReceiptQty !== '' && currentReceiptUnitCost !== '') {
                        currentRow.receipttotalcost = (currentReceiptQty * currentReceiptUnitCost).toFixed(2);
                    } else {
                        currentRow.receipttotalcost = '';
                    }
                    
                    // Calculate new balance quantity
                    let balanceQty = '';
                    if (prevBalanceQty !== '') {
                        if (currentReceiptQty !== '') {
                            balanceQty = prevBalanceQty + currentReceiptQty;
                        } else {
                            balanceQty = prevBalanceQty;
                        }
                        
                        if (currentIssueQty !== '') {
                            balanceQty = Math.max(0, balanceQty - currentIssueQty);
                        }
                        currentRow.balanceqty = balanceQty.toString();
                    } else {
                        currentRow.balanceqty = '';
                    }
                    
                    // Calculate unit cost and total cost using the new formula
                    if (currentReceiptQty !== '' && currentReceiptQty > 0 && currentReceiptUnitCost !== '') {
                        // Find the last non-RIS row to get proper unit cost
                        let lastNonRISIndex = i - 1;
                        while (lastNonRISIndex >= 0 && updatedTransactions[lastNonRISIndex].isRISRow) {
                            lastNonRISIndex--;
                        }
                        
                        if (lastNonRISIndex >= 0 && updatedTransactions[lastNonRISIndex].balancetotalcost !== '') {
                            const prevTotalCost = parseFloat(updatedTransactions[lastNonRISIndex].balancetotalcost);
                            const currentTotalCost = parseFloat(currentRow.receipttotalcost);
                            
                            // New formula: average of previous and current receipt total costs
                            currentRow.balancetotalcost = (prevTotalCost + currentTotalCost / 2).toFixed(2);
                            
                            // Calculate unit cost based on the new total cost and quantity
                            if (currentRow.balanceqty !== '' && parseFloat(currentRow.balanceqty) > 0) {
                                currentRow.balanceunitcost = (parseFloat(currentRow.balancetotalcost) / parseFloat(currentRow.balanceqty)).toFixed(2);
                            } else {
                                currentRow.balanceunitcost = '0.00';
                            }
                        } else {
                            // If no previous total cost, use current receipt total cost
                            currentRow.balancetotalcost = currentRow.receipttotalcost;
                            currentRow.balanceunitcost = currentReceiptUnitCost.toFixed(2);
                        }
                    } else if (prevRow.balancetotalcost !== '') {
                        // Carry forward previous values if no new receipt
                        currentRow.balancetotalcost = prevRow.balancetotalcost;
                        currentRow.balanceunitcost = prevRow.balanceunitcost;
                    } else {
                        currentRow.balancetotalcost = '';
                        currentRow.balanceunitcost = '';
                    }
                }
            }
        }
        
        const updatedData = {
            ...stockData,
            transactions: updatedTransactions
        };
        
        setStockData(updatedData);
        checkForChanges(updatedData);
    };

    const handleTransactionChange = (index, field, value) => {
        // Fields that don't require recalculation
        const nonCalculatingFields = ['date', 'reference', 'issueoffice', 'daystoconsume'];
        
        if (nonCalculatingFields.includes(field)) {
            handleNonCalculatingFieldChange(index, field, value);
            return;
        }
        
        // Numeric fields that require calculation
        handleNumericFieldChange(index, field, value);
    };

    const checkForChanges = (currentData) => {
        const changed = JSON.stringify(currentData) !== JSON.stringify(originalData);
        setHasChanges(changed);
    };

    const toggleAddRowOptions = () => {
        setShowAddRowOptions(!showAddRowOptions);
    };

    const addDRRow = () => {
        const newRow = createEmptyDRRow();
        const updatedData = {
            ...stockData,
            transactions: [...stockData.transactions, newRow]
        };
        setStockData(updatedData);
        checkForChanges(updatedData);
        setShowAddRowOptions(false);
        
        setTimeout(() => {
            const rows = tableRef.current?.querySelectorAll('tbody tr');
            if (rows && rows.length > 0) {
                const lastRow = rows[rows.length - 1];
                const firstInput = lastRow.querySelector('input');
                firstInput?.focus();
            }
        }, 50);
    };

    const addRISRow = () => {
        const newRow = createEmptyRISRow();
        const updatedData = {
            ...stockData,
            transactions: [...stockData.transactions, newRow]
        };
        setStockData(updatedData);
        checkForChanges(updatedData);
        setShowAddRowOptions(false);
        
        setTimeout(() => {
            const rows = tableRef.current?.querySelectorAll('tbody tr');
            if (rows && rows.length > 0) {
                const lastRow = rows[rows.length - 1];
                const issueQtyInput = lastRow.querySelectorAll('input')[5];
                issueQtyInput?.focus();
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
            
            const dataToSend = {
                ...stockData,
                transactions: stockData.transactions.map(t => ({
                    ...t,
                    receiptqty: t.receiptqty === '' ? '' : parseFloat(t.receiptqty),
                    receiptunitcost: t.receiptunitcost === '' ? '' : parseFloat(t.receiptunitcost),
                    receipttotalcost: t.receipttotalcost === '' ? '' : parseFloat(t.receipttotalcost),
                    issueqty: t.issueqty === '' ? '' : parseFloat(t.issueqty),
                    balanceqty: t.balanceqty === '' ? '' : parseFloat(t.balanceqty),
                    balanceunitcost: t.balanceunitcost === '' ? '' : parseFloat(t.balanceunitcost),
                    balancetotalcost: t.balancetotalcost === '' ? '' : parseFloat(t.balancetotalcost),
                    daystoconsume: t.daystoconsume === '' ? '' : parseInt(t.daystoconsume)
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
                        <p>Are you sure you want to delete stock number: {stockData.stocknumber}?</p>
                        <div className="confirmation-buttons">
                            <button onClick={deleteStockNumber}>Yes</button>
                            <button onClick={cancelDelete}>No</button>
                        </div>
                    </div>
                </div>
            )}

            {showItemForm && (
                <div className="item-form-modal">
                    <div className="item-form-content">
                        <h3>Add New Item</h3>
                        
                        <div className="form-group">
                            <label>Fund Cluster:</label>
                            <input
                                type="text"
                                value={newItemData.fundcluster}
                                onChange={(e) => handleNewItemChange('fundcluster', e.target.value)}
                                className="custom-stocknumber-input"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Description:</label>
                            <input
                                type="text"
                                value={newItemData.description}
                                onChange={(e) => handleNewItemChange('description', e.target.value)}
                                className="custom-stocknumber-input"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Item:</label>
                            <input
                                type="text"
                                value={newItemData.item}
                                onChange={(e) => handleNewItemChange('item', e.target.value)}
                                className="custom-stocknumber-input"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Stock No.:</label>
                            <input
                                type="text"
                                value={newItemData.stocknumber}
                                onChange={(e) => handleNewItemChange('stocknumber', e.target.value)}
                                className="custom-stocknumber-input"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Unit of Measurement:</label>
                            <input
                                type="text"
                                value={newItemData.unitofmeasurement}
                                onChange={(e) => handleNewItemChange('unitofmeasurement', e.target.value)}
                                className="custom-stocknumber-input"
                            />
                        </div>
                        
                        <div className="form-buttons">
                            <button onClick={saveNewItem}>Save</button>
                            <button onClick={() => setShowItemForm(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="header-top">
                <button className="return-button" onClick={() => navigate(-1)}> &larr; </button>
                <h1>Stock Card</h1>
            </div>

            <div className={`save-notification ${hasChanges ? 'visible' : ''}`}>
                Pending Changes
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
                                    <div className="stock-number-controls">
                                        <input
                                            type="text"
                                            value={stockData.fundcluster}
                                            onChange={(e) => handleHeaderChange('fundcluster', e.target.value)}
                                            className="custom-stocknumber-input"
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th className="Item-left-align">Item:</th>
                                <td className="input-Item-cell">
                                    <div className="stock-number-controls">
                                        <input
                                            type="text"
                                            value={stockData.item}
                                            onChange={(e) => handleHeaderChange('item', e.target.value)}
                                            className="custom-stocknumber-input"
                                        />
                                    </div>
                                </td>
                                <th className="Item-right-align">Stock No. :</th>
                                <td className="input-stockno-cell">
                                    <div className="stock-number-controls">
                                        <input
                                            type="text"
                                            value={stockData.stocknumber}
                                            onChange={(e) => handleHeaderChange('stocknumber', e.target.value)}
                                            placeholder="Enter stock number"
                                            className="custom-stocknumber-input"
                                        />
                                        <button 
                                            className="fetch-button"
                                            onClick={handleLoadData}
                                        >
                                            Load Data
                                        </button>
                                        <button 
                                            className="delete-stocknumber-button"
                                            onClick={handleDeleteStock}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th className="Item-left-align">Description:</th>
                                <td>
                                    <div className="stock-number-controls">
                                        <input
                                            type="text"
                                            value={stockData.description}
                                            onChange={(e) => handleHeaderChange('description', e.target.value)}
                                            className="custom-stocknumber-input"
                                        />
                                    </div>
                                </td>
                                <th className="Item-right-align">Unit of Measurement:</th>
                                <td>
                                    <div className="stock-number-controls">
                                        <input
                                            type="text"
                                            value={stockData.unitofmeasurement}
                                            onChange={(e) => handleHeaderChange('unitofmeasurement', e.target.value)}
                                            className="custom-stocknumber-input"
                                        />
                                    </div>
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
                                                            disabled={transaction.isRISRow}
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
                                                            disabled={transaction.isRISRow}
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
                                                            disabled={transaction.isRISRow}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={transaction.receipttotalcost}
                                                            onChange={(e) => handleTransactionChange(index, 'receipttotalcost', e.target.value)}
                                                            readOnly
                                                            disabled={transaction.isRISRow}
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
                                                            disabled={transaction.isRISRow}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={transaction.balancetotalcost}
                                                            onChange={(e) => handleTransactionChange(index, 'balancetotalcost', e.target.value)}
                                                            readOnly
                                                            disabled={transaction.isRISRow}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={transaction.daystoconsume}
                                                            onChange={(e) => handleTransactionChange(index, 'daystoconsume', e.target.value)}
                                                            disabled={transaction.isRISRow}
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
                    className="add-item-button"
                    onClick={() => setShowItemForm(true)}
                >
                    Add New Item
                </button>
                
                <div className="add-row-dropdown" ref={addRowButtonRef}>
                    <button 
                        className="add-row-button"
                        onClick={toggleAddRowOptions}
                    >
                        Add New Row
                    </button>
                    {showAddRowOptions && (
                        <div className="add-row-options">
                            <button onClick={addDRRow}>Add DR Row</button>
                            <button onClick={addRISRow}>Add RIS Row</button>
                        </div>
                    )}
                </div>
                
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
                <button 
                    className="save-button"
                    onClick={confirmSave}
                    disabled={!hasChanges}
                >
                    Save Changes
                </button>
            </div>

            <div className="right-image-section">
                <img src={logo} alt="OCD logo" className="vertical-OCD-image" />
            </div>
        </div>
    );
};

export default StockCardsPage;