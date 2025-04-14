import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './OtherRPCIPage';
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

    const onExport = () => {
        // Prepare the data for export
        const exportData = [
            // Header row
            ['Republic of the Philippines'],
            ['Department of National Defense'],
            ['OFFICE OF CIVIL DEFENSE'],
            ['NATIONAL CAPITAL REGION'],
            ['NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY'],
            ['Telephone No: (02) 421-1918; OPCEN Mobile Number: 0917-827-6325'],
            ['E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com'],
            [],
            ['OTHER SUPPLIES RPCI'],
            [],
            // Table headers
            [
                'Article', 'Description', 
                'Stock Number', 
                'Unit of Measure', 
                'Unit Value',
                'Balance Per Card', 
                'On Hand Per Count', 
                'Shortage/Overage', 
                'Total Cost',
                'Remarks',
            ],
            // Data rows
            ...rows.map(row => [
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
            ])
        ];

        // Create a worksheet with column widths
        const ws = XLSX.utils.aoa_to_sheet(exportData);
        ws['!cols'] = [
            { width: 15 }, { width: 15 }, 
            { width: 10 }, { width: 12 }, { width: 12 },
            { width: 10 }, { width: 12 }, { width: 12 },
            { width: 10 }, { width: 15 }
        ];

        // Create a workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "OtherSuppliesRPCI");

        // Generate Excel file and trigger download
        XLSX.writeFile(wb, `OtherSupplies_RPCI_Inventory.xlsx`);
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
                <h1>OTHER SUPPLIES RPCI</h1>
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