import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import './RSMIPage.css';
import logo from '../../../../Assets/OCD-main.jpg';
import { supabase } from '../../../../supabase';

const RSMIPage = () => {
    const [entityName, setEntityName] = useState('');
    const [fundCluster, setFundCluster] = useState('');
    const [serialNo, setSerialNo] = useState('');
    const [date, setDate] = useState('');
    const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rows, setRows] = useState([
        {
            risNo: '',
            responsibilityCenterCode: '',
            stockNo: '',
            item: '',
            unit: '',
            quantityIssued: '',
            unitCost: '',
            amount: '',
            date: ''
        },
        {
            risNo: '',
            responsibilityCenterCode: '',
            stockNo: '',
            item: '',
            unit: '',
            quantityIssued: '',
            unitCost: '',
            amount: '',
            date: ''
        },
        {
            risNo: '',
            responsibilityCenterCode: '',
            stockNo: '',
            item: '',
            unit: '',
            quantityIssued: '',
            unitCost: '',
            amount: '',
            date: ''
        },
        {
            risNo: '',
            responsibilityCenterCode: '',
            stockNo: '',
            item: '',
            unit: '',
            quantityIssued: '',
            unitCost: '',
            amount: '',
            date: ''
        },
        {
            risNo: '',
            responsibilityCenterCode: '',
            stockNo: '',
            item: '',
            unit: '',
            quantityIssued: '',
            unitCost: '',
            amount: '',
            date: ''
        }
    ]);

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

            const { data, error } = await supabase
                .from('stock_cards')
                .select('*')
                .gte('date', startDate)
                .lte('date', endDate)
                .gt('issueqty', 0)
                .order('date', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                throw new Error(`No RSMI data found for ${month} ${year}`);
            }

            // Process the data to match RSMI format
            const processedData = data.map(item => ({
                risNo: item.reference || 'N/A',
                responsibilityCenterCode: '2016',
                stockNo: item.stocknumber || 'N/A',
                item: item.item || item.description || 'N/A',
                unit: item.unitofmeasurement || 'N/A',
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
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('RSMI');

            // Set default font
            worksheet.properties.defaultRowHeight = 15;

            // Add report title
            const titleRow = worksheet.addRow(['REPORT OF SUPPLIES AND MATERIALS ISSUED']);
            titleRow.font = { bold: true, size: 14 };
            titleRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells('A1:H1');

            // Add date
            const dateRow = worksheet.addRow([date || 'December 2024']);
            dateRow.font = { bold: true };
            dateRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells('A2:H2');
            worksheet.addRow([]);

            // Add entity name and fund cluster
            worksheet.addRow(['Entity Name:', entityName, 'Fund Cluster:', fundCluster]);
            worksheet.mergeCells('B4:C4');
            worksheet.mergeCells('D4:E4');
            worksheet.addRow([]);

            // Add table headers
            const headerRow1 = worksheet.addRow([
                '', '', '', 'To be filled up by the Supply and/or Property Division/Unit',
                '', 'To be filled up by the Accounting Division/Unit', '', ''
            ]);
            headerRow1.font = { bold: true };
            worksheet.mergeCells('D5:F5');

            const headerRow2 = worksheet.addRow([
                'RIS No.', 'Responsibility Center Code', 'Stock No.', 'Item', 
                'Unit', 'Quantity Issued', 'Unit Cost', 'Amount', 'Date'
            ]);
            headerRow2.font = { bold: true };

            // Add data rows
            rows.forEach(row => {
                worksheet.addRow([
                    row.risNo,
                    row.responsibilityCenterCode,
                    row.stockNo,
                    row.item,
                    row.unit,
                    row.quantityIssued ? parseInt(row.quantityIssued, 10) : '',
                    row.unitCost,
                    row.amount,
                    row.date
                ]);
            });

            // Set column widths
            worksheet.columns = [
                { width: 15 },  // RIS No.
                { width: 20 },  // Responsibility Center Code
                { width: 10 },  // Stock No.
                { width: 30 },  // Item
                { width: 10 },   // Unit
                { width: 15 },  // Quantity Issued
                { width: 12 },   // Unit Cost
                { width: 12 },    // Amount
                { width: 15 }    // Date
            ];

            // Add borders to all cells
            const lastRow = worksheet.rowCount;
            for (let i = 4; i <= lastRow; i++) {
                for (let j = 1; j <= 8; j++) {
                    const cell = worksheet.getCell(i, j);
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                }
            }

            // Format number cells
            for (let i = 6; i <= lastRow; i++) {
                // Unit Cost and Amount
                worksheet.getCell(`G${i}`).numFmt = '#,##0.00';
                worksheet.getCell(`H${i}`).numFmt = '#,##0.00';
            }

            // Save the workbook
            await workbook.xlsx.writeFile(`RSMI_Report_${date.replace(/\s+/g, '_') || 'December_2024'}.xlsx`);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
        }
    };

    const onExportPDF = () => {
        const doc = new jsPDF({
            orientation: 'landscape'
        });
        
        // Report title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('REPORT OF SUPPLIES AND MATERIALS ISSUED', 140, 15, { align: 'center' });
        
        // Date
        doc.text(date || 'December 2024', 140, 22, { align: 'center' });
        
        // Entity name and fund cluster
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Entity Name: ${entityName}`, 20, 32);
        doc.text(`Fund Cluster: ${fundCluster}`, 100, 32);
        
        // Table headers
        const startY = 40;
        const cellWidth = 25;
        const cellHeight = 10;
        
        // Header note
        doc.setFont('helvetica', 'bold');
        doc.text('To be filled up by the Supply and/or Property Division/Unit', 20, startY + 6);
        doc.text('To be filled up by the Accounting Division/Unit', 150, startY + 6);
        
        // Main headers
        const mainHeaders = [
            'RIS No.', 'Responsibility Center Code', 'Stock No.', 
            'Item', 'Unit', 'Quantity Issued', 'Unit Cost', 'Amount', 'Date'
        ];
        
        mainHeaders.forEach((header, i) => {
            doc.text(header, 20 + (i * cellWidth), startY + 16);
        });
        
        // Table data
        doc.setFont('helvetica', 'normal');
        rows.forEach((row, rowIndex) => {
            const y = startY + 26 + (rowIndex * cellHeight);
            const rowData = [
                row.risNo,
                row.responsibilityCenterCode,
                row.stockNo,
                row.item,
                row.unit,
                row.quantityIssued,
                row.unitCost,
                row.amount,
                row.date
            ];
            
            rowData.forEach((cell, i) => {
                doc.text(cell, 20 + (i * cellWidth), y);
            });
        });
        
        // Add borders
        for (let i = 0; i < rows.length; i++) {
            for (let j = 0; j < mainHeaders.length; j++) {
                doc.rect(20 + (j * cellWidth), startY + 20 + (i * cellHeight), cellWidth, cellHeight);
            }
        }
        
        doc.save(`RSMI_Report_${date.replace(/\s+/g, '_') || 'December_2024'}.pdf`);
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
        <div className="rsmi-container">
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