import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './StockCardsPage.css';
import logo from '../../../../Assets/OCD-main.jpg';
import { supabase } from '../../../../supabase';

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
        id: null,
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

            // Fetch header data first
            const { data: headerData, error: headerError } = await supabase
                .from('stock_cards_header')
                .select('*')
                .eq('stocknumber', stockNumber)
                .single();

            if (headerError) {
                if (headerError.code === 'PGRST116') {
                    throw new Error('Stockcard not found');
                }
                throw headerError;
            }

            // Fetch transaction data
            const { data: transactionData, error: transactionError } = await supabase
                .from('stock_cards')
                .select('*')
                .eq('stocknumber', stockNumber)
                .order('date', { ascending: true });

            if (transactionError) throw transactionError;

            if (!transactionData || transactionData.length === 0) {
                console.log('No records found for stock number:', stockNumber);
                const emptyData = {
                    fundcluster: headerData?.fundcluster || '',
                    stocknumber: stockNumber,
                    item: headerData?.item || '',
                    description: headerData?.description || '',
                    unitofmeasurement: headerData?.unitofmeasurement || '',
                    transactions: [createEmptyTransaction()]
                };
                setStockData(emptyData);
                setOriginalData(JSON.parse(JSON.stringify(emptyData)));
                setHasChanges(false);
                return;
            }

            // Process the data with header information
            const processedData = {
                fundcluster: headerData?.fundcluster || '',
                stocknumber: stockNumber,
                item: headerData?.item || '',
                description: headerData?.description || '',
                unitofmeasurement: headerData?.unitofmeasurement || '',
                transactions: transactionData.map(processTransaction)
            };

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
            fundcluster: newItemData.fundcluster,
            stocknumber: newItemData.stocknumber,
            item: newItemData.item,
            description: newItemData.description,
            unitofmeasurement: newItemData.unitofmeasurement,
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
        
        // Transaction calculations
        if (updatedTransactions[index].isRISRow) {
            if (field === 'issueqty') {
                const prevBalanceQty = index > 0 ? parseFloat(updatedTransactions[index-1].balanceqty) || 0 : 0;
                const currentIssueQty = parseFloat(validatedValue) || 0;
                updatedTransactions[index].balanceqty = Math.max(0, prevBalanceQty - currentIssueQty).toString();
                
                updatedTransactions[index].receiptqty = '';
                updatedTransactions[index].receiptunitcost = '';
                updatedTransactions[index].receipttotalcost = '';
                updatedTransactions[index].balanceunitcost = '';
                updatedTransactions[index].balancetotalcost = '';
            }
        } else {
            const qty = parseFloat(updatedTransactions[index].receiptqty) || 0;
            const unitCost = parseFloat(updatedTransactions[index].receiptunitcost) || 0;
            updatedTransactions[index].receipttotalcost = (qty * unitCost).toFixed(2);
            
            if (index === 0) {
                const receiptQty = parseFloat(updatedTransactions[index].receiptqty) || 0;
                const receiptUnitCost = parseFloat(updatedTransactions[index].receiptunitcost) || 0;
                const receiptTotalCost = receiptQty * receiptUnitCost;
                
                updatedTransactions[index].balanceqty = receiptQty.toString();
                updatedTransactions[index].balanceunitcost = receiptUnitCost.toFixed(2);
                updatedTransactions[index].balancetotalcost = receiptTotalCost.toFixed(2);
                updatedTransactions[index].receipttotalcost = receiptTotalCost.toFixed(2);
            } else {
                const prevBalanceQty = parseFloat(updatedTransactions[index-1].balanceqty) || 0;
                const currentReceiptQty = parseFloat(updatedTransactions[index].receiptqty) || 0;
                const currentReceiptUnitCost = parseFloat(updatedTransactions[index].receiptunitcost) || 0;
                const currentIssueQty = parseFloat(updatedTransactions[index].issueqty) || 0;
                
                const currentReceiptTotalCost = currentReceiptQty * currentReceiptUnitCost;
                updatedTransactions[index].receipttotalcost = currentReceiptTotalCost.toFixed(2);
                
                let balanceQty = prevBalanceQty + currentReceiptQty - currentIssueQty;
                updatedTransactions[index].balanceqty = Math.max(0, balanceQty).toString();
                
                let lastNonRISIndex = index - 1;
                while (lastNonRISIndex >= 0 && updatedTransactions[lastNonRISIndex].isRISRow) {
                    lastNonRISIndex--;
                }
                
                let balanceUnitCost = 0;
                let balanceTotalCost = 0;
                
                if (currentReceiptQty > 0) {
                    if (lastNonRISIndex >= 0) {
                        const lastUnitCost = parseFloat(updatedTransactions[lastNonRISIndex].balanceunitcost) || 0;
                        balanceUnitCost = lastUnitCost + currentReceiptUnitCost / 2;
                        
                        const lastTotalCost = parseFloat(updatedTransactions[lastNonRISIndex].balancetotalcost) || 0;
                        balanceTotalCost = lastTotalCost + currentReceiptTotalCost / 2;
                    } else {
                        balanceUnitCost = currentReceiptUnitCost;
                        balanceTotalCost = currentReceiptTotalCost;
                    }
                } else {
                    balanceUnitCost = parseFloat(updatedTransactions[index-1].balanceunitcost) || 0;
                    balanceTotalCost = parseFloat(updatedTransactions[index-1].balancetotalcost) || 0;
                }
                
                updatedTransactions[index].balanceunitcost = balanceUnitCost.toFixed(2);
                updatedTransactions[index].balancetotalcost = balanceTotalCost.toFixed(2);
            }
        }
        
        // Update subsequent rows
        for (let i = index + 1; i < updatedTransactions.length; i++) {
            const prevBalanceQty = parseFloat(updatedTransactions[i-1].balanceqty) || 0;
            const currentIssueQty = parseFloat(updatedTransactions[i].issueqty) || 0;
            
            if (updatedTransactions[i].isRISRow) {
                updatedTransactions[i].balanceqty = Math.max(0, prevBalanceQty - currentIssueQty).toString();
                updatedTransactions[i].balanceunitcost = updatedTransactions[i-1].balanceunitcost;
                updatedTransactions[i].balancetotalcost = (parseFloat(updatedTransactions[i].balanceqty) * 
                    parseFloat(updatedTransactions[i].balanceunitcost)).toFixed(2);
            } else {
                const currentReceiptQty = parseFloat(updatedTransactions[i].receiptqty) || 0;
                const currentReceiptUnitCost = parseFloat(updatedTransactions[i].receiptunitcost) || 0;
                const currentReceiptTotalCost = currentReceiptQty * currentReceiptUnitCost;
                
                updatedTransactions[i].balanceqty = Math.max(0, prevBalanceQty + currentReceiptQty - currentIssueQty).toString();
                
                let lastNonRISIndex = i - 1;
                while (lastNonRISIndex >= 0 && updatedTransactions[lastNonRISIndex].isRISRow) {
                    lastNonRISIndex--;
                }
                
                if (currentReceiptQty > 0) {
                    if (lastNonRISIndex >= 0) {
                        const lastUnitCost = parseFloat(updatedTransactions[lastNonRISIndex].balanceunitcost) || 0;
                        updatedTransactions[i].balanceunitcost = (lastUnitCost + currentReceiptUnitCost / 2).toFixed(2);
                        
                        const lastTotalCost = parseFloat(updatedTransactions[lastNonRISIndex].balancetotalcost) || 0;
                        updatedTransactions[i].balancetotalcost = (lastTotalCost + currentReceiptTotalCost / 2).toFixed(2);
                    } else {
                        updatedTransactions[i].balanceunitcost = currentReceiptUnitCost.toFixed(2);
                        updatedTransactions[i].balancetotalcost = currentReceiptTotalCost.toFixed(2);
                    }
                } else {
                    updatedTransactions[i].balanceunitcost = updatedTransactions[i-1].balanceunitcost;
                    updatedTransactions[i].balancetotalcost = updatedTransactions[i-1].balancetotalcost;
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

    const deleteRow = async (index) => {
        if (stockData.transactions.length <= 1) {
            setError('At least one transaction must remain');
            return;
        }

        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                setLoading(true);
                const transactionToDelete = stockData.transactions[index];

                // If the transaction has an ID (i.e., it exists in the database), delete it
                if (transactionToDelete.id && transactionToDelete.id !== Date.now().toString()) {
                    const { error } = await supabase
                        .from('stock_cards')
                        .delete()
                        .eq('id', transactionToDelete.id);

                    if (error) throw error;
                }

                // Remove the transaction from the UI
                const transactionsAfterDelete = [...stockData.transactions];
                transactionsAfterDelete.splice(index, 1);

                // Recalculate balances if the deleted row is not the last row
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
            } catch (error) {
                console.error('Error deleting transaction:', error);
                setError('Failed to delete transaction. Please try again.');
            } finally {
                setLoading(false);
            }
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

            // Update header information
            const { error: headerError } = await supabase
                .from('stock_cards_header')
                .upsert({
                    stocknumber: dataToSend.stocknumber,
                    fundcluster: dataToSend.fundcluster,
                    item: dataToSend.item,
                    description: dataToSend.description,
                    unitofmeasurement: dataToSend.unitofmeasurement
                });

            if (headerError) throw headerError;

            // Separate new and existing transactions
            const existingTransactions = dataToSend.transactions.filter(t => t.id !== null);
            const newTransactions = dataToSend.transactions.filter(t => t.id === null);

            // Update existing transactions
            if (existingTransactions.length > 0) {
                const { error: updateError } = await supabase
                    .from('stock_cards')
                    .upsert(
                        existingTransactions.map(t => ({
                            id: t.id, // Ensure the ID is included for updates
                            stocknumber: dataToSend.stocknumber,
                            date: t.date,
                            reference: t.reference,
                            receiptqty: t.receiptqty,
                            receiptunitcost: t.receiptunitcost,
                            receipttotalcost: t.receipttotalcost,
                            issueqty: t.issueqty,
                            issueoffice: t.issueoffice,
                            balanceqty: t.balanceqty,
                            balanceunitcost: t.balanceunitcost,
                            balancetotalcost: t.balancetotalcost,
                            daystoconsume: t.daystoconsume
                        })),
                        { onConflict: 'id' } // Explicitly specify the conflict resolution key
                    );

                if (updateError) throw updateError;
            }

            // Insert new transactions
            if (newTransactions.length > 0) {
                const { data: insertedTransactions, error: insertError } = await supabase
                    .from('stock_cards')
                    .insert(
                        newTransactions.map(t => ({
                            stocknumber: dataToSend.stocknumber,
                            date: t.date,
                            reference: t.reference,
                            receiptqty: t.receiptqty,
                            receiptunitcost: t.receiptunitcost,
                            receipttotalcost: t.receipttotalcost,
                            issueqty: t.issueqty,
                            issueoffice: t.issueoffice,
                            balanceqty: t.balanceqty,
                            balanceunitcost: t.balanceunitcost,
                            balancetotalcost: t.balancetotalcost,
                            daystoconsume: t.daystoconsume
                        }))
                    )
                    .select(); // Return the inserted rows to get their IDs

                if (insertError) throw insertError;

                // Update the state with the new IDs
                if (insertedTransactions) {
                    const updatedTransactions = [
                        ...existingTransactions,
                        ...insertedTransactions
                    ];
                    const updatedData = {
                        ...stockData,
                        transactions: updatedTransactions
                    };
                    setStockData(updatedData);
                    setOriginalData(JSON.parse(JSON.stringify(updatedData)));
                }
            } else {
                setOriginalData(JSON.parse(JSON.stringify(stockData)));
            }

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
            setError(null);
            
            if (!stockData.transactions.length) {
                setError('No data to export');
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('STOCK CARD');

            // HEADER SECTION (centered, merged)
            const addHeaderRow = (text, fontSize = 12, bold = true) => {
                const row = worksheet.addRow([text]);
                row.font = { name: 'Arial', size: fontSize, bold };
                row.alignment = { horizontal: 'center' };
                worksheet.mergeCells(`A${row.number}:L${row.number}`);
            };
            addHeaderRow('Republic of the Philippines', 12, false);
            addHeaderRow('Department of National Defense', 12, false);
            addHeaderRow('OFFICE OF CIVIL DEFENSE', 12, true);
            addHeaderRow('NATIONAL CAPITAL REGION', 12, true);
            addHeaderRow('NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY', 10, false);
            addHeaderRow('Telephone Number: (02) 421-1918; OPCEN Mobile Number: 0917-8276325', 10, false);
            addHeaderRow('E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com', 10, false);
            worksheet.addRow([]);
            const now = new Date();
            const month = now.toLocaleString('default', { month: 'long' }).toUpperCase();
            const year = now.getFullYear();
            addHeaderRow(`STOCK CARD AS OF ${month} ${year}`, 12, true);
            worksheet.addRow([]);
            
            // ITEM INFO GRID (2 rows)
            const itemInfoRow1 = worksheet.addRow([
                'Fund Cluster:', stockData.fundcluster || '', '', '', '', '', '', '', 'Stock No.:', stockData.stocknumber || '', 'Re-order Point:', ''
            ]);
            itemInfoRow1.font = { name: 'Arial', size: 10 };
            worksheet.mergeCells(`A${itemInfoRow1.number}:B${itemInfoRow1.number}`);
            worksheet.mergeCells(`I${itemInfoRow1.number}:J${itemInfoRow1.number}`);
            worksheet.mergeCells(`K${itemInfoRow1.number}:L${itemInfoRow1.number}`);

            const itemInfoRow2 = worksheet.addRow([
                'Item:', stockData.item || '', '', '', '', '', '', '', 'Description:', stockData.description || '', '', ''
            ]);
            itemInfoRow2.font = { name: 'Arial', size: 10 };
            worksheet.mergeCells(`A${itemInfoRow2.number}:B${itemInfoRow2.number}`);
            worksheet.mergeCells(`I${itemInfoRow2.number}:L${itemInfoRow2.number}`);
            
            const itemInfoRow3 = worksheet.addRow([
                'Unit of Measurement:', stockData.unitofmeasurement || '', '', '', '', '', '', '', '', '', '', ''
            ]);
            itemInfoRow3.font = { name: 'Arial', size: 10 };
            worksheet.mergeCells(`A${itemInfoRow3.number}:B${itemInfoRow3.number}`);
            worksheet.mergeCells(`C${itemInfoRow3.number}:L${itemInfoRow3.number}`);

            worksheet.addRow([]);
            
            // TABLE HEADERS (with merged cells for Receipt, Issue, Balance)
            const mainHeaderRow = worksheet.addRow([
                'Date', 'Reference', '', 'RECEIPT', '', '', 'ISSUE', '', 'BALANCE', '', '', 'No. of Days to Consume'
            ]);
            mainHeaderRow.font = { name: 'Arial', size: 10, bold: true };
            mainHeaderRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells(`C${mainHeaderRow.number}:C${mainHeaderRow.number}`); // keep for alignment
            worksheet.mergeCells(`D${mainHeaderRow.number}:F${mainHeaderRow.number}`);
            worksheet.mergeCells(`G${mainHeaderRow.number}:H${mainHeaderRow.number}`);
            worksheet.mergeCells(`I${mainHeaderRow.number}:K${mainHeaderRow.number}`);
            
            const subHeaderRow = worksheet.addRow([
                '', '', 'Qty.', 'Unit Cost', 'Total Cost', 'Qty.', 'Office', 'Qty.', 'Unit Cost', 'Total Cost', '', ''
            ]);
            subHeaderRow.font = { name: 'Arial', size: 10, bold: true };
            subHeaderRow.alignment = { horizontal: 'center' };
            
            // Prepare table data
            const getDateObj = (d) => {
                if (!d) return null;
                const date = new Date(d);
                return isNaN(date) ? null : date;
            };
            const formatDate = (d) => {
                const date = getDateObj(d);
                return date ? date.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                }) : '';
            };
            const transactions = stockData.transactions || [];
            const dateObjs = transactions.map(t => getDateObj(t.date)).filter(d => d);
            let minDate = dateObjs.length ? new Date(Math.min(...dateObjs.map(d => d.getTime()))) : null;
            let maxDate = dateObjs.length ? new Date(Math.max(...dateObjs.map(d => d.getTime()))) : null;
            if (minDate) minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
            if (maxDate) maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

            // Add table data, grouped by month, with 'No issued supplies...' rows
            if (minDate && maxDate) {
                let current = new Date(minDate);
                while (current <= maxDate) {
                    const month = current.getMonth();
                    const year = current.getFullYear();
                    const monthTx = transactions.filter(t => {
                        const td = getDateObj(t.date);
                        return td && td.getMonth() === month && td.getFullYear() === year;
                    });
                    if (monthTx.length === 0) {
                        const monthName = current.toLocaleString('default', { month: 'long' });
                const row = worksheet.addRow([
                            `No issued supplies for the month of ${monthName} ${year}`
                        ]);
                        row.font = { italic: true };
                        worksheet.mergeCells(`A${row.number}:L${row.number}`);
                    } else {
                        monthTx.forEach(t => {
                            const row = worksheet.addRow([
                                formatDate(t.date),
                                t.reference || '',
                                t.receiptqty || '',
                                t.receiptunitcost || '',
                                t.receipttotalcost || '',
                                t.issueqty || '',
                                t.issueoffice || '',
                                t.balanceqty || '',
                                t.balanceunitcost || '',
                                t.balancetotalcost || '',
                    '',
                                t.daystoconsume || ''
                            ]);
                            row.font = { name: 'Arial', size: 10 };
                        });
                    }
                    current.setMonth(current.getMonth() + 1);
                }
            } else {
                transactions.forEach(t => {
                    const row = worksheet.addRow([
                        formatDate(t.date),
                        t.reference || '',
                        t.receiptqty || '',
                        t.receiptunitcost || '',
                        t.receipttotalcost || '',
                        t.issueqty || '',
                        t.issueoffice || '',
                        t.balanceqty || '',
                        t.balanceunitcost || '',
                        t.balancetotalcost || '',
                        '',
                        t.daystoconsume || ''
                    ]);
                    row.font = { name: 'Arial', size: 10 };
                });
            }

            // Add empty rows for visual padding
            for (let i = 0; i < 5; i++) {
                worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '']);
            }
            
            // Set column widths
            worksheet.columns = [
                { width: 12 }, // Date
                { width: 25 }, // Reference
                { width: 8 },  // Receipt Qty
                { width: 12 }, // Receipt Unit Cost
                { width: 12 }, // Receipt Total Cost
                { width: 8 },  // Issue Qty
                { width: 12 }, // Issue Office
                { width: 8 },  // Balance Qty
                { width: 12 }, // Balance Unit Cost
                { width: 12 }, // Balance Total Cost
                { width: 8 },  // Empty
                { width: 20 }  // Days to Consume
            ];
            
            // Save file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `STOCK_CARD_${stockData.stocknumber || 'NEW'}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            setShowExportOptions(false);
        } catch (err) {
            console.error('Error exporting to Excel:', err);
            setError('Failed to export to Excel. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = async () => {
        try {
            setLoading(true);
            setError(null);
            
            if (!stockData.transactions.length) {
                setError('No data to export');
                return;
            }

            // Create new PDF document in portrait
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Get current month and year for title
            const currentDate = new Date();
            const month = currentDate.toLocaleString('default', { month: 'long' }).toUpperCase();
            const year = currentDate.getFullYear();
            
            // Add the logo
            const logoWidth = 25;
            const logoHeight = 25;
            const logoX = 20;
            const logoY = 15;
            doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
            
            // Header text positioning (adjusted to align with logo)
            const centerX = 105;
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text("Republic of the Philippines", centerX, 20, { align: "center" });
            doc.text("Department of National Defense", centerX, 25, { align: "center" });
            doc.setFont("helvetica", "bold");
            doc.text("OFFICE OF CIVIL DEFENSE", centerX, 30, { align: "center" });
            doc.text("NATIONAL CAPITAL REGION", centerX, 35, { align: "center" });
            
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text("NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY", centerX, 42, { align: "center" });
            doc.text("Telephone Number: (02) 421-1918; OPCEN Mobile Number: 0917-8276325", centerX, 47, { align: "center" });
            doc.text("E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com", centerX, 52, { align: "center" });

            // Add title with current month and year
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(`STOCK CARD AS OF ${month} ${year}`, centerX, 62, { align: "center" });
            
            // Create a table for the item information
            autoTable(doc, {
                startY: 70,
                head: [[
                    { content: 'Fund Cluster:', colSpan: 2 },
                    { content: 'Stock No.:', colSpan: 1 },
                    { content: '', colSpan: 1 }
                ]],
                body: [
                    [
                        { content: stockData.fundcluster, colSpan: 2 },
                        { content: stockData.stocknumber, colSpan: 2 }
                    ],
                    [
                        { content: 'Item:', colSpan: 1 },
                        { content: stockData.item, colSpan: 3 }
                    ],
                    [
                        { content: 'Description:', colSpan: 1 },
                        { content: stockData.description, colSpan: 3 }
                    ],
                    [
                        { content: 'Unit of Measurement:', colSpan: 1 },
                        { content: stockData.unitofmeasurement, colSpan: 3 }
                    ]
                ],
                theme: 'plain',
                styles: {
                    fontSize: 10,
                    cellPadding: 2
                },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 60 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 50 }
                }
            });
            
            // Prepare table data
            const tableData = [];
            const transactions = stockData.transactions || [];

            // Returns a Date object or null
            const getDateObj = (d) => {
                if (!d) return null;
                const date = new Date(d);
                return isNaN(date) ? null : date;
            };
            // For display only
            const formatDate = (d) => {
                const date = getDateObj(d);
                return date ? date.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                }) : '';
            };

            // Find all months between first and last transaction
            const dateObjs = transactions.map(t => getDateObj(t.date)).filter(d => d);
            let minDate = dateObjs.length ? new Date(Math.min(...dateObjs.map(d => d.getTime()))) : null;
            let maxDate = dateObjs.length ? new Date(Math.max(...dateObjs.map(d => d.getTime()))) : null;
            if (minDate) minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
            if (maxDate) maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

            if (minDate && maxDate) {
                let current = new Date(minDate);
                while (current <= maxDate) {
                    const month = current.getMonth();
                    const year = current.getFullYear();
                    // All transactions for this month
                    const monthTx = transactions.filter(t => {
                        const td = getDateObj(t.date);
                        return td && td.getMonth() === month && td.getFullYear() === year;
                    });
                    if (monthTx.length === 0) {
                        // No issued supplies for this month
                        const monthName = current.toLocaleString('default', { month: 'long' });
                        tableData.push([
                            { content: `No issued supplies for the month of ${monthName} ${year}`, colSpan: 11, styles: { halign: 'left' } }
                        ]);
                    } else {
                        // Add all transactions for this month
                        monthTx.forEach(t => {
                            tableData.push([
                                formatDate(t.date),
                                t.reference || '',
                                t.receiptqty || '',
                                t.receiptunitcost || '',
                                t.receipttotalcost || '',
                                t.issueqty || '',
                                t.issueoffice || '',
                                t.balanceqty || '',
                                t.balanceunitcost || '',
                                t.balancetotalcost || '',
                                t.daystoconsume || ''
                            ]);
                        });
                    }
                    current.setMonth(current.getMonth() + 1);
                }
            } else {
                // No valid dates, just add all transactions
                transactions.forEach(t => {
                    tableData.push([
                        formatDate(t.date),
                        t.reference || '',
                        t.receiptqty || '',
                        t.receiptunitcost || '',
                        t.receipttotalcost || '',
                        t.issueqty || '',
                        t.issueoffice || '',
                        t.balanceqty || '',
                        t.balanceunitcost || '',
                        t.balancetotalcost || '',
                        t.daystoconsume || ''
                    ]);
                });
            }

            // Add empty rows
            for (let i = 0; i < 15; i++) {
                tableData.push(['', '', '', '', '', '', '', '', '', '', '']);
            }

            // Main table
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 10,
                head: [
                    [
                        { content: 'Date', rowSpan: 2 },
                        { content: 'Reference', rowSpan: 2 },
                        { content: 'Receipt', colSpan: 3 },
                        { content: 'Issue', colSpan: 2 },
                        { content: 'Balance', colSpan: 3 },
                        { content: 'No. of Days to Consume', rowSpan: 2 }
                    ],
                    [
                        'Qty', 'Unit Cost', 'Total Cost',
                        'Qty', 'Office',
                        'Qty', 'Unit Cost', 'Total Cost',
                        ''
                    ]
                ],
                body: tableData,
                theme: 'grid',
                styles: {
                    fontSize: 8,
                    cellPadding: 1,
                    lineWidth: 0.1,
                    lineColor: [0, 0, 0],
                    halign: 'center'
                },
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    lineWidth: 0.1,
                    halign: 'center'
                },
                columnStyles: {
                    0: { cellWidth: 18 },  // Date
                    1: { cellWidth: 25 },  // Reference
                    2: { cellWidth: 12 },  // Receipt Qty
                    3: { cellWidth: 15 },  // Receipt Unit Cost
                    4: { cellWidth: 18 },  // Receipt Total Cost
                    5: { cellWidth: 12 },  // Issue Qty
                    6: { cellWidth: 18 },  // Issue Office
                    7: { cellWidth: 12 },  // Balance Qty
                    8: { cellWidth: 15 },  // Balance Unit Cost
                    9: { cellWidth: 18 },  // Balance Total Cost
                    10: { cellWidth: 25 }  // Days to Consume
                },
                didParseCell: function(data) {
                    // Center align all header cells
                    if (data.section === 'head') {
                        data.cell.styles.halign = 'center';
                    }
                    // Right align numeric columns in the body
                    if (data.section === 'body') {
                        const numericColumns = [2,3,4,5,7,8,9,10]; // columns with numbers
                        if (numericColumns.includes(data.column.index)) {
                            data.cell.styles.halign = 'right';
                        }
                    }
                }
            });
            
            // Get the PDF as a data URL
            const pdfDataUrl = doc.output('dataurlstring');
            
            // Open the PDF in a new tab
            const newWindow = window.open();
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                    <head>
                        <title>Stock Card - ${stockData.stocknumber || 'NEW'}</title>
                        <style>
                            body { margin: 0; padding: 20px; }
                            iframe { width: 100%; height: 100vh; border: none; }
                        </style>
                    </head>
                    <body>
                        <iframe src="${pdfDataUrl}"></iframe>
                    </body>
                    </html>
                `);
                newWindow.document.close();
            } else {
                doc.save(`STOCK_CARD_${stockData.stocknumber || 'NEW'}.pdf`);
            }
            
            setShowExportOptions(false);
        } catch (err) {
            console.error('Error in PDF export:', err);
            setError(`Failed to export to PDF: ${err.message}`);
        } finally {
            setLoading(false);
        }
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
                                placeholder="Enter stock number"
                                className="custom-stocknumber-input"
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