import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import './RPCIPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const RPCIPage = () => {
    const [rows, setRows] = useState([
        {
            article: '',
            description: '',
            category: '',
            stockNumber: '',
            unitofMeasure: '',
            unitValue: '',
            balancePerCard: '',
            onhandPerCountPallada: '',
            onhandPerCountMedina: '',
            onhandPerCount: '',
            shortageOverage: '',
            totalCost: '',
            remarks: ''
        }
    ]);
    
    const [fundCluster, setFundCluster] = useState('');
    const [accountableOfficer, setAccountableOfficer] = useState('');
    const [assumptionDate, setAssumptionDate] = useState('');
    const [inventoryType, setInventoryType] = useState('');
    const [reportDate, setReportDate] = useState('');

    const navigate = useNavigate();

    // Calculate totals whenever rows change
    useEffect(() => {
        const updatedRows = rows.map(row => {
            const unitValue = parseFloat(row.unitValue) || 0;
            const balancePerCard = parseFloat(row.balancePerCard) || 0;
            const totalCost = unitValue * balancePerCard;
            
            return {
                ...row,
                totalCost: isNaN(totalCost) ? '' : totalCost.toFixed(2)
            };
        });
        setRows(updatedRows);
    }, [rows]);

    const onBack = () => {
        navigate(-1);
    };

    const onExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet2');

            // Set default font
            workbook.creator = 'OCD-NCR';
            workbook.lastModifiedBy = 'OCD-NCR';
            workbook.created = new Date();
            workbook.modified = new Date();
            
            // Set default font
            worksheet.properties.defaultRowHeight = 15;

            // Add header information
            const addHeaderRow = (text) => {
                const row = worksheet.addRow([text]);
                worksheet.mergeCells(`A${row.number}:N${row.number}`);
                return row;
            };

            addHeaderRow('Republic of the Philippines');
            addHeaderRow('Department of National Defense');
            addHeaderRow('OFFICE OF CIVIL DEFENSE');
            addHeaderRow('NATIONAL CAPITAL REGION');
            addHeaderRow('NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY');
            addHeaderRow('Telephone Number: (02) 421-1918; OPCEN Mobile Number: 0917-8276325');
            addHeaderRow('E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com');
            worksheet.addRow([]);

            // Add report title
            const reportTitleRow = worksheet.addRow(['REPORT ON THE PHYSICAL COUNT OF INVENTORIES']);
            reportTitleRow.font = { bold: true };
            reportTitleRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells(`A${reportTitleRow.number}:N${reportTitleRow.number}`);

            // Add inventory type (only if user provided it)
            if (inventoryType) {
                const inventoryTypeRow = worksheet.addRow([inventoryType]);
                inventoryTypeRow.font = { bold: true };
                inventoryTypeRow.alignment = { horizontal: 'center' };
                worksheet.mergeCells(`A${inventoryTypeRow.number}:N${inventoryTypeRow.number}`);
                
                const typeRow = worksheet.addRow(['(Type of Inventory Item)']);
                typeRow.alignment = { horizontal: 'center' };
                worksheet.mergeCells(`A${typeRow.number}:N${typeRow.number}`);
            }
            
            // Add report date (only if user provided it)
            if (reportDate) {
                const dateRow = worksheet.addRow([`As of  ${reportDate}`]);
                dateRow.alignment = { horizontal: 'center' };
                worksheet.mergeCells(`A${dateRow.number}:N${dateRow.number}`);
            }
            worksheet.addRow([]);

            // Add fund cluster (only if user provided it)
            if (fundCluster) {
                const fundRow = worksheet.addRow([`Fund Cluster : ${fundCluster}`]);
                worksheet.mergeCells(`A${fundRow.number}:N${fundRow.number}`);
            }
            
            // Add accountable officer (only if user provided it)
            if (accountableOfficer || assumptionDate) {
                const officerText = `For which ${accountableOfficer || '[Accountable Officer]'}, Supply Accountable Officer, OCD-NCR is accountable, having assumed such accountability on _${assumptionDate || '[Date]'}_.`;
                const officerRow = worksheet.addRow([officerText]);
                worksheet.mergeCells(`A${officerRow.number}:N${officerRow.number}`);
            }
            worksheet.addRow([]);

            // Add table headers
            const headerRow1 = worksheet.addRow([
                'Article', 'Description', 'Categories', 'Stock Number', 'Unit of Measure', 'Unit Value', 
                'Balance Per Card', 'On Hand Per Count\n(Pallada)', 'On Hand Per Count\n(Medina)', 'On Hand Per Count', 
                'Shortage/Overage', '', 'TOTAL COST', 'Remarks'
            ]);
            headerRow1.font = { bold: true };
            headerRow1.alignment = { wrapText: true, vertical: 'top' };

            const headerRow2 = worksheet.addRow([
                '', '', '', '', '', '', '(Quantity)', '(Quantity)', '(Quantity)', '(Quantity)', 'Quantity', 'Quantity', '', ''
            ]);
            headerRow2.font = { bold: true };

            // Add data rows (only if there's data)
            let currentSection = '';
            rows.forEach((row, rowIndex) => {
                // Skip completely empty rows
                if (!row.article && !row.description && !row.stockNumber) return;
                
                if (row.category && row.category !== currentSection) {
                    currentSection = row.category;
                    const sectionRow = worksheet.addRow([`${String.fromCharCode(65 + worksheet.rowCount - headerRow2.number - 2)}. ${currentSection}`]);
                    sectionRow.font = { bold: true };
                    worksheet.mergeCells(`A${sectionRow.number}:N${sectionRow.number}`);
                }
                
                const dataRow = worksheet.addRow([
                    row.article,
                    row.description,
                    row.category,
                    row.stockNumber,
                    row.unitofMeasure,
                    row.unitValue,
                    row.balancePerCard,
                    row.onhandPerCountPallada,
                    row.onhandPerCountMedina,
                    row.onhandPerCount,
                    row.shortageOverage,
                    '',
                    row.totalCost,
                    row.remarks
                ]);
            });

            // Add total row if there are data rows
            if (worksheet.rowCount > headerRow2.number + 1) {
                const totalRow = worksheet.addRow([
                    '', '', '', '', '', '', '', '', '', '', 'TOTAL', `=SUM(M${headerRow1.number + 2}:M${worksheet.rowCount})`, ''
                ]);
                totalRow.getCell('L').font = { bold: true };
                totalRow.getCell('M').font = { bold: true };
                worksheet.mergeCells(`L${totalRow.number}:K${totalRow.number}`);
            }

            // Add signature rows
            worksheet.addRow([]);
            const signatureHeaderRow = worksheet.addRow([
                'Prepared by:', '', '', 'Certified Correct by:', '', '', 'Approved by:', '', '', '', '', 'Verified by:', ''
            ]);
            worksheet.mergeCells(`A${signatureHeaderRow.number}:B${signatureHeaderRow.number}`);
            worksheet.mergeCells(`D${signatureHeaderRow.number}:F${signatureHeaderRow.number}`);
            worksheet.mergeCells(`G${signatureHeaderRow.number}:J${signatureHeaderRow.number}`);
            worksheet.mergeCells(`L${signatureHeaderRow.number}:N${signatureHeaderRow.number}`);

            worksheet.addRow([]);
            const signatureNameRow = worksheet.addRow([
                '', '', '', '', '', '', '', '', '', '', '', '', ''
            ]);
            worksheet.mergeCells(`A${signatureNameRow.number}:B${signatureNameRow.number}`);
            worksheet.mergeCells(`D${signatureNameRow.number}:F${signatureNameRow.number}`);
            worksheet.mergeCells(`G${signatureNameRow.number}:J${signatureNameRow.number}`);
            worksheet.mergeCells(`L${signatureNameRow.number}:N${signatureNameRow.number}`);

            worksheet.addRow([]);
            const signatureTitleRow = worksheet.addRow([
                'Member of Inventory Committee', '', '', 'Chairman, Inventory Committee', '', '', 'OCD NCR, Regional Director', '', '', '', '', 'State Auditor III/OIC, Audit Team Leader', ''
            ]);
            worksheet.mergeCells(`A${signatureTitleRow.number}:B${signatureTitleRow.number}`);
            worksheet.mergeCells(`D${signatureTitleRow.number}:F${signatureTitleRow.number}`);
            worksheet.mergeCells(`G${signatureTitleRow.number}:J${signatureTitleRow.number}`);
            worksheet.mergeCells(`L${signatureTitleRow.number}:N${signatureTitleRow.number}`);

            worksheet.addRow([]);
            const saoRow = worksheet.addRow([
                '', '', '', '', '', '', '', '', '', '', '', '', ''
            ]);
            worksheet.mergeCells(`C${saoRow.number}:F${saoRow.number}`);
            const saoTitleRow = worksheet.addRow([
                '', '', 'SAO, Member of Inventory Committee', '', '', '', '', '', '', '', '', '', ''
            ]);
            worksheet.mergeCells(`C${saoTitleRow.number}:F${saoTitleRow.number}`);

            // Set column widths
            worksheet.columns = [
                { width: 8 },   // Article
                { width: 30 },  // Description
                { width: 30 },  // Categories
                { width: 12 },  // Stock Number
                { width: 12 },  // Unit of Measure
                { width: 10 },  // Unit Value
                { width: 12 },  // Balance Per Card
                { width: 12 },  // On Hand Per Count (Pallada)
                { width: 12 },  // On Hand Per Count (Medina)
                { width: 12 },  // On Hand Per Count
                { width: 12 },  // Shortage/Overage Qty
                { width: 12 },  // Shortage/Overage Qty
                { width: 12 },  // TOTAL COST
                { width: 15 }   // Remarks
            ];

            // Add borders to all cells with data
            const firstDataRow = headerRow1.number + 1;
            const lastRow = worksheet.rowCount;
            
            for (let i = firstDataRow; i <= lastRow; i++) {
                const row = worksheet.getRow(i);
                
                // Skip empty rows and signature section rows
                if (row.actualCellCount > 0 && i < signatureHeaderRow.number - 1) {
                    for (let j = 1; j <= 14; j++) {
                        const cell = worksheet.getCell(i, j);
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };
                        
                        // Align numeric cells to right
                        if ([6,7,8,9,10,11,12,13].includes(j)) {
                            cell.alignment = { horizontal: 'right' };
                        }
                    }
                }
            }

            // Save the workbook
            const fileName = reportDate ? `RPCI_Inventory_${reportDate.replace(/\s+/g, '_')}.xlsx` : 'RPCI_Inventory.xlsx';
            await workbook.xlsx.writeFile(fileName);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
        }
    };

    const onExportPDF = () => {
        const doc = new jsPDF({
            orientation: 'landscape'
        });
        
        // Header information
        doc.setFontSize(12);
        doc.text('Republic of the Philippines', 140, 10, { align: 'center' });
        doc.text('Department of National Defense', 140, 16, { align: 'center' });
        doc.text('OFFICE OF CIVIL DEFENSE', 140, 22, { align: 'center' });
        doc.text('NATIONAL CAPITAL REGION', 140, 28, { align: 'center' });
        doc.text('NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY', 140, 34, { align: 'center' });
        doc.text('Telephone Number: (02) 421-1918; OPCEN Mobile Number: 0917-8276325', 140, 40, { align: 'center' });
        doc.text('E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com', 140, 46, { align: 'center' });
        
        // Report title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('REPORT ON THE PHYSICAL COUNT OF INVENTORIES', 140, 56, { align: 'center' });
        
        // Inventory type (only if provided)
        if (inventoryType) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(inventoryType, 140, 62, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.text('(Type of Inventory Item)', 140, 68, { align: 'center' });
        }
        
        // Report date (only if provided)
        if (reportDate) {
            doc.text(`As of  ${reportDate}`, 140, 74, { align: 'center' });
        }
        
        // Fund cluster (only if provided)
        if (fundCluster) {
            doc.text(`Fund Cluster : ${fundCluster}`, 15, 84);
        }
        
        // Accountable officer (only if provided)
        if (accountableOfficer || assumptionDate) {
            const officerText = `For which ${accountableOfficer || '[Accountable Officer]'}, Supply Accountable Officer, OCD-NCR is accountable, having assumed such accountability on _${assumptionDate || '[Date]'}_.`;
            doc.text(officerText, 15, 90);
        }
        
        // Table headers
        const startY = 100;
        const cellWidths = [10, 30, 30, 12, 12, 10, 12, 12, 12, 12, 12, 12, 12, 15];
        
        // Main headers
        doc.setFont('helvetica', 'bold');
        const mainHeaders = [
            'Article', 'Description', 'Categories', 'Stock Number', 'Unit of Measure', 'Unit Value', 
            'Balance Per Card', 'On Hand Per Count\n(Pallada)', 'On Hand Per Count\n(Medina)', 'On Hand Per Count', 
            'Shortage/Overage', '', 'TOTAL COST', 'Remarks'
        ];
        
        let xPos = 15;
        mainHeaders.forEach((header, i) => {
            doc.text(header, xPos, startY, { maxWidth: cellWidths[i] });
            xPos += cellWidths[i];
        });
        
        // Sub-headers
        doc.setFontSize(10);
        doc.text('(Quantity)', 15 + 6 * cellWidths[6], startY + 6);
        doc.text('(Quantity)', 15 + 7 * cellWidths[7], startY + 6);
        doc.text('(Quantity)', 15 + 8 * cellWidths[8], startY + 6);
        doc.text('(Quantity)', 15 + 9 * cellWidths[9], startY + 6);
        doc.text('Quantity', 15 + 10 * cellWidths[10], startY + 6);
        doc.text('Quantity', 15 + 11 * cellWidths[11], startY + 6);
        doc.setFontSize(12);
        
        // Add data rows
        let currentY = startY + 16;
        let currentSection = '';
        let hasData = false;
        
        rows.forEach((row, rowIndex) => {
            // Skip empty rows
            if (!row.article && !row.description && !row.stockNumber) return;
            hasData = true;
            
            // Add section header if changed
            if (row.category && row.category !== currentSection) {
                currentSection = row.category;
                doc.setFont('helvetica', 'bold');
                doc.text(`${String.fromCharCode(65 + rowIndex)}. ${currentSection}`, 15, currentY);
                currentY += 8;
            }
            
            // Add row data
            doc.setFont('helvetica', 'normal');
            xPos = 15;
            const rowData = [
                row.article,
                row.description,
                row.category,
                row.stockNumber,
                row.unitofMeasure,
                row.unitValue,
                row.balancePerCard,
                row.onhandPerCountPallada,
                row.onhandPerCountMedina,
                row.onhandPerCount,
                row.shortageOverage,
                '',
                row.totalCost,
                row.remarks
            ];
            
            rowData.forEach((cell, i) => {
                doc.text(cell.toString(), xPos, currentY, { maxWidth: cellWidths[i] });
                xPos += cellWidths[i];
            });
            
            currentY += 8;
        });
        
        // Add borders if there's data
        if (hasData) {
            xPos = 15;
            for (let i = 0; i < cellWidths.length; i++) {
                doc.rect(xPos, startY + 12, cellWidths[i], currentY - startY - 12);
                xPos += cellWidths[i];
            }
            
            // Add total row
            doc.setFont('helvetica', 'bold');
            doc.text('TOTAL', 15 + 10 * cellWidths[10], currentY + 8);
            currentY += 16;
        } else {
            currentY += 8;
        }
        
        // Add signature section
        doc.setFontSize(10);
        doc.text('Prepared by:', 15, currentY);
        doc.text('Certified Correct by:', 15 + 3 * cellWidths[3], currentY);
        doc.text('Approved by:', 15 + 6 * cellWidths[6], currentY);
        doc.text('Verified by:', 15 + 11 * cellWidths[11], currentY);
        
        currentY += 6;
        doc.setFontSize(12);
        doc.text('', 15, currentY);
        doc.text('', 15 + 3 * cellWidths[3], currentY);
        doc.text('', 15 + 6 * cellWidths[6], currentY);
        doc.text('', 15 + 11 * cellWidths[11], currentY);
        
        currentY += 6;
        doc.setFontSize(10);
        doc.text('Member of Inventory Committee', 15, currentY);
        doc.text('Chairman, Inventory Committee', 15 + 3 * cellWidths[3], currentY);
        doc.text('OCD NCR, Regional Director', 15 + 6 * cellWidths[6], currentY);
        doc.text('State Auditor III/OIC, Audit Team Leader', 15 + 11 * cellWidths[11], currentY);
        
        currentY += 12;
        doc.text('', 15 + 2 * cellWidths[2], currentY);
        currentY += 6;
        doc.text('SAO, Member of Inventory Committee', 15 + 2 * cellWidths[2], currentY);
        
        const fileName = reportDate ? `RPCI_Inventory_${reportDate.replace(/\s+/g, '_')}.pdf` : 'RPCI_Inventory.pdf';
        doc.save(fileName);
    };

    const handleInputChange = (index, field, value) => {
        const updatedRows = rows.map((row, i) => {
            if (i === index) {
                return { ...row, [field]: value };
            }
            return row;
        });
        setRows(updatedRows);
    };

    const addNewRow = () => {
        setRows([...rows, {
            article: '',
            description: '',
            category: '',
            stockNumber: '',
            unitofMeasure: '',
            unitValue: '',
            balancePerCard: '',
            onhandPerCountPallada: '',
            onhandPerCountMedina: '',
            onhandPerCount: '',
            shortageOverage: '',
            totalCost: '',
            remarks: ''
        }]);
    };

    const removeRow = (index) => {
        if (rows.length > 1) {
            const updatedRows = rows.filter((_, i) => i !== index);
            setRows(updatedRows);
        }
    };

    return (
        <div className="rpci-container">
            <div className="header-top">
                <button className="return-button" onClick={onBack}> &larr; </button>
                <h1>RPCI</h1>
            </div>

            <div className="rpci-header-controls">
                <div className="rpci-control-group">
                    <label>Fund Cluster:</label>
                    <input 
                        type="text" 
                        value={fundCluster}
                        onChange={(e) => setFundCluster(e.target.value)}
                        placeholder="Enter fund cluster"
                    />
                </div>
                <div className="rpci-control-group">
                    <label>Accountable Officer:</label>
                    <input 
                        type="text" 
                        value={accountableOfficer}
                        onChange={(e) => setAccountableOfficer(e.target.value)}
                        placeholder="Enter accountable officer"
                    />
                </div>
                <div className="rpci-control-group">
                    <label>Assumption Date:</label>
                    <input 
                        type="text" 
                        value={assumptionDate}
                        onChange={(e) => setAssumptionDate(e.target.value)}
                        placeholder="Enter assumption date"
                    />
                </div>
                <div className="rpci-control-group">
                    <label>Inventory Type:</label>
                    <input 
                        type="text" 
                        value={inventoryType}
                        onChange={(e) => setInventoryType(e.target.value)}
                        placeholder="Enter inventory type"
                    />
                </div>
                <div className="rpci-control-group">
                    <label>Report Date:</label>
                    <input 
                        type="text" 
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                        placeholder="Enter report date"
                    />
                </div>
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
                <div className="table-container">
                    <table className="inner-table">
                        <thead>
                            <tr>
                                <th>Article</th>
                                <th>Description</th>
                                <th>Categories</th>
                                <th>Stock Number</th>
                                <th>Unit of Measure</th>
                                <th>Unit Value</th>
                                <th>Balance Per Card</th>
                                <th>On Hand Per Count (Pallada)</th>
                                <th>On Hand Per Count (Medina)</th>
                                <th>On Hand Per Count</th>
                                <th>Shortage/Overage</th>
                                <th>TOTAL COST</th>
                                <th>Remarks</th>
                                <th>Action</th>
                            </tr>
                            <tr>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th>(Quantity)</th>
                                <th>(Quantity)</th>
                                <th>(Quantity)</th>
                                <th>(Quantity)</th>
                                <th>Quantity</th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.article}
                                            onChange={(e) => handleInputChange(index, 'article', e.target.value)}
                                            placeholder="Article"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.description}
                                            onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                                            placeholder="Description"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.category}
                                            onChange={(e) => handleInputChange(index, 'category', e.target.value)}
                                            placeholder="Category"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.stockNumber}
                                            onChange={(e) => handleInputChange(index, 'stockNumber', e.target.value)}
                                            placeholder="Stock No."
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.unitofMeasure}
                                            onChange={(e) => handleInputChange(index, 'unitofMeasure', e.target.value)}
                                            placeholder="Unit"
                                        />
                                    </td>
                                    <td>   
                                        <input
                                            type="text"
                                            value={row.unitValue}
                                            onChange={(e) => handleInputChange(index, 'unitValue', e.target.value)}
                                            placeholder="Unit Value"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.balancePerCard}
                                            onChange={(e) => handleInputChange(index, 'balancePerCard', e.target.value)}
                                            placeholder="Balance"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.onhandPerCountPallada}
                                            onChange={(e) => handleInputChange(index, 'onhandPerCountPallada', e.target.value)}
                                            placeholder="Count (Pallada)"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.onhandPerCountMedina}
                                            onChange={(e) => handleInputChange(index, 'onhandPerCountMedina', e.target.value)}
                                            placeholder="Count (Medina)"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.onhandPerCount}
                                            onChange={(e) => handleInputChange(index, 'onhandPerCount', e.target.value)}
                                            placeholder="Count"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.shortageOverage}
                                            onChange={(e) => handleInputChange(index, 'shortageOverage', e.target.value)}
                                            placeholder="Shortage/Overage"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.totalCost}
                                            readOnly
                                            placeholder="Auto-calculated"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.remarks}
                                            onChange={(e) => handleInputChange(index, 'remarks', e.target.value)}
                                            placeholder="Remarks"
                                        />
                                    </td>
                                    <td>
                                        <button onClick={() => removeRow(index)} className="remove-row-button">
                                            ×
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={addNewRow} className="add-row-button">
                        + Add Row
                    </button>
                </div>
            </div>

            <div className="action-buttons-container">
                <div className="action-buttons">
                    <div className="export-dropdown">
                        <button className="export-main-button">Export ▼</button>
                        <div className="export-dropdown-content">
                            <button onClick={onExportExcel}>Export to Excel</button>
                            <button onClick={onExportPDF}>Export to PDF</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="right-image-section">
                <img src={logo} alt="OCD logo" className="vertical-OCD-image" />
            </div>
        </div>
    );
};

export default RPCIPage;