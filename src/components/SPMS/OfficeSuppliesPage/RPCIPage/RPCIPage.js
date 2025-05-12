import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import './RPCIPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const RPCIPage = () => {
    const [rows, setRows] = useState([
        {
            article: '1',
            description: 'CLEARBOOK, Ad Size',
            stockNumber: 'A1',
            unitofMeasure: 'pcs',
            unitValue: '38.00',
            balancePerCard: '14',
            onhandPerCount: '',
            shortageOverage: '',
            totalCost: '532.00',
            remarks: ''
        },
        {
            article: '2',
            description: 'Cashbook, Legal/Reaic',
            stockNumber: 'A2',
            unitofMeasure: 'pcs',
            unitValue: '40.00',
            balancePerCard: '2',
            onhandPerCount: '',
            shortageOverage: '',
            totalCost: '80.00',
            remarks: ''
        },
        {
            article: '3',
            description: 'SIGN PEN, black',
            stockNumber: 'A3',
            unitofMeasure: 'pcs',
            unitValue: '-',
            balancePerCard: '0',
            onhandPerCount: '',
            shortageOverage: '',
            totalCost: '-',
            remarks: ''
        },
        {
            article: '4',
            description: 'SIGN PEN, blue',
            stockNumber: 'A4',
            unitofMeasure: 'pcs',
            unitValue: '-',
            balancePerCard: '0',
            onhandPerCount: '',
            shortageOverage: '',
            totalCost: '-',
            remarks: ''
        },
        {
            article: '5',
            description: 'SIGN PEN, red',
            stockNumber: 'A5',
            unitofMeasure: 'pcs',
            unitValue: '-',
            balancePerCard: '0',
            onhandPerCount: '',
            shortageOverage: '',
            totalCost: '-',
            remarks: ''
        }
    ]);
    
    const [fundCluster, setFundCluster] = useState('');
    const [accountableOfficer, setAccountableOfficer] = useState('MS. KRIZELLE JANE MATIAS');
    const [assumptionDate, setAssumptionDate] = useState('April 11, 2023');
    const [inventoryType, setInventoryType] = useState('OFFICE SUPPLIES');
    const [reportDate, setReportDate] = useState('DECEMBER 31, 2024');

    const navigate = useNavigate();

    const onBack = () => {
        navigate(-1);
    };

    const onExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('RPCI');

            // Set default font
            worksheet.properties.defaultRowHeight = 15;

            // Add header information
            worksheet.addRow(['Republic of the Philippines']);
            worksheet.addRow(['Department of National Defense']);
            worksheet.addRow(['OFFICE OF CIVIL DEFENSE']);
            worksheet.addRow(['NATIONAL CAPITAL REGION']);
            worksheet.addRow(['NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY']);
            worksheet.addRow(['Telephone Number: (02) 421-1918; OPCEN Mobile Number: 0917-8276325']);
            worksheet.addRow(['E-Mail Address: ncr@ocd.gov.ph / childefensenc@gmail.com']);
            worksheet.addRow([]);

            // Add report title
            const reportTitleRow = worksheet.addRow(['REPORT ON THE PHYSICAL COUNT OF INVENTORIES']);
            reportTitleRow.font = { bold: true };
            reportTitleRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells('A8:J8');

            // Add inventory type
            const inventoryTypeRow = worksheet.addRow([inventoryType]);
            inventoryTypeRow.font = { italic: true };
            inventoryTypeRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells('A9:J9');
            worksheet.addRow([`(Type of Inventory Item)`]);
            worksheet.mergeCells('A10:J10');
            worksheet.addRow([`As of ${reportDate}`]);
            worksheet.mergeCells('A11:J11');
            worksheet.addRow([]);

            // Add fund cluster and accountable officer
            worksheet.addRow([`Fund Cluster : ${fundCluster}`]);
            worksheet.mergeCells('A13:J13');
            worksheet.addRow([`For which ${accountableOfficer}, Accountable Officer, OCD-RCB is accountable, having assumed such accountability on ${assumptionDate}.`]);
            worksheet.mergeCells('A14:J14');
            worksheet.addRow([]);

            // Add table headers
            const headerRow1 = worksheet.addRow([
                'Article', 'Description', 'Stock Number', 'Unit of Measure', 'Unit Value', 
                'Balance Per Card', 'On Hand Per Count', 'Shortage/Overage', 'TOTAL COST', 'Remarks'
            ]);
            headerRow1.font = { bold: true };

            const headerRow2 = worksheet.addRow([
                '', '', '', '', '', '(Quantity)', '(Quantity)', 'Quantity', 'Quantity', ''
            ]);
            headerRow2.font = { bold: true };

            // Add section header
            const sectionHeaderRow = worksheet.addRow(['A. Arts and Crafts Equipment and Accessories and Supplies']);
            sectionHeaderRow.font = { bold: true };
            worksheet.mergeCells('A17:J17');

            // Add data rows
            rows.forEach(row => {
                worksheet.addRow([
                    row.article,
                    row.description,
                    row.stockNumber,
                    row.unitofMeasure,
                    row.unitValue,
                    row.balancePerCard,
                    row.onhandPerCount,
                    row.shortageOverage,
                    row.totalCost,
                    row.remarks
                ]);
            });

            // Set column widths
            worksheet.columns = [
                { width: 8 },  // Article
                { width: 25 }, // Description
                { width: 12 }, // Stock Number
                { width: 12 }, // Unit of Measure
                { width: 10 }, // Unit Value
                { width: 12 }, // Balance Per Card
                { width: 12 }, // On Hand Per Count
                { width: 12 }, // Shortage/Overage
                { width: 12 }, // TOTAL COST
                { width: 15 }  // Remarks
            ];

            // Add borders to all cells
            const lastRow = worksheet.rowCount;
            for (let i = 16; i <= lastRow; i++) {
                for (let j = 1; j <= 10; j++) {
                    const cell = worksheet.getCell(i, j);
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                }
            }

            // Save the workbook
            await workbook.xlsx.writeFile(`RPCI_Inventory_${reportDate.replace(/\s+/g, '_')}.xlsx`);
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
        doc.text('E-Mail Address: ncr@ocd.gov.ph / childefensenc@gmail.com', 140, 46, { align: 'center' });
        
        // Report title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('REPORT ON THE PHYSICAL COUNT OF INVENTORIES', 140, 56, { align: 'center' });
        
        // Inventory type
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(inventoryType, 140, 62, { align: 'center' });
        doc.setFont('helvetica', 'italic');
        doc.text('(Type of Inventory Item)', 140, 68, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.text(`As of ${reportDate}`, 140, 74, { align: 'center' });
        
        // Fund cluster and accountable officer
        doc.text(`Fund Cluster : ${fundCluster}`, 15, 84);
        doc.text(`For which ${accountableOfficer}, Accountable Officer, OCD-RCB is accountable, having assumed such accountability on ${assumptionDate}.`, 15, 90);
        
        // Table headers
        const startY = 100;
        const cellWidth = 25;
        const cellHeight = 10;
        
        // Main headers
        doc.setFont('helvetica', 'bold');
        const mainHeaders = ['Article', 'Description', 'Stock Number', 'Unit of Measure', 'Unit Value', 
                           'Balance Per Card', 'On Hand Per Count', 'Shortage/Overage', 'TOTAL COST', 'Remarks'];
        
        mainHeaders.forEach((header, i) => {
            doc.text(header, 15 + (i * cellWidth), startY);
        });
        
        // Sub-headers
        doc.setFont('helvetica', 'bold');
        doc.text('(Quantity)', 15 + (5 * cellWidth), startY + 6);
        doc.text('(Quantity)', 15 + (6 * cellWidth), startY + 6);
        doc.text('Quantity', 15 + (7 * cellWidth), startY + 6);
        doc.text('Quantity', 15 + (8 * cellWidth), startY + 6);
        
        // Section header
        doc.text('A. Arts and Crafts Equipment and Accessories and Supplies', 15, startY + 16);
        
        // Table data
        doc.setFont('helvetica', 'normal');
        rows.forEach((row, rowIndex) => {
            const y = startY + 22 + (rowIndex * cellHeight);
            const rowData = [
                row.article,
                row.description,
                row.stockNumber,
                row.unitofMeasure,
                row.unitValue,
                row.balancePerCard,
                row.onhandPerCount,
                row.shortageOverage,
                row.totalCost,
                row.remarks
            ];
            
            rowData.forEach((cell, i) => {
                doc.text(cell, 15 + (i * cellWidth), y);
            });
        });
        
        // Add borders
        for (let i = 0; i < rows.length; i++) {
            for (let j = 0; j < mainHeaders.length; j++) {
                doc.rect(15 + (j * cellWidth), startY + 20 + (i * cellHeight), cellWidth, cellHeight);
            }
        }
        
        doc.save(`RPCI_Inventory_${reportDate.replace(/\s+/g, '_')}.pdf`);
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
                    />
                </div>
                <div className="rpci-control-group">
                    <label>Accountable Officer:</label>
                    <input 
                        type="text" 
                        value={accountableOfficer}
                        onChange={(e) => setAccountableOfficer(e.target.value)}
                    />
                </div>
                <div className="rpci-control-group">
                    <label>Assumption Date:</label>
                    <input 
                        type="text" 
                        value={assumptionDate}
                        onChange={(e) => setAssumptionDate(e.target.value)}
                    />
                </div>
                <div className="rpci-control-group">
                    <label>Inventory Type:</label>
                    <input 
                        type="text" 
                        value={inventoryType}
                        onChange={(e) => setInventoryType(e.target.value)}
                    />
                </div>
                <div className="rpci-control-group">
                    <label>Report Date:</label>
                    <input 
                        type="text" 
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
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
                                <th>Stock Number</th>
                                <th>Unit of Measure</th>
                                <th>Unit Value</th>
                                <th>Balance Per Card</th>
                                <th>On Hand Per Count</th>
                                <th colSpan="2">Shortage/Overage</th>
                                <th>Total Cost</th>
                                <th>Remarks</th>
                            </tr>
                            <tr>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th>Qty</th>
                                <th>Qty</th>
                                <th>Qty</th>
                                <th>Qty</th>
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
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.description}
                                            onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.stockNumber}
                                            onChange={(e) => handleInputChange(index, 'stockNumber', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.unitofMeasure}
                                            onChange={(e) => handleInputChange(index, 'unitofMeasure', e.target.value)}
                                        />
                                    </td>
                                    <td>   
                                        <input
                                            type="text"
                                            value={row.unitValue}
                                            onChange={(e) => handleInputChange(index, 'unitValue', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.balancePerCard}
                                            onChange={(e) => handleInputChange(index, 'balancePerCard', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.onhandPerCount}
                                            onChange={(e) => handleInputChange(index, 'onhandPerCount', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.shortageOverage}
                                            onChange={(e) => handleInputChange(index, 'shortageOverage', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.totalCost}
                                            onChange={(e) => handleInputChange(index, 'totalCost', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.remarks}
                                            onChange={(e) => handleInputChange(index, 'remarks', e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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