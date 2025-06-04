import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './RSMIPage.css';
import logo from '../../../../Assets/OCD-main.jpg';
import { supabase } from '../../../../supabase';

const RSMIPage = () => {
    const [entityName, setEntityName] = useState('');
    const [fundCluster, setFundCluster] = useState('');
    const [serialNo, setSerialNo] = useState('');
    const [date, setDate] = useState('');
    const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
    const [rows, setRows] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const months = [
        'January', 'February', 'March', 'April', 
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 5}, (_, i) => currentYear + i);

    const fetchRSMIData = async (month, year) => {
        if (!month || !year) {
            setError('Please select both month and year');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            const monthIndex = months.indexOf(month) + 1;
            const startDate = `${year}-${monthIndex.toString().padStart(2, '0')}-01`;
            const endDate = `${year}-${monthIndex.toString().padStart(2, '0')}-31`;

            // First fetch the stock cards data
            const { data: stockCardsData, error: stockCardsError } = await supabase
                .from('stock_cards')
                .select('*, stock_cards_header(*)')
                .gte('date', startDate)
                .lte('date', endDate)
                .gt('issueqty', 0)
                .order('date', { ascending: true });

            if (stockCardsError) throw stockCardsError;

            if (!stockCardsData || stockCardsData.length === 0) {
                throw new Error(`No RSMI data found for ${month} ${year}`);
            }

            // Process the data to match RSMI format
            const processedData = stockCardsData.map(item => ({
                risNo: item.reference || 'N/A',
                responsibilityCenterCode: '2016',
                stockNo: item.stocknumber || 'N/A',
                item: item.stock_cards_header?.item || item.stock_cards_header?.description || 'N/A',
                unit: item.stock_cards_header?.unitofmeasurement || 'N/A',
                quantityIssued: item.issueqty || '0',
                unitCost: item.balanceunitcost || '0.00',
                amount: item.balancetotalcost || '0.00',
                date: item.date || ''
            }));

            // Ensure minimum 5 rows
            const emptyRowsCount = Math.max(0, 5 - processedData.length);
            const emptyRows = Array(emptyRowsCount).fill({
                risNo: '',
                responsibilityCenterCode: '',
                stockNo: '',
                item: '',
                unit: '',
                quantityIssued: '',
                unitCost: '',
                amount: '',
                date: ''
            });
            
            setRows([...processedData, ...emptyRows]);
            
        } catch (error) {
            console.error('Fetch error:', error);
            setError(error.message);
            setRows(Array(5).fill({
                risNo: '',
                responsibilityCenterCode: '',
                stockNo: '',
                item: '',
                unit: '',
                quantityIssued: '',
                unitCost: '',
                amount: '',
                date: ''
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const onBack = () => {
        navigate(-1);
    };

    const handleDateSelect = (month, year) => {
        setDate(`${month} ${year}`);
        setShowMonthYearPicker(false);
        fetchRSMIData(month, year);
    };

    const onExportExcel = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Validate data
            if (!rows || rows.length === 0) {
                throw new Error('No data available to export');
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('RSMI');

            // HEADER SECTION (centered, merged)
            const addHeaderRow = (text, bold = true) => {
                const row = worksheet.addRow([text]);
                row.font = { name: 'Arial', size: 12, bold };
                row.alignment = { horizontal: 'center' };
                worksheet.mergeCells(`A${row.number}:H${row.number}`);
            };
            addHeaderRow('Republic of the Philippines', false);
            addHeaderRow('Department of National Defense', false);
            addHeaderRow('OFFICE OF CIVIL DEFENSE', true);
            addHeaderRow('NATIONAL CAPITAL REGION', true);
            addHeaderRow('NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY', false);
            addHeaderRow('Telephone Number: (02) 421-1918; OPCEN Mobile Number: 0917-8276325', false);
            addHeaderRow('E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com', false);
            worksheet.addRow([]);
            addHeaderRow('REPORT OF SUPPLIES AND MATERIALS ISSUED', true);
            addHeaderRow(date || 'December 2024', true);
            worksheet.addRow([]);

            // ENTITY/FUND/SERIAL/DATE SECTION (two columns)
            const entityRow = worksheet.addRow([
                'Entity Name:', entityName || '', '', '', '', 'Serial No. :', serialNo || '', '']);
            entityRow.font = { name: 'Arial', size: 12, bold: true };
            worksheet.mergeCells(`B${entityRow.number}:E${entityRow.number}`);
            worksheet.mergeCells(`G${entityRow.number}:H${entityRow.number}`);
            const fundRow = worksheet.addRow([
                'Fund Cluster:', fundCluster || '', '', '', '', 'Date :', '', '']);
            fundRow.font = { name: 'Arial', size: 12, bold: true };
            worksheet.mergeCells(`B${fundRow.number}:E${fundRow.number}`);
            worksheet.mergeCells(`G${fundRow.number}:H${fundRow.number}`);
            worksheet.addRow([]);

            // SECTION HEADER (merged)
            const sectionHeader = worksheet.addRow([
                '', '', '', 'To be filled up by the Supply and/or Property Division/Unit', '', '', 'To be filled up by the Accounting Division/Unit', '']);
            sectionHeader.font = { name: 'Arial', size: 12, bold: true };
            worksheet.mergeCells(`D${sectionHeader.number}:F${sectionHeader.number}`);
            worksheet.mergeCells(`G${sectionHeader.number}:H${sectionHeader.number}`);

            // TABLE HEADERS
            const tableHeader = worksheet.addRow([
                'RIS No.',
                'Responsibility Center Code',
                'Stock No.',
                'Item',
                'Unit',
                'Quantity Issued',
                'Unit Cost',
                'Amount'
            ]);
            tableHeader.font = { name: 'Arial', size: 12, bold: true };
            tableHeader.alignment = { horizontal: 'center' };

            // TABLE BODY
            const filledRows = rows.filter(row => row.risNo || row.stockNo || row.item || row.unit || row.quantityIssued || row.unitCost || row.amount);
            const emptyRowsCount = Math.max(15, 15 - filledRows.length);
            const emptyRows = Array(emptyRowsCount).fill({
                risNo: '',
                responsibilityCenterCode: '',
                stockNo: '',
                item: '',
                unit: '',
                quantityIssued: '',
                unitCost: '',
                amount: ''
            });
            const tableBody = [...filledRows, ...emptyRows];
            tableBody.forEach(row => {
                const r = worksheet.addRow([
                    row.risNo,
                    row.responsibilityCenterCode,
                    row.stockNo,
                    row.item,
                    row.unit,
                    row.quantityIssued ? parseInt(row.quantityIssued, 10) : '',
                    row.unitCost,
                    row.amount
                ]);
                r.font = { name: 'Arial', size: 12 };
            });

            // RECAPIULATION TABLES (side by side)
            worksheet.addRow([]);
            const recapStart = worksheet.lastRow.number + 1;
            worksheet.getCell(`B${recapStart}`).value = 'Recapitulation:';
            worksheet.getCell(`B${recapStart}`).font = { name: 'Arial', size: 12, bold: true };
            worksheet.mergeCells(`B${recapStart}:C${recapStart}`);
            worksheet.getCell(`F${recapStart}`).value = 'Recapitulation:';
            worksheet.getCell(`F${recapStart}`).font = { name: 'Arial', size: 12, bold: true };
            worksheet.mergeCells(`F${recapStart}:H${recapStart}`);
            worksheet.getCell(`B${recapStart+1}`).value = 'Stock No.';
            worksheet.getCell(`C${recapStart+1}`).value = 'Quantity';
            worksheet.getCell(`B${recapStart+2}`).value = filledRows[0]?.stockNo || '';
            worksheet.getCell(`C${recapStart+2}`).value = '111';
            worksheet.getCell(`B${recapStart+3}`).value = 'Less Issuance';
            const minIssueQty = filledRows.length > 0 ? Math.min(...filledRows.map(row => parseFloat(row.quantityIssued) || 0)) : '';
            worksheet.getCell(`C${recapStart+3}`).value = minIssueQty !== '' ? String(minIssueQty) : '';
            worksheet.getCell(`B${recapStart+4}`).value = date || 'December 2024';
            worksheet.getCell(`C${recapStart+4}`).value = '104';
            worksheet.getCell(`F${recapStart+1}`).value = 'Unit Cost';
            worksheet.getCell(`G${recapStart+1}`).value = 'Total Cost';
            worksheet.getCell(`H${recapStart+1}`).value = 'UACS Object Code';
            worksheet.getCell(`F${recapStart+2}`).value = filledRows[0]?.unitCost || '';
            worksheet.getCell(`G${recapStart+2}`).value = filledRows[0]?.amount || '';

            // Certification/Signature Section
            worksheet.addRow([]);
            const noteRow = worksheet.addRow(['Note:', '', '', '', '', '', '', '']);
            worksheet.mergeCells(`A${noteRow.number}:E${noteRow.number}`);
            worksheet.getCell(`A${noteRow.number}`).font = { name: 'Arial', size: 12, bold: true };
            worksheet.getCell(`A${noteRow.number}`).alignment = { vertical: 'middle' };
            worksheet.mergeCells(`F${noteRow.number}:H${noteRow.number}`);
            const certRow = worksheet.addRow([
                'I hereby certify to the correctness of the above information.', '', '', '', '', 'Posted by:', '', '']);
            worksheet.mergeCells(`A${certRow.number}:E${certRow.number}`);
            worksheet.mergeCells(`F${certRow.number}:H${certRow.number}`);
            certRow.font = { name: 'Arial', size: 12 };
            const nameRow = worksheet.addRow([
                'KRIZELLE JANE G. MATIAS', '', '', '', '', '', '', '']);
            worksheet.mergeCells(`A${nameRow.number}:E${nameRow.number}`);
            worksheet.mergeCells(`F${nameRow.number}:H${nameRow.number}`);
            nameRow.font = { name: 'Arial', size: 12 };
            const sigRow = worksheet.addRow([
                'Signature over Printed Name of Supply and/or Property Custodian', '', '', '', '', 'Signature over Printed Name of Designated Account Staff', 'Date', '']);
            worksheet.mergeCells(`A${sigRow.number}:E${sigRow.number}`);
            worksheet.mergeCells(`F${sigRow.number}:G${sigRow.number}`);
            sigRow.font = { name: 'Arial', size: 12 };

            // Set column widths
            worksheet.columns = [
                { width: 22 },  // RIS No.
                { width: 28 },  // Responsibility Center Code
                { width: 18 },  // Stock No.
                { width: 45 },  // Item
                { width: 15 },  // Unit
                { width: 18 },  // Quantity Issued
                { width: 18 },  // Unit Cost
                { width: 30 }   // Amount (wider for long text)
            ];

            // Center-align all table cells (headers and body)
            worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
                row.eachCell({ includeEmpty: true }, function(cell) {
                    // Center table headers and body
                    if (
                        rowNumber >= tableHeader.number &&
                        rowNumber <= tableHeader.number + tableBody.length
                    ) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    }
                    // Center section headers and signature lines
                    if (
                        rowNumber === sectionHeader.number ||
                        rowNumber === tableHeader.number ||
                        rowNumber > worksheet.lastRow.number - 8 // for signature/certification
                    ) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    }
                    cell.font = { name: 'Arial', size: 12, bold: !!cell.font?.bold };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            // Generate filename
            const fileName = `RSMI_Report_${date.replace(/\s+/g, '_') || 'December_2024'}.xlsx`;
            // Save the file (browser-safe)
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            alert('Excel file exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            setError(`Export failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const onExportPDF = () => {
        try {
            setIsLoading(true);
            setError(null);

            if (!rows || rows.length === 0) {
                throw new Error('No data available to export');
            }

            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // --- HEADER ---
            const leftMargin = 13;
            const rightMargin = 13;
            const usableWidth = 210 - leftMargin - rightMargin;
            const logoWidth = 18;
            const logoHeight = 18;
            const logoX = leftMargin;
            const logoY = 12;
            doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
            const centerX = 105;
            let y = 18;
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('Republic of the Philippines', centerX, y, { align: 'center' }); y += 4;
            doc.text('Department of National Defense', centerX, y, { align: 'center' }); y += 4;
            doc.setFont('helvetica', 'bold');
            doc.text('OFFICE OF CIVIL DEFENSE', centerX, y, { align: 'center' }); y += 4;
            doc.text('NATIONAL CAPITAL REGION', centerX, y, { align: 'center' }); y += 5;
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.text('NO. 81 RBA BLDG., 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY', centerX, y, { align: 'center' }); y += 4;
            doc.text('Telephone Number: (02) 421-1918; OPCEN Mobile Number: 0917-8276325', centerX, y, { align: 'center' }); y += 4;
            doc.text('E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com', centerX, y, { align: 'center' }); y += 6;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('REPORT OF SUPPLIES AND MATERIALS ISSUED', centerX, y, { align: 'center' }); y += 5;
            doc.setFontSize(9);
            doc.text(date || 'December 2024', centerX, y, { align: 'center' }); y += 6;

            // --- ENTITY/FUND/SERIAL/DATE ROW ---
            doc.setFontSize(8);
            // First row: Entity Name (left), Serial No. (right)
            doc.setFont('helvetica', 'bold');
            doc.text('Entity Name:', leftMargin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(entityName || '', leftMargin + 22, y);

            doc.setFont('helvetica', 'bold');
            doc.text('Serial No.:', centerX + 40, y);
            doc.setFont('helvetica', 'normal');
            doc.text(serialNo || '', centerX + 60, y);

            y += 5;

            // Second row: Fund Cluster (left), Date (right)
            doc.setFont('helvetica', 'bold');
            doc.text('Fund Cluster:', leftMargin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(fundCluster || '', leftMargin + 22, y);

            doc.setFont('helvetica', 'bold');
            doc.text('Date:', centerX + 40, y);
            doc.setFont('helvetica', 'normal');
            // Leave the date blank for handler to write manually
            // doc.text(date || '', centerX + 60, y);

            y += 6;

            // --- MAIN TABLE ---
            const tableStartY = y;
            const tableHead = [
                [
                    { content: 'To be filled up by the Supply and/or Property Division/Unit', colSpan: 6, styles: { halign: 'center', fontStyle: 'bold' } },
                    { content: 'To be filled up by the Accounting Division/Unit', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold' } }
                ],
                [
                    'RIS No.',
                    'Responsibility Center Code',
                    'Stock No.',
                    'Item',
                    'Unit',
                    'Quantity Issued',
                    'Unit Cost',
                    'Amount'
                ]
            ];
            const filledRows = rows.filter(row => row.risNo || row.stockNo || row.item || row.unit || row.quantityIssued || row.unitCost || row.amount);
            const emptyRowsCount = Math.max(15, 15 - filledRows.length);
            const emptyRows = Array(emptyRowsCount).fill({
                risNo: '',
                responsibilityCenterCode: '',
                stockNo: '',
                item: '',
                unit: '',
                quantityIssued: '',
                unitCost: '',
                amount: ''
            });
            const tableBody = [...filledRows, ...emptyRows].map(row => [
                    row.risNo,
                    row.responsibilityCenterCode,
                    row.stockNo,
                    row.item,
                    row.unit,
                row.quantityIssued ? parseInt(row.quantityIssued, 10) : '',
                    row.unitCost,
                row.amount
            ]);
            // Find the minimum issue quantity for Less Issuance
            const minIssueQty = filledRows.length > 0 ? Math.min(...filledRows.map(row => parseFloat(row.quantityIssued) || 0)) : '';
            autoTable(doc, {
                startY: tableStartY,
                margin: { left: leftMargin, right: rightMargin },
                tableWidth: usableWidth,
                head: tableHead,
                body: tableBody,
                theme: 'grid',
                styles: {
                    fontSize: 7,
                    cellPadding: 1.5,
                    halign: 'center',
                    valign: 'middle',
                },
                headStyles: {
                    fontSize: 7,
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    lineWidth: 0.1,
                    halign: 'center',
                },
                columnStyles: {
                    0: { cellWidth: 20 },  // RIS No.
                    1: { cellWidth: 25 },  // Responsibility Center Code
                    2: { cellWidth: 15 },  // Stock No.
                    3: { cellWidth: 40 },  // Item
                    4: { cellWidth: 15 },  // Unit
                    5: { cellWidth: 20 },  // Quantity Issued
                    6: { cellWidth: 20 },  // Unit Cost
                    7: { cellWidth: 20 },  // Amount
                },
                didDrawPage: () => {
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();
                    doc.setLineWidth(0.7);
                    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
                }
            });
            let finalY = doc.lastAutoTable.finalY + 2;

            // --- RECAPIULATION TABLES ---
            autoTable(doc, {
                startY: finalY,
                margin: { left: leftMargin },
                tableWidth: 60,
                head: [[ 'Recapitulation:', '' ]],
                body: [
                    [ 'Stock No.', 'Quantity' ],
                    [ filledRows[0]?.stockNo || '', '111' ],
                    [ 'Less Issuance', minIssueQty !== '' ? String(minIssueQty) : '' ],
                    [ date || 'December 2024', '104' ],
                    [ '', '' ],
                    [ '', '' ]
                ],
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
                headStyles: { fontSize: 7, fillColor: [255,255,255], textColor: [0,0,0], fontStyle: 'bold', halign: 'left' }
            });
            autoTable(doc, {
                startY: finalY,
                margin: { left: leftMargin + 75 },
                tableWidth: 80,
                head: [[ 'Recapitulation:', '', '' ]],
                body: [
                    [ 'Unit Cost', 'Total Cost', 'UACS Object Code' ],
                    [ filledRows[0]?.unitCost || '', filledRows[0]?.amount || '', '' ],
                    [ '', '', '' ],
                    [ '', '', '' ],
                    [ '', '', '' ],
                    [ '', '', '' ]
                ],
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
                headStyles: { fontSize: 7, fillColor: [255,255,255], textColor: [0,0,0], fontStyle: 'bold', halign: 'left' }
            });
            finalY += 36;

            // Add extra space after recapitulation tables
            finalY += 8;

            // --- CERTIFICATION/SIGNATURE TABLE ---
            autoTable(doc, {
                startY: finalY,
                margin: { left: leftMargin, right: rightMargin },
                tableWidth: usableWidth,
                body: [
                    [
                        { content: 'I hereby certify to the correctness of the above information.', styles: { halign: 'left', fontStyle: 'normal', fontSize: 8 } },
                        { content: 'Posted by:', styles: { halign: 'left', fontStyle: 'normal', fontSize: 8 } }
                    ],
                    [
                        { content: 'KRIZELLE JANE G. MATIAS', styles: { halign: 'left', fontStyle: 'bold', fontSize: 8 } },
                        { content: '', styles: { halign: 'left', fontStyle: 'normal', fontSize: 8 } }
                    ],
                    [
                        { content: 'Signature over Printed Name of Supply and/or Property Custodian', styles: { halign: 'left', fontStyle: 'normal', fontSize: 8 } },
                        { content: 'Signature over Printed Name of Designated Account Staff    Date', styles: { halign: 'left', fontStyle: 'normal', fontSize: 8 } }
                    ]
                ],
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2, halign: 'left', valign: 'middle' },
                head: [],
                didDrawPage: () => {}
            });
            finalY = doc.lastAutoTable.finalY;

            // --- OPEN PDF IN NEW TAB ---
            const pdfDataUrl = doc.output('dataurlstring');
            const newWindow = window.open();
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                    <head>
                        <title>RSMI Report - ${date || 'Report'}</title>
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
                doc.save(`RSMI_Report_${date.replace(/\s+/g, '_') || 'December_2024'}.pdf`);
            }
        } catch (error) {
            console.error('PDF export error:', error);
            setError(`PDF export failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="rsmi-container">
            {error && <div className="error-message">{error}</div>}
            {isLoading && (
                <div className="loading-popup">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <p>Loading...</p>
                    </div>
                </div>
            )}
            <div className="header-top">
                <button className="return-button" onClick={onBack}> &larr; </button>
                <h1>RSMI</h1>
            </div>

            <div className="rsmi-header">
                <div className="header-text">
                    <p>Republic of the Philippines</p>
                    <p>Department of National Defense</p>
                    <p>OFFICE OF CIVIL DEFENSE</p>
                    <p>NATIONAL CAPITAL REGION</p>
                    <p>NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY</p>
                    <p>Telephone no. (02) 421-1918; OPCEN Mobile Number: 0917-827-6325</p>
                    <p>E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com</p>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th className="Item-left-align">Entity Name:</th>
                                <td>
                                    <input
                                        type="text"
                                        value={entityName}
                                        onChange={(e) => setEntityName(e.target.value)}
                                    />
                                </td>
                                <th className="Item-right-align">Fund Cluster :</th>
                                <td className="input-fundcluster-cell">
                                    <input
                                        type="text"
                                        value={fundCluster}
                                        onChange={(e) => setFundCluster(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th className="Item-left-align">Serial No:</th>
                                <td>
                                    <input
                                        type="text"
                                        value={serialNo}
                                        onChange={(e) => setSerialNo(e.target.value)}
                                    />
                                </td>
                                <th className="Item-right-align">Date:</th>
                                <td>
                                    <div className="date-input-container">
                                        <input
                                            type="text"
                                            value={date}
                                            readOnly
                                            onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
                                            placeholder="Select Month/Year"
                                            className="date-input"
                                        />
                                        {showMonthYearPicker && (
                                            <div className="month-year-picker">
                                                <div className="picker-header">
                                                    <select 
                                                        className="year-select"
                                                        onChange={(e) => {
                                                            const selectedYear = e.target.value;
                                                            const currentMonth = document.querySelector('.month-grid button.active')?.textContent;
                                                            if (currentMonth) {
                                                                handleDateSelect(currentMonth, selectedYear);
                                                            }
                                                        }}
                                                    >
                                                        {years.map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="month-grid">
                                                    {months.map(month => (
                                                        <button
                                                            key={month}
                                                            onClick={() => {
                                                                const selectedYear = document.querySelector('.year-select')?.value || new Date().getFullYear();
                                                                handleDateSelect(month, selectedYear);
                                                            }}
                                                            className={date.includes(month) ? 'active' : ''}
                                                        >
                                                            {month.substring(0, 3)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th colSpan="4">
                                    <table className="inner-table">
                                        <thead>
                                            <tr>
                                                <th>RIS No.</th>
                                                <th>Responsibility Center Code</th>
                                                <th>Stock No.</th>
                                                <th>Item</th>
                                                <th>Unit</th>
                                                <th>Quantity Issued</th>
                                                <th>Unit Cost</th>
                                                <th>Amount</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <input type="text" value={row.risNo} readOnly style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center' }} />
                                                    </td>
                                                    <td>
                                                        <input type="text" value={(row.risNo || row.stockNo || row.item || row.unit || row.quantityIssued || row.unitCost || row.amount || row.date) ? '2016' : ''} readOnly style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center' }} />
                                                    </td>
                                                    <td>
                                                        <input type="text" value={row.stockNo} readOnly style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center' }} />
                                                    </td>
                                                    <td>
                                                        <input type="text" value={row.item} readOnly style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center' }} />
                                                    </td>
                                                    <td>
                                                        <input type="text" value={row.unit} readOnly style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center' }} />
                                                    </td>
                                                    <td>
                                                        <input type="text" value={row.quantityIssued ? parseInt(row.quantityIssued, 10) : ''} readOnly style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center' }} />
                                                    </td>
                                                    <td>
                                                        <input type="text" value={row.unitCost} readOnly style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center' }} />
                                                    </td>
                                                    <td>
                                                        <input type="text" value={row.amount} readOnly style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center' }} />
                                                    </td>
                                                    <td>
                                                        <input type="text" value={row.date} readOnly style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center' }} />
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

            <div className="right-image-section">
                <img src={logo} alt="OCD logo" className="vertical-OCD-image" />
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
        </div>
    );
};

export default RSMIPage;