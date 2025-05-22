import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import './OtherRSMIPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const OtherRSMIPage = () => {
    const [entityName, setEntityName] = useState('');
    const [fundCluster, setFundCluster] = useState('');
    const [serialNo, setSerialNo] = useState('');
    const [date, setDate] = useState('');
    const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [rows, setRows] = useState(Array(5).fill({
        risNo: '',
        responsibilityCenterCode: '',
        stockNo: '',
        item: '',
        unit: '',
        quantityIssued: '',
        unitCost: '',
        amount: '',
    }));

    const navigate = useNavigate();

    const months = [
        'January', 'February', 'March', 'April', 
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];
    
    const years = Array.from({length: 10}, (_, i) => new Date().getFullYear() - i);

    const onBack = () => {
        navigate(-1);
    };

    const handleDateSelect = (month, year) => {
        setDate(`${month}/${year}`);
        setShowMonthYearPicker(false);
    };

    const toggleExportMenu = () => {
        setShowExportOptions(!showExportOptions);
    };

    const onExportExcel = async () => {
        // Create a new workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('RSMI');

        // Add header rows
        worksheet.addRow(['Republic of the Philippines']);
        worksheet.addRow(['Department of National Defense']);
        worksheet.addRow(['OFFICE OF CIVIL DEFENSE']);
        worksheet.addRow(['NATIONAL CAPITAL REGION']);
        worksheet.addRow(['NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY']);
        worksheet.addRow(['Telephone No: (02) 421-1918; OPCEN Mobile Number: 0917-827-6325']);
        worksheet.addRow(['E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com']);
        worksheet.addRow([]);
        worksheet.addRow(['RSMI']);
        worksheet.addRow([]);

        // Add entity information
        worksheet.addRow(['Entity Name:', entityName, 'Fund Cluster:', fundCluster]);
        worksheet.addRow(['Serial No:', serialNo, 'Date:', date]);
        worksheet.addRow([]);

        // Add table headers
        worksheet.addRow([
            'RIS No.',
            'Responsibility Center Code',
            'Stock No.',
            'Item',
            'Unit',
            'Quantity Issued',
            'Unit Cost',
            'Amount'
        ]);

        // Add data rows
        rows.forEach(row => {
            worksheet.addRow([
                row.risNo,
                row.responsibilityCenterCode,
                row.stockNo,
                row.item,
                row.unit,
                row.quantityIssued,
                row.unitCost,
                row.amount
            ]);
        });

        // Set column widths
        worksheet.columns = [
            { width: 15 }, // RIS No.
            { width: 25 }, // Responsibility Center Code
            { width: 15 }, // Stock No.
            { width: 40 }, // Item
            { width: 10 }, // Unit
            { width: 15 }, // Quantity Issued
            { width: 15 }, // Unit Cost
            { width: 15 }  // Amount
        ];

        // Generate Excel file and trigger download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'RSMI_Inventory.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        setShowExportOptions(false);
    };

    const onExportPDF = () => {
        // PDF export functionality would go here
        alert('PDF export functionality would be implemented here');
        setShowExportOptions(false);
    };

    const handleAddRow = () => {
        setRows([...rows, {
            risNo: '',
            responsibilityCenterCode: '',
            stockNo: '',
            item: '',
            unit: '',
            quantityIssued: '',
            unitCost: '',
            amount: '',
        }]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddRow();
        }
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
                                        onKeyDown={handleKeyDown}
                                    />
                                </td>
                                <th className="Item-right-align">Fund Cluster :</th>
                                <td className="input-fundcluster-cell">
                                    <input
                                        type="text"
                                        value={fundCluster}
                                        onChange={(e) => setFundCluster(e.target.value)}
                                        onKeyDown={handleKeyDown} 
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
                                        onKeyDown={handleKeyDown}
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
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.risNo}
                                                            onChange={(e) => handleInputChange(index, 'risNo', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.responsibilityCenterCode}
                                                            onChange={(e) => handleInputChange(index, 'responsibilityCenterCode', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.stockNo}
                                                            onChange={(e) => handleInputChange(index, 'stockNo', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.item}
                                                            onChange={(e) => handleInputChange(index, 'item', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.unit}
                                                            onChange={(e) => handleInputChange(index, 'unit', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.quantityIssued}
                                                            onChange={(e) => handleInputChange(index, 'quantityIssued', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.unitCost}
                                                            onChange={(e) => handleInputChange(index, 'unitCost', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.amount}
                                                            onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                                                            onKeyDown={handleKeyDown}
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

            {/* Export button in bottom right with pop-up menu */}
            <div className={`export-container ${showExportOptions ? 'active' : ''}`}>
                <button className="export-button" onClick={toggleExportMenu}>
                    Export
                </button>
                {showExportOptions && (
                    <div className="export-options">
                        <button onClick={onExportExcel}>Export as Excel</button>
                        <button onClick={onExportPDF}>Export as PDF</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OtherRSMIPage;