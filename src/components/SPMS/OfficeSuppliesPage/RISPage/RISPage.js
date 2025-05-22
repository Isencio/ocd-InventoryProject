import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import './RISPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const RISPage = () => {
    const [fundCluster, setFundCluster] = useState('');
    const [division, setDivision] = useState('');
    const [sectionUnit, setSectionUnit] = useState('');
    const [responsibilityCenterCode, setResponsibilityCenterCode] = useState('2016');
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

            // Add header information
            worksheet.addRow(['Republic of the Philippines']);
            worksheet.addRow(['Department of National Defense']);
            worksheet.addRow(['OFFICE OF CIVIL DEFENSE']);
            worksheet.addRow(['NATIONAL CAPITAL REGION']);
            worksheet.addRow(['NQ. 81BBA BLDG, 15TH AVENUE, MUIPHY, CLIBAD, QUEZON CITY']);
            worksheet.addRow(['Telephone Number: (02)421-1918, DPCEN Mobile Number: 0317-8276325']);
            worksheet.addRow(['E-Mail Address: not@ood.gov.ph / cividefensenot@gmail.com']);
            worksheet.addRow([]);

            // Add title
            const titleRow = worksheet.addRow(['REQUISITION AND ISSUE SLIP']);
            titleRow.font = { bold: true, size: 14 };
            titleRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells('A8:H8');
            worksheet.addRow([]);

            // Add form fields
            worksheet.addRow(['Fund Cluster :', fundCluster, '', '', '', 'Responsibility Center Code :', responsibilityCenterCode]);
            worksheet.mergeCells('B10:D10');
            worksheet.addRow(['Division:', division, '', '', '', 'RIS No. :', risNo]);
            worksheet.mergeCells('B11:D11');
            worksheet.addRow(['Section/Unit :', sectionUnit, '', '', '', 'Stock Available?', '', 'Issue']);
            worksheet.mergeCells('B12:D12');
            worksheet.mergeCells('F12:G12');
            worksheet.addRow([]);

            // Add table headers
            const headerRow1 = worksheet.addRow([
                '', '', 'Requisition', '', '', 'Stock Available', '', 'Issue'
            ]);
            headerRow1.font = { bold: true };
            worksheet.mergeCells('C14:E14');
            worksheet.mergeCells('F14:G14');

            const headerRow2 = worksheet.addRow([
                'Stock No.', 'Unit', 'Description', 'Quantity', '', 'Yes', 'No', 'Quantity', 'Remarks'
            ]);
            headerRow2.font = { bold: true };

            // Add data rows
            rows.forEach(row => {
                worksheet.addRow([
                    row.stockNo,
                    row.unit,
                    row.description,
                    row.quantity,
                    '',
                    row.yes,
                    row.no,
                    row.quantity2,
                    row.remarks
                ]);
            });

            // Set column widths
            worksheet.columns = [
                { width: 10 },  // Stock No.
                { width: 8 },   // Unit
                { width: 30 }, // Description
                { width: 10 }, // Quantity
                { width: 5 },  // Empty
                { width: 8 },   // Yes
                { width: 8 },   // No
                { width: 10 }, // Quantity (Issue)
                { width: 25 }  // Remarks
            ];

            // Add borders to all cells
            const lastRow = worksheet.rowCount;
            for (let i = 13; i <= lastRow; i++) {
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

            // Save the workbook
            await workbook.xlsx.writeFile(`RIS_${risNo || 'Form'}.xlsx`);
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
        doc.text('NQ. 81BBA BLDG, 15TH AVENUE, MUIPHY, CLIBAD, QUEZON CITY', 140, 34, { align: 'center' });
        doc.text('Telephone Number: (02)421-1918, DPCEN Mobile Number: 0317-8276325', 140, 40, { align: 'center' });
        doc.text('E-Mail Address: not@ood.gov.ph / cividefensenot@gmail.com', 140, 46, { align: 'center' });
        
        // Title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('REQUISITION AND ISSUE SLIP', 140, 56, { align: 'center' });
        
        // Form fields
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fund Cluster : ${fundCluster}`, 20, 66);
        doc.text(`Responsibility Center Code : ${responsibilityCenterCode}`, 100, 66);
        doc.text(`Division: ${division}`, 20, 76);
        doc.text(`RIS No. : ${risNo}`, 100, 76);
        doc.text(`Section/Unit : ${sectionUnit}`, 20, 86);
        doc.text('Stock Available?', 100, 86);
        doc.text('Issue', 150, 86);
        
        // Table headers
        const startY = 96;
        const cellWidth = 25;
        const cellHeight = 10;
        
        // Main headers
        doc.setFont('helvetica', 'bold');
        doc.text('Requisition', 60, startY);
        doc.text('Stock Available', 130, startY);
        doc.text('Issue', 180, startY);
        
        // Column headers
        doc.text('Stock No.', 20, startY + 10);
        doc.text('Unit', 45, startY + 10);
        doc.text('Description', 70, startY + 10);
        doc.text('Quantity', 120, startY + 10);
        doc.text('Yes', 145, startY + 10);
        doc.text('No', 170, startY + 10);
        doc.text('Quantity', 195, startY + 10);
        doc.text('Remarks', 220, startY + 10);
        
        // Table data
        doc.setFont('helvetica', 'normal');
        rows.forEach((row, rowIndex) => {
            const y = startY + 20 + (rowIndex * cellHeight);
            const rowData = [
                row.stockNo,
                row.unit,
                row.description,
                row.quantity,
                row.yes,
                row.no,
                row.quantity2,
                row.remarks
            ];
            
            // Stock No
            doc.text(rowData[0], 20, y);
            // Unit
            doc.text(rowData[1], 45, y);
            // Description
            doc.text(rowData[2], 70, y);
            // Quantity
            doc.text(rowData[3], 120, y);
            // Yes
            doc.text(rowData[4], 145, y);
            // No
            doc.text(rowData[5], 170, y);
            // Quantity (Issue)
            doc.text(rowData[6], 195, y);
            // Remarks
            doc.text(rowData[7], 220, y);
        });
        
        // Add borders
        for (let i = 0; i < rows.length; i++) {
            // Stock No
            doc.rect(20, startY + 15 + (i * cellHeight), 25, cellHeight);
            // Unit
            doc.rect(45, startY + 15 + (i * cellHeight), 25, cellHeight);
            // Description
            doc.rect(70, startY + 15 + (i * cellHeight), 50, cellHeight);
            // Quantity
            doc.rect(120, startY + 15 + (i * cellHeight), 25, cellHeight);
            // Yes
            doc.rect(145, startY + 15 + (i * cellHeight), 25, cellHeight);
            // No
            doc.rect(170, startY + 15 + (i * cellHeight), 25, cellHeight);
            // Quantity (Issue)
            doc.rect(195, startY + 15 + (i * cellHeight), 25, cellHeight);
            // Remarks
            doc.rect(220, startY + 15 + (i * cellHeight), 50, cellHeight);
        }
        
        doc.save(`RIS_${risNo || 'Form'}.pdf`);
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