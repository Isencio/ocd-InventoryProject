import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import './StockCardsPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const StockCardsPage = () => {
    // State declarations
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

    // Add useEffect for handling clicks outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (addRowButtonRef.current && !addRowButtonRef.current.contains(event.target)) {
                setShowAddRowOptions(false);
            }
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setShowExportOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Helper functions
    const formatNumber = (value, isCurrency = false) => {
        if (value === '' || value === null) return '';
        const num = parseFloat(value);
        if (isNaN(num)) return '';
        return isCurrency ? num.toFixed(2) : Math.max(0, num).toString();
    };

    // Transaction processing
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
        daystoconsume: item.daystoconsume || '',
        isRISRow: item.isRISRow || false
    });

    // Empty transaction templates
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

    const createEmptyDRRow = () => createEmptyTransaction();
    const createEmptyRISRow = () => ({ ...createEmptyTransaction(), isRISRow: true });

    // Data fetching
    const fetchStockData = async (stockNumber) => {
        try {
            setLoading(true);
            setError(null);

            // Changed to use relative URL
            const apiUrl = `https://10.16.4.241/project/stockcards.php?stocknumber=${stockNumber}`;
            console.log('Fetching data from:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include' // Include cookies if needed
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error response:', errorText);
                throw new Error(`Server error: ${response.status} ${response.statusText}\n${errorText}`);
            }

            const contentType = response.headers.get('content-type');
            console.log('Content-Type:', contentType);
            
            if (!contentType || !contentType.includes('application/json')) {
                const responseData = await response.text();
                console.error('Invalid response format:', responseData);
                throw new Error('Invalid response format - expected JSON');
            }

            const data = await response.json();
            console.log('Received data:', data);
            
            if (!data) {
                console.error('No data received from server');
                throw new Error('No data received from server');
            }
            
            if (data.error) {
                console.error('Server returned error:', data.error);
                throw new Error(data.error);
            }

            if (data.length === 0) {
                console.log('No records found for stock number:', stockNumber);
                // Initialize with empty data but keep the stock number
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
                setHasChanges(false);
                return;
            }

            const responseData = Array.isArray(data) ? data : [data];
            const processedData = {
                fundcluster: responseData[0]?.fundcluster || '',
                stocknumber: responseData[0]?.stocknumber || stockNumber,
                item: responseData[0]?.item || '',
                description: responseData[0]?.description || '',
                unitofmeasurement: responseData[0]?.unitofmeasurement || '',
                transactions: responseData.length > 0 ? responseData.map(processTransaction) : [createEmptyTransaction()]
            };

            console.log('Processed data:', processedData);
            setStockData(processedData);
            setOriginalData(JSON.parse(JSON.stringify(processedData)));
            setHasChanges(false);
            
        } catch (error) {
            console.error('Fetch error:', error);
            setError(`Failed to load data: ${error.message}`);
            
            // Fallback to empty data
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

    // Event handlers
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

    const cancelDelete = () => setShowDeleteConfirm(false);

    const handleHeaderChange = (field, value) => {
        setStockData(prev => ({ ...prev, [field]: value }));
        checkForChanges({ ...stockData, [field]: value });
    };

    const handleNewItemChange = (field, value) => {
        setNewItemData(prev => ({ ...prev, [field]: value }));
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

    const handleTransactionChange = (index, field, value) => {
        // If only changing the date, just update the date and return
        if (field === 'date') {
            const transactionsForDate = [...stockData.transactions];
            transactionsForDate[index] = {
                ...transactionsForDate[index],
                date: value
            };
            const dataForDate = {
                ...stockData,
                transactions: transactionsForDate
            };
            setStockData(dataForDate);
            checkForChanges(dataForDate);
            return;
        }
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
        
        const transactionsForChange = [...stockData.transactions];
        transactionsForChange[index] = {
            ...transactionsForChange[index],
            [field]: validatedValue
        };
        
        // Transaction calculations
        if (transactionsForChange[index].isRISRow) {
            if (field === 'issueqty') {
                const prevBalanceQty = index > 0 ? parseFloat(transactionsForChange[index-1].balanceqty) || 0 : 0;
                const currentIssueQty = parseFloat(validatedValue) || 0;
                transactionsForChange[index].balanceqty = Math.max(0, prevBalanceQty - currentIssueQty).toString();
                
                transactionsForChange[index].receiptqty = '';
                transactionsForChange[index].receiptunitcost = '';
                transactionsForChange[index].receipttotalcost = '';
                transactionsForChange[index].balanceunitcost = '';
                transactionsForChange[index].balancetotalcost = '';
            }
        } else {
            const qty = parseFloat(transactionsForChange[index].receiptqty) || 0;
            const unitCost = parseFloat(transactionsForChange[index].receiptunitcost) || 0;
            transactionsForChange[index].receipttotalcost = (qty * unitCost).toFixed(2);
            
            if (index === 0) {
                const receiptQty = parseFloat(transactionsForChange[index].receiptqty) || 0;
                const receiptUnitCost = parseFloat(transactionsForChange[index].receiptunitcost) || 0;
                const receiptTotalCost = receiptQty * receiptUnitCost;
                
                transactionsForChange[index].balanceqty = receiptQty.toString();
                transactionsForChange[index].balanceunitcost = receiptUnitCost.toFixed(2);
                transactionsForChange[index].balancetotalcost = receiptTotalCost.toFixed(2);
                transactionsForChange[index].receipttotalcost = receiptTotalCost.toFixed(2);
            } else {
                const prevBalanceQty = parseFloat(transactionsForChange[index-1].balanceqty) || 0;
                const currentReceiptQty = parseFloat(transactionsForChange[index].receiptqty) || 0;
                const currentReceiptUnitCost = parseFloat(transactionsForChange[index].receiptunitcost) || 0;
                const currentIssueQty = parseFloat(transactionsForChange[index].issueqty) || 0;
                
                const currentReceiptTotalCost = currentReceiptQty * currentReceiptUnitCost;
                transactionsForChange[index].receipttotalcost = currentReceiptTotalCost.toFixed(2);
                
                let balanceQty = prevBalanceQty + currentReceiptQty - currentIssueQty;
                transactionsForChange[index].balanceqty = Math.max(0, balanceQty).toString();
                
                let lastNonRISIndex = index - 1;
                while (lastNonRISIndex >= 0 && transactionsForChange[lastNonRISIndex].isRISRow) {
                    lastNonRISIndex--;
                }
                
                let balanceUnitCost = 0;
                let balanceTotalCost = 0;
                
                if (currentReceiptQty > 0) {
                    if (lastNonRISIndex >= 0) {
                        const lastUnitCost = parseFloat(transactionsForChange[lastNonRISIndex].balanceunitcost) || 0;
                        balanceUnitCost = lastUnitCost + currentReceiptUnitCost / 2;
                        
                        const lastTotalCost = parseFloat(transactionsForChange[lastNonRISIndex].balancetotalcost) || 0;
                        balanceTotalCost = lastTotalCost + currentReceiptTotalCost / 2;
                    } else {
                        balanceUnitCost = currentReceiptUnitCost;
                        balanceTotalCost = currentReceiptTotalCost;
                    }
                } else {
                    balanceUnitCost = parseFloat(transactionsForChange[index-1].balanceunitcost) || 0;
                    balanceTotalCost = parseFloat(transactionsForChange[index-1].balancetotalcost) || 0;
                }
                
                transactionsForChange[index].balanceunitcost = balanceUnitCost.toFixed(2);
                transactionsForChange[index].balancetotalcost = balanceTotalCost.toFixed(2);
            }
        }
        
        // Update subsequent rows
        for (let i = index + 1; i < transactionsForChange.length; i++) {
            const prevBalanceQty = parseFloat(transactionsForChange[i-1].balanceqty) || 0;
            const currentIssueQty = parseFloat(transactionsForChange[i].issueqty) || 0;
            
            if (transactionsForChange[i].isRISRow) {
                transactionsForChange[i].balanceqty = Math.max(0, prevBalanceQty - currentIssueQty).toString();
                transactionsForChange[i].balanceunitcost = transactionsForChange[i-1].balanceunitcost;
                transactionsForChange[i].balancetotalcost = (parseFloat(transactionsForChange[i].balanceqty) * 
                    parseFloat(transactionsForChange[i].balanceunitcost)).toFixed(2);
            } else {
                const currentReceiptQty = parseFloat(transactionsForChange[i].receiptqty) || 0;
                const currentReceiptUnitCost = parseFloat(transactionsForChange[i].receiptunitcost) || 0;
                const currentReceiptTotalCost = currentReceiptQty * currentReceiptUnitCost;
                
                transactionsForChange[i].balanceqty = Math.max(0, prevBalanceQty + currentReceiptQty - currentIssueQty).toString();
                
                let lastNonRISIndex = i - 1;
                while (lastNonRISIndex >= 0 && transactionsForChange[lastNonRISIndex].isRISRow) {
                    lastNonRISIndex--;
                }
                
                if (currentReceiptQty > 0) {
                    if (lastNonRISIndex >= 0) {
                        const lastUnitCost = parseFloat(transactionsForChange[lastNonRISIndex].balanceunitcost) || 0;
                        transactionsForChange[i].balanceunitcost = (lastUnitCost + currentReceiptUnitCost / 2).toFixed(2);
                        
                        const lastTotalCost = parseFloat(transactionsForChange[lastNonRISIndex].balancetotalcost) || 0;
                        transactionsForChange[i].balancetotalcost = (lastTotalCost + currentReceiptTotalCost / 2).toFixed(2);
                    } else {
                        transactionsForChange[i].balanceunitcost = currentReceiptUnitCost.toFixed(2);
                        transactionsForChange[i].balancetotalcost = currentReceiptTotalCost.toFixed(2);
                    }
                } else {
                    transactionsForChange[i].balanceunitcost = transactionsForChange[i-1].balanceunitcost;
                    transactionsForChange[i].balancetotalcost = transactionsForChange[i-1].balancetotalcost;
                }
            }
        }
        
        const dataAfterChange = {
            ...stockData,
            transactions: transactionsForChange
        };
        
        setStockData(dataAfterChange);
        checkForChanges(dataAfterChange);
    };

    const checkForChanges = (currentData) => {
        const changed = JSON.stringify(currentData) !== JSON.stringify(originalData);
        setHasChanges(changed);
    };

    const toggleAddRowOptions = () => setShowAddRowOptions(!showAddRowOptions);

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
            const transactionsAfterDelete = [...stockData.transactions];
            transactionsAfterDelete.splice(index, 1);

            // Only recalculate balances if the deleted row is not the last row
            if (index < transactionsAfterDelete.length) {
                const startIdx = index;
                for (let i = startIdx; i < transactionsAfterDelete.length; i++) {
                    if (i === 0) {
                        const receiptQty = parseFloat(transactionsAfterDelete[i].receiptqty) || 0;
                        const receiptUnitCost = parseFloat(transactionsAfterDelete[i].receiptunitcost) || 0;
                        transactionsAfterDelete[i].balanceqty = receiptQty.toString();
                        transactionsAfterDelete[i].balanceunitcost = receiptUnitCost.toFixed(2);
                        transactionsAfterDelete[i].balancetotalcost = (receiptQty * receiptUnitCost).toFixed(2);
                    } else {
                        const prevBalanceQty = parseFloat(transactionsAfterDelete[i-1].balanceqty) || 0;
                        const prevUnitCost = parseFloat(transactionsAfterDelete[i-1].balanceunitcost) || 0;
                        const currentReceiptQty = parseFloat(transactionsAfterDelete[i].receiptqty) || 0;
                        const currentReceiptUnitCost = parseFloat(transactionsAfterDelete[i].receiptunitcost) || 0;
                        const currentIssueQty = parseFloat(transactionsAfterDelete[i].issueqty) || 0;

                        let balanceQty = prevBalanceQty + currentReceiptQty;
                        if (currentIssueQty > 0) {
                            balanceQty = prevBalanceQty - currentIssueQty;
                            if (balanceQty < 0) balanceQty = 0;
                        }
                        transactionsAfterDelete[i].balanceqty = balanceQty.toString();

                        let balanceUnitCost = prevUnitCost;
                        if (currentReceiptQty > 0 && currentReceiptUnitCost > 0 && !transactionsAfterDelete[i].isRISRow) {
                            if (prevUnitCost > 0) {
                                balanceUnitCost = (prevUnitCost + currentReceiptUnitCost / 2);
                            } else {
                                balanceUnitCost = currentReceiptUnitCost;
                            }
                        }
                        transactionsAfterDelete[i].balanceunitcost = balanceUnitCost.toFixed(2);
                        transactionsAfterDelete[i].balancetotalcost = (balanceQty * balanceUnitCost).toFixed(2);
                    }
                }
            }

            const dataAfterDelete = {
                ...stockData,
                transactions: transactionsAfterDelete
            };

            setStockData(dataAfterDelete);
            checkForChanges(dataAfterDelete);
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

    const confirmSave = () => setShowSaveConfirm(true);
    const cancelSave = () => setShowSaveConfirm(false);
    const toggleExportOptions = () => setShowExportOptions(!showExportOptions);

    const exportToExcel = async () => {
        try {
            setLoading(true);
            
            if (!stockData.transactions.length) {
                setError('No data to export');
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('STOCK CARD');

            // Set default font for the entire worksheet
            worksheet.properties.defaultColWidth = 15;
            
            // Add header information
            const addHeaderRow = (text) => {
                const row = worksheet.addRow([text]);
                row.font = { name: 'Arial', size: 12, bold: true };
                row.alignment = { horizontal: 'center' };
                worksheet.mergeCells(`A${row.number}:H${row.number}`);
            };

            addHeaderRow('Republic of the Philippines');
            addHeaderRow('Department of National Defense');
            addHeaderRow('OFFICE OF CIVIL DEFENSE');
            addHeaderRow('NATIONAL CAPITAL REGION');
            
            const addressRow = worksheet.addRow(['NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY']);
            addressRow.font = { name: 'Arial', size: 10 };
            worksheet.mergeCells(`A${addressRow.number}:H${addressRow.number}`);
            
            const contactRow = worksheet.addRow(['Telephone Number: (02) 421-1918; OPCEN Mobile Number: 0917-8276325']);
            contactRow.font = { name: 'Arial', size: 10 };
            worksheet.mergeCells(`A${contactRow.number}:H${contactRow.number}`);
            
            const emailRow = worksheet.addRow(['E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com']);
            emailRow.font = { name: 'Arial', size: 10 };
            worksheet.mergeCells(`A${emailRow.number}:H${emailRow.number}`);
            
            // Add empty row
            worksheet.addRow([]);
            
            // Add title
            const titleRow = worksheet.addRow(['STOCK CARD AS OF JANUARY 2025']);
            titleRow.font = { name: 'Arial', size: 12, bold: true };
            titleRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells(`A${titleRow.number}:H${titleRow.number}`);
            
            // Add empty row
            worksheet.addRow([]);
            
            // Add fund cluster
            const fundClusterRow = worksheet.addRow(['Fund Cluster:', stockData.fundcluster]);
            fundClusterRow.getCell(1).font = { name: 'Arial', size: 10, bold: true };
            fundClusterRow.getCell(2).font = { name: 'Arial', size: 10 };
            
            // Add empty row
            worksheet.addRow([]);
            
            // Add item information
            const itemRow = worksheet.addRow(['Item:', stockData.item, '', '', 'Stock No. :', '', stockData.stocknumber]);
            itemRow.getCell(1).font = { name: 'Arial', size: 10, bold: true };
            itemRow.getCell(2).font = { name: 'Arial', size: 10 };
            itemRow.getCell(5).font = { name: 'Arial', size: 10, bold: true };
            itemRow.getCell(7).font = { name: 'Arial', size: 10 };
            
            const descRow = worksheet.addRow(['Description:', stockData.description]);
            descRow.getCell(1).font = { name: 'Arial', size: 10, bold: true };
            descRow.getCell(2).font = { name: 'Arial', size: 10 };
            
            const unitRow = worksheet.addRow(['Unit of Measurement:', stockData.unitofmeasurement, '', '', 'Re-order Point :', '']);
            unitRow.getCell(1).font = { name: 'Arial', size: 10, bold: true };
            unitRow.getCell(2).font = { name: 'Arial', size: 10 };
            unitRow.getCell(5).font = { name: 'Arial', size: 10, bold: true };
            
            // Add empty row
            worksheet.addRow([]);
            
            // Add table headers
            const mainHeaderRow = worksheet.addRow([
                'Date', 'Reference', '', 'RECEIPT', '', '', 'ISSUE', '', 'BALANCE', '', '', 'No. of Days to Consume'
            ]);
            mainHeaderRow.font = { name: 'Arial', size: 10, bold: true };
            mainHeaderRow.alignment = { horizontal: 'center' };
            
            // Merge header cells
            worksheet.mergeCells(`D${mainHeaderRow.number}:F${mainHeaderRow.number}`);
            worksheet.mergeCells(`G${mainHeaderRow.number}:H${mainHeaderRow.number}`);
            worksheet.mergeCells(`I${mainHeaderRow.number}:K${mainHeaderRow.number}`);
            worksheet.mergeCells(`L${mainHeaderRow.number}:M${mainHeaderRow.number}`);
            
            const subHeaderRow = worksheet.addRow([
                '', '', 'Qty.', 'Unit Cost', 'Total Cost', 'Qty.', 'Office', 'Qty.', 'Unit Cost', 'Total Cost', ''
            ]);
            subHeaderRow.font = { name: 'Arial', size: 10, bold: true };
            subHeaderRow.alignment = { horizontal: 'center' };
            
            // Add transaction data
            stockData.transactions.forEach(transaction => {
                const row = worksheet.addRow([
                    transaction.date,
                    transaction.reference,
                    transaction.receiptqty,
                    transaction.receiptunitcost,
                    transaction.receipttotalcost,
                    transaction.issueqty,
                    transaction.issueoffice,
                    transaction.balanceqty,
                    transaction.balanceunitcost,
                    transaction.balancetotalcost,
                    '',
                    transaction.daystoconsume
                ]);
                
                // Format numbers
                [3, 4, 5, 6, 8, 9].forEach(col => {
                    if (row.getCell(col).value) {
                        row.getCell(col).numFmt = '#,##0.00';
                    }
                });
                
                // Set font for all cells
                row.eachCell(cell => {
                    cell.font = { name: 'Arial', size: 10 };
                });
            });
            
            // Set column widths
            worksheet.columns = [
                { width: 12 }, // Date
                { width: 20 }, // Reference
                { width: 8 },  // Qty
                { width: 12 }, // Unit Cost
                { width: 12 }, // Total Cost
                { width: 8 },  // Issue Qty
                { width: 12 }, // Office
                { width: 8 },  // Balance Qty
                { width: 12 }, // Balance Unit Cost
                { width: 12 }, // Balance Total Cost
                { width: 8 },  // Empty
                { width: 20 }  // Days to Consume
            ];
            
            // Save file
            await workbook.xlsx.writeFile(`STOCK_CARD_${stockData.stocknumber || 'NEW'}.xlsx`);
            setShowExportOptions(false);
        } catch (err) {
            console.error('Error exporting to Excel:', err);
            setError('Failed to export to Excel. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = () => {
        setError('PDF export functionality will be implemented soon');
        setShowExportOptions(false);
    };

    // JSX Return
    return (
        <div className="stock-cards-container">
            {/* Loading Modal */}
            {loading && (
                <div className="loading-modal">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <p>Loading stock data...</p>
                        <p>Please wait while we connect to the server</p>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {error && (
                <div className="error-modal">
                    <div className="error-content">
                        <h3>Error Loading Data</h3>
                        <p>{error}</p>
                        <div className="error-details">
                            <p>Possible solutions:</p>
                            <ul>
                                <li>Check your internet connection</li>
                                <li>Verify the server is running</li>
                                <li>Confirm the stock number is correct</li>
                                <li>Contact IT support if problem persists</li>
                            </ul>
                        </div>
                        <div className="error-actions">
                            <button onClick={() => setError(null)}>Dismiss</button>
                            <button onClick={handleLoadData}>Retry</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modals */}
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

            {/* Item Form Modal */}
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

            {/* Main Header */}
            <div className="header-top">
                <button className="return-button" onClick={() => navigate(-1)}> &larr; </button>
                <h1>Stock Card</h1>
            </div>

            {/* Save Notification */}
            <div className={`save-notification ${hasChanges ? 'visible' : ''}`}>
                Pending Changes
            </div>

            {/* Header Text */}
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

                {/* Main Table */}
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

            {/* Action Buttons */}
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

            {/* Right Image Section */}
            <div className="right-image-section">
                <img src={logo} alt="OCD logo" className="vertical-OCD-image" />
            </div>
        </div>
    );
};

export default StockCardsPage;