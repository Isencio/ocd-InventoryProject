import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './RISPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const RISPage = () => {
    const [fundCluster, setFundCluster] = useState('');
    const [division, setDivision] = useState('');
    const [sectionUnit, setSectionUnit] = useState('');
    const [responsibilityCenterCode] = useState('2016');
    const [risNo, setRisNo] = useState('');
    const [rows, setRows] = useState([]);

    const navigate = useNavigate();

    const onBack = () => {
        navigate(-1);
    };

    const onExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('RIS');

            // Set default font
            worksheet.properties.defaultRowHeight = 15;
            worksheet.eachRow({ includeEmpty: true }, function(row) {
                row.font = { name: 'Arial', size: 9 };
            });

            // Add header information
            worksheet.addRow(['', '', '', '', '', '', '', '', '']); // For logo row
            worksheet.addRow(['Republic of the Philippines', '', '', '', '', '', '', '', '']);
            worksheet.addRow(['Department of National Defense', '', '', '', '', '', '', '', '']);
            worksheet.addRow(['OFFICE OF CIVIL DEFENSE', '', '', '', '', '', '', '', '']);
            worksheet.addRow(['NATIONAL CAPITAL REGION', '', '', '', '', '', '', '', '']);
            worksheet.addRow(['NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY', '', '', '', '', '', '', '', '']);
            worksheet.addRow(['Telephone Number: (02) 421-1918; OPCEN Mobile Number: 0917-8276325', '', '', '', '', '', '', '', '']);
            worksheet.addRow(['E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com', '', '', '', '', '', '', '', '']);
            worksheet.addRow(['', '', '', '', '', '', '', '', '']);

            // Merge and style header rows
            for (let i = 2; i <= 8; i++) {
                worksheet.mergeCells(`A${i}:I${i}`);
                worksheet.getCell(`A${i}`).alignment = { horizontal: 'center' };
                worksheet.getCell(`A${i}`).font = { name: 'Arial', size: 9 };
            }
            worksheet.getCell('A4').font = { name: 'Arial', size: 9, bold: true };
            worksheet.getCell('A5').font = { name: 'Arial', size: 9, bold: true };
            worksheet.getCell('A9').value = 'REQUISITION AND ISSUE SLIP';
            worksheet.mergeCells('A9:I9');
            worksheet.getCell('A9').alignment = { horizontal: 'center' };
            worksheet.getCell('A9').font = { name: 'Arial', size: 9, bold: true, underline: true };

            // Form fields (all user input, no hardcoded values)
            worksheet.addRow([
                'Fund Cluster :', fundCluster, '', '', '', 'Responsibility Center Code :', responsibilityCenterCode, '', ''
            ]);
            worksheet.getCell('A10').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
            worksheet.getCell('B10').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
            worksheet.getCell('F10').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
            worksheet.getCell('G10').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
            worksheet.addRow([
                'Division :', division, '', '', '', 'RIS No. :', risNo, '', ''
            ]);
            worksheet.getCell('A11').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
            worksheet.getCell('B11').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
            worksheet.getCell('F11').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
            worksheet.getCell('G11').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
            worksheet.addRow([
                'Section/Unit :', sectionUnit, '', '', '', '', '', '', ''
            ]);
            worksheet.getCell('A12').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
            worksheet.getCell('B12').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };

            // Section headers
            worksheet.addRow(['', '', 'Requisition', '', '', 'Stock Available?', '', 'Issue', '']);
            worksheet.mergeCells('C13:D13');
            worksheet.mergeCells('F13:G13');
            worksheet.mergeCells('H13:I13');
            worksheet.getCell('C13').alignment = { horizontal: 'center' };
            worksheet.getCell('F13').alignment = { horizontal: 'center' };
            worksheet.getCell('H13').alignment = { horizontal: 'center' };
            worksheet.getCell('C13').font = { name: 'Arial', size: 9, bold: true };
            worksheet.getCell('F13').font = { name: 'Arial', size: 9, bold: true };
            worksheet.getCell('H13').font = { name: 'Arial', size: 9, bold: true };

            // Table headers
            worksheet.addRow(['Stock No.', 'Unit', 'Description', 'Quantity', 'Yes', 'No', 'Quantity', 'Remarks', '']);
            worksheet.getRow(14).font = { name: 'Arial', size: 9, bold: true };
            worksheet.getRow(14).alignment = { horizontal: 'center', vertical: 'middle' };

            // Table body (user input)
            rows.forEach((row) => {
                worksheet.addRow([
                    row.stockNo || '',
                    row.unit || '',
                    row.description || '',
                    row.quantity || '',
                    row.yes || '',
                    row.no || '',
                    row.quantity2 || '',
                    row.remarks || '',
                    ''
                ]);
            });
            // Add remaining empty rows if needed
            const remainingRows = 14 - rows.length;
            for (let i = 0; i < remainingRows; i++) {
                worksheet.addRow(['', '', '', '', '', '', '', '', '']);
            }

            // Purpose and Note rows (Purpose has value, Note is empty, both yellow, only Purpose is bold)
            const purposeNoteValue = 'raising of alert level of mmdrrmc and ocd ncr operations center to bravo protocol icow local governance summit on 20-24 august 2024';
            const purposeRow = worksheet.addRow(['Purpose:', purposeNoteValue]);
            worksheet.mergeCells(`B${purposeRow.number}:I${purposeRow.number}`);
            worksheet.getCell(`A${purposeRow.number}`).font = { bold: false };
            worksheet.getCell(`A${purposeRow.number}`).alignment = { horizontal: 'left', vertical: 'middle' };
            worksheet.getCell(`B${purposeRow.number}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
            worksheet.getCell(`B${purposeRow.number}`).font = { bold: true };
            worksheet.getCell(`B${purposeRow.number}`).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
            const noteRow = worksheet.addRow(['Note:', '']);
            worksheet.mergeCells(`B${noteRow.number}:I${noteRow.number}`);
            worksheet.getCell(`A${noteRow.number}`).font = { bold: false };
            worksheet.getCell(`A${noteRow.number}`).alignment = { horizontal: 'left', vertical: 'middle' };
            worksheet.getCell(`B${noteRow.number}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
            worksheet.getCell(`B${noteRow.number}`).font = { bold: false };
            worksheet.getCell(`B${noteRow.number}`).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

            // Set column widths (wider for labels and values, signature columns wider, extra wide for Responsibility Center Code)
            worksheet.columns = [
                { width: 25 },  // A: For labels
                { width: 35 },  // B: For values
                { width: 30 },  // C
                { width: 15 },  // D
                { width: 15 },  // E
                { width: 35 },  // F: Responsibility Center Code (wider)
                { width: 25 },  // G
                { width: 40 },  // H: For signature/remarks, extra wide for merging
                { width: 10 }   // I
            ];

            // Add borders to all cells
            const lastRow = worksheet.rowCount;
            for (let i = 10; i <= lastRow; i++) {
                for (let j = 1; j <= 9; j++) {
                    const cell = worksheet.getCell(i, j);
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                }
            }

            // Signature section
            worksheet.addRow(['Signature :', '', '', '', '', '', '', '', '']);
            worksheet.addRow(['Printed Name :', '', 'GEORGE F. KEYSER', '', 'KRIZELLE JANE G. MATIAS', '', '', '', '']);
            worksheet.addRow(['Designation :', '', 'Regional Director', '', 'Supply Accountable Officer', '', '', '', '']);
            // Merge 'Supply Accountable Officer' with the next cell to the right (columns E and F)
            const designationRowNum = worksheet.lastRow.number;
            worksheet.mergeCells(`E${designationRowNum}:F${designationRowNum}`);
            worksheet.getCell(`E${designationRowNum}`).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
            worksheet.addRow(['Date :', '', '', '', '', '', '', '', '']);
            worksheet.addRow(['', 'Requested by:', 'Approved by:', 'Issued by:', 'Received by:', '', '', '', '']);

            // Save the workbook
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `RIS_${risNo || 'Form'}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
        }
    };

    const onExportPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const centerX = pageWidth / 2;
        let y = 12;

        // Header with logos (left and right)
        doc.addImage(logo, 'PNG', 10, 8, 18, 18);
        // Right logo placeholder (replace with your actual logo if available)
        doc.setDrawColor(0);
        doc.setFillColor(255,255,255);
        doc.rect(pageWidth - 28, 8, 18, 18, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Republic of the Philippines', centerX, y, { align: 'center' }); y += 5;
        doc.text('Department of National Defense', centerX, y, { align: 'center' }); y += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('OFFICE OF CIVIL DEFENSE', centerX, y, { align: 'center' }); y += 5;
        doc.text('NATIONAL CAPITAL REGION', centerX, y, { align: 'center' }); y += 5;
        doc.setFont('helvetica', 'normal');
        doc.text('NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY', centerX, y, { align: 'center' }); y += 4;
        doc.text('Telephone Number: (02) 421-1918; OPCEN Mobile Number: 0917-8276325', centerX, y, { align: 'center' }); y += 4;
        doc.text('E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com', centerX, y, { align: 'center' }); y += 7;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('REQUISITION AND ISSUE SLIP', centerX, y, { align: 'center' }); y += 7;

        // Entity/Fund/Serial/Date section with yellow highlights
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        autoTable(doc, {
            startY: y,
            body: [
                [
                    { content: 'Fund Cluster :', styles: { fontStyle: 'bold' } },
                    fundCluster,
                    '',
                    '',
                    '',
                    { content: 'FLEETCARD NO. :', styles: { fillColor: [255,255,0], fontStyle: 'bold' } },
                    { content: '738766 030526 892001', styles: { fillColor: [255,255,0] } },
                    ''
                ],
                [
                    { content: 'Division :', styles: { fillColor: [255,255,0], fontStyle: 'bold' } },
                    { content: '', colSpan: 6, styles: { fillColor: [255,255,0] } }
                ],
                [
                    { content: 'Office :', styles: { fillColor: [255,255,0], fontStyle: 'bold' } },
                    { content: '', colSpan: 6, styles: { fillColor: [255,255,0] } }
                ],
                [
                    { content: '', colSpan: 5 },
                    { content: 'Responsibility Center Code :', styles: { fontStyle: 'bold' } },
                    '2016',
                    ''
                ],
                [
                    { content: '', colSpan: 5 },
                    { content: 'RIS No. :', styles: { fontStyle: 'bold', fillColor: [191, 205, 219] } },
                    { content: '', styles: { fillColor: [191, 205, 219] } },
                    { content: '', styles: { fillColor: [191, 205, 219] } }
                ]
            ],
            theme: 'grid',
            styles: { fontSize: 9, font: 'helvetica', halign: 'center', valign: 'middle' },
            columnStyles: {
                0: { cellWidth: 28 },
                1: { cellWidth: 28 },
                2: { cellWidth: 10 },
                3: { cellWidth: 10 },
                4: { cellWidth: 10 },
                5: { cellWidth: 38 },
                6: { cellWidth: 38 },
                7: { cellWidth: 20 }
            },
            head: []
        });
        y = doc.lastAutoTable.finalY;

        // Table headers and body
        const tableColWidths = [25, 15, 45, 20, 15, 15, 20, 92];
        autoTable(doc, {
            startY: y,
            head: [[
                'Stock No.', 'Unit', 'Description', 'Quantity', 'Yes', 'No', 'Quantity', 'Remarks'
            ]],
            body: [
                // First row: L in Unit, yellow Description, multi-line yellow Remarks
                ['', 'L', { content: '', styles: { fillColor: [255,255,0] } }, '', '', '', '', { content: ['Issued:', 'Balance:', 'Plate Number:', 'Type of Car:'].join('\n'), styles: { fillColor: [255,255,0], halign: 'left', valign: 'top' } }],
                // Add enough empty rows to fill the page
                ...Array(13).fill(['', '', '', '', '', '', '', ''])
            ],
            theme: 'grid',
            styles: { fontSize: 9, font: 'helvetica', halign: 'center', valign: 'middle', lineWidth: 0.2, lineColor: [0,0,0] },
            headStyles: { fontSize: 9, font: 'helvetica', fillColor: [255,255,255], textColor: [0,0,0], fontStyle: 'bold', halign: 'center', valign: 'middle', lineWidth: 0.2, lineColor: [0,0,0] },
            columnStyles: Object.fromEntries(tableColWidths.map((w, i) => [i, { cellWidth: w }])),
            didDrawCell: function(data) {
                // Set fixed row height for all table rows
                if (data.section === 'body' || data.section === 'head') {
                    const desiredHeight = 7; // mm, adjusted to match form
                    if (data.cell.height < desiredHeight) {
                        data.cell.height = desiredHeight;
                    }
                }
            }
        });
        y = doc.lastAutoTable.finalY;

        // Purpose and Note (yellow, merged, Note value bold)
        autoTable(doc, {
            startY: y,
            body: [
                [
                    { content: 'Purpose:', styles: { fillColor: [255,255,0], fontStyle: 'bold' } },
                    { content: '', colSpan: 7, styles: { fillColor: [255,255,0] } }
                ],
                [
                    { content: 'Note:', styles: { fillColor: [255,255,0], fontStyle: 'bold' } },
                    { content: 'raisinf of alert level of mmdrrmc and ocd ncr operations center to bravo protocol icow local governance summit on 20-24 august 2024', colSpan: 7, styles: { fillColor: [255,255,0], fontStyle: 'bold', textColor: [0,0,0] } }
                ]
            ],
            theme: 'grid',
            styles: { fontSize: 9, font: 'helvetica', halign: 'left', valign: 'middle', lineWidth: 0.2, lineColor: [0,0,0] },
            columnStyles: Object.fromEntries(tableColWidths.map((w, i) => [i, { cellWidth: w }])),
            didDrawCell: function(data) {
                // Set fixed row height for all table rows
                const desiredHeight = 7;
                if (data.cell.height < desiredHeight) {
                    data.cell.height = desiredHeight;
                }
            }
        });
        y = doc.lastAutoTable.finalY;

        // Signature section (4 columns, no merged cells, all borders)
        autoTable(doc, {
            startY: y + 2,
            head: [[
                { content: 'Requested by:', styles: { fontStyle: 'bold' } },
                { content: 'Approved by:', styles: { fontStyle: 'bold' } },
                { content: 'Issued by:', styles: { fontStyle: 'bold' } },
                { content: 'Received by:', styles: { fontStyle: 'bold' } }
            ]],
            body: [
                [ 'Signature :', 'Signature :', 'Signature :', 'Signature :' ],
                [ 'Printed Name :', { content: 'GEORGE F. KEYSER', styles: { fontStyle: 'bold' } }, { content: 'KRIZELLE JANE G. MATIAS', styles: { fontStyle: 'bold' } }, '' ],
                [ 'Designation :', { content: 'Regional Director', styles: { fontStyle: 'bold' } }, { content: 'Supply Accountable Officer', styles: { fontStyle: 'bold' } }, '' ],
                [ 'Date :', '', '', '' ]
            ],
            theme: 'grid',
            styles: { fontSize: 9, font: 'helvetica', halign: 'left', valign: 'middle', lineWidth: 0.2, lineColor: [0,0,0] },
            columnStyles: {
                0: { cellWidth: 70 },
                1: { cellWidth: 70 },
                2: { cellWidth: 70 },
                3: { cellWidth: 70 }
            },
            didDrawCell: function(data) {
                // Set fixed row height for all table rows
                const desiredHeight = 7;
                if (data.cell.height < desiredHeight) {
                    data.cell.height = desiredHeight;
                }
            }
        });

        // PDF Preview in new tab with only the PDF (no buttons)
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const previewHtml = `
          <html>
          <head>
            <title>RIS PDF Preview</title>
            <style>
              body { margin: 0; padding: 0; }
              iframe { width: 100vw; height: 100vh; border: none; }
            </style>
          </head>
          <body>
            <iframe src="${pdfUrl}"></iframe>
          </body>
          </html>
        `;
        const newWindow = window.open();
        newWindow.document.write(previewHtml);
        newWindow.document.close();
    };

    const handleInputChange = (index, field, value) => {
        const updatedRows = rows.map((row, i) => {
            if (i === index) {
                // If checking "Yes", uncheck "No" and vice versa
                if (field === 'yes' && value === '/') {
                    return { ...row, yes: '/', no: '' };
                } else if (field === 'no' && value === '/') {
                    return { ...row, yes: '', no: '/' };
                }
                return { ...row, [field]: value };
            }
            return row;
        });
        setRows(updatedRows);
    };

    const addNewRow = () => {
        setRows([...rows, {
            stockNo: '',
            unit: '',
            description: '',
            quantity: '',
            yes: '',
            no: '',
            quantity2: '',
            remarks: ''
        }]);
    };

    return (
        <div className="ris-container">
            <div className="header-top">
                <button className="return-button" onClick={onBack}> &larr; </button>
                <h1>RIS</h1>
            </div>

            <div className="ris-header">
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
                                <th className="Item-left-align">Fund Cluster :</th>
                                <td>
                                    <input
                                        type="text"
                                        value={fundCluster}
                                        onChange={(e) => setFundCluster(e.target.value)}
                                    />
                                </td>
                                <th className="Item-right-align">Responsibility Center Code :</th>
                                <td className="input-responsibilityCenterCode-cell">
                                    <b>{responsibilityCenterCode}</b>
                                </td>
                            </tr>
                            <tr>
                                <th className="Item-left-align">Division:</th>
                                <td>
                                    <input
                                        type="text"
                                        value={division}
                                        onChange={(e) => setDivision(e.target.value)}
                                    />
                                </td>
                                <th className="Item-right-align">RIS No. :</th>
                                <td>
                                    <input
                                        type="text"
                                        value={risNo}
                                        onChange={(e) => setRisNo(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th className="Item-left-align">Section/Unit :</th>
                                <td>
                                    <input
                                        type="text"
                                        value={sectionUnit}
                                        onChange={(e) => setSectionUnit(e.target.value)}
                                    />
                                </td>
                                <th className="Item-right-align">Stock Available?</th>
                                <td>
                                    <span>Issue</span>
                                </td>
                            </tr>
                            <tr>
                                <th colSpan="4">
                                    <table className="inner-table">
                                        <thead>
                                            <tr>
                                                <th colSpan="4">Requisition</th>
                                                <th colSpan="2">Stock Available</th>
                                                <th colSpan="2">Issue</th>
                                            </tr>
                                            <tr>
                                                <th>Stock No.</th>
                                                <th>Unit</th>
                                                <th>Description</th>
                                                <th>Quantity</th>
                                                <th>Yes</th>
                                                <th>No</th>
                                                <th>Quantity</th>
                                                <th>Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.stockNo}
                                                            onChange={(e) => handleInputChange(index, 'stockNo', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.unit}
                                                            onChange={(e) => handleInputChange(index, 'unit', e.target.value)}
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
                                                            value={row.quantity}
                                                            onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={row.yes === '/'}
                                                            onChange={(e) => handleInputChange(index, 'yes', e.target.checked ? '/' : '')}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={row.no === '/'}
                                                            onChange={(e) => handleInputChange(index, 'no', e.target.checked ? '/' : '')}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.quantity2}
                                                            onChange={(e) => handleInputChange(index, 'quantity2', e.target.value)}
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
                    <button onClick={addNewRow} className="add-row-button">
                        + Add Row
                    </button>
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

export default RISPage;