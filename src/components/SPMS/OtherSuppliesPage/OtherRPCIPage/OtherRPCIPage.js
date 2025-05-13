import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import './OtherRPCIPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const OtherRPCIPage = () => {
    const [rows, setRows] = useState(Array(5).fill({
        article: '',
        description: '',
        stockNumber: '',
        unitofMeasure: '',
        unitValue: '',
        balancePerCard: '',
        onhandPerCount: '',
        shortageOverage: '',
        totalCost: '',
        remarks: ''
    }));
    
    const navigate = useNavigate();

    const onBack = () => {
        navigate(-1);
    };

    const onExport = async () => {
        // Create a new workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('OtherSuppliesRPCI');

        // Add header rows
        worksheet.addRow(['Republic of the Philippines']);
        worksheet.addRow(['Department of National Defense']);
        worksheet.addRow(['OFFICE OF CIVIL DEFENSE']);
        worksheet.addRow(['NATIONAL CAPITAL REGION']);
        worksheet.addRow(['NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY']);
        worksheet.addRow(['Telephone No: (02) 421-1918; OPCEN Mobile Number: 0917-827-6325']);
        worksheet.addRow(['E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com']);
        worksheet.addRow([]);
        worksheet.addRow(['OTHER SUPPLIES RPCI']);
        worksheet.addRow([]);

        // Add table headers
        worksheet.addRow([
            'Article',
            'Description',
            'Stock Number',
            'Unit of Measure',
            'Unit Value',
            'Balance Per Card',
            'On Hand Per Count',
            'Shortage/Overage',
            'Total Cost',
            'Remarks'
        ]);

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
            { width: 15 }, // Article
            { width: 40 }, // Description
            { width: 15 }, // Stock Number
            { width: 15 }, // Unit of Measure
            { width: 15 }, // Unit Value
            { width: 15 }, // Balance Per Card
            { width: 15 }, // On Hand Per Count
            { width: 15 }, // Shortage/Overage
            { width: 15 }, // Total Cost
            { width: 20 }  // Remarks
        ];

        // Generate Excel file and trigger download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'OtherSupplies_RPCI_Inventory.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleAddRow = () => {
        setRows([...rows, {
            article: '',
            description: '',
            stockNumber: '',
            unitofMeasure: '',
            unitValue: '',
            balancePerCard: '',
            onhandPerCount: '',
            shortageOverage: '',
            totalCost: '',
            remarks: ''
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
        <div className="other-rpci-container">
            <div className="header-top">
                <button className="return-button" onClick={onBack}> &larr; </button>
                <h1>RPCI</h1>
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
                                            onKeyDown={handleKeyDown}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.description}
                                            onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                                            onKeyDown={handleKeyDown}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.stockNumber}
                                            onChange={(e) => handleInputChange(index, 'stockNumber', e.target.value)}
                                            onKeyDown={handleKeyDown}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.unitofMeasure}
                                            onChange={(e) => handleInputChange(index, 'unitofMeasure', e.target.value)}
                                            onKeyDown={handleKeyDown}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.unitValue}
                                            onChange={(e) => handleInputChange(index, 'unitValue', e.target.value)}
                                            onKeyDown={handleKeyDown}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.balancePerCard}
                                            onChange={(e) => handleInputChange(index, 'balancePerCard', e.target.value)}
                                            onKeyDown={handleKeyDown}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.onhandPerCount}
                                            onChange={(e) => handleInputChange(index, 'onhandPerCount', e.target.value)}
                                            onKeyDown={handleKeyDown}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.shortageOverage}
                                            onChange={(e) => handleInputChange(index, 'shortageOverage', e.target.value)}
                                            onKeyDown={handleKeyDown}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.totalCost}
                                            onChange={(e) => handleInputChange(index, 'totalCost', e.target.value)}
                                            onKeyDown={handleKeyDown}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={row.remarks}
                                            onChange={(e) => handleInputChange(index, 'remarks', e.target.value)}
                                            onKeyDown={handleKeyDown}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <button className="export-button" onClick={onExport}>Export to Excel</button>
            <div className="right-image-section">
                <img src={logo} alt="OCD logo" className="vertical-OCD-image" />
            </div>
        </div>
    );
};

export default OtherRPCIPage;