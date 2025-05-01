import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import './RPCIPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const RPCIPage = () => {
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
    
    const [hasChanges, setHasChanges] = useState(false);
    const navigate = useNavigate();

    const onBack = () => {
        navigate(-1);
    };

    const onFetchData = async () => {
        try {
            // Fetch data from the API
            const response = await fetch('http://10.16.4.183/project/stockcards.php');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Sort the data alphabetically by stockNumber
            const sortedData = [...data].sort((a, b) => 
                a.stockNumber.localeCompare(b.stockNumber)
            );
            
            // Map the API data to match our row structure
            const formattedData = sortedData.map(item => ({
                article: item.article || '',
                description: item.description || '',
                stockNumber: item.stockNumber || '',
                unitofMeasure: item.unitofMeasure || '',
                unitValue: item.unitValue || '',
                balancePerCard: item.balancePerCard || '',
                onhandPerCount: item.onhandPerCount || '',
                shortageOverage: item.shortageOverage || '',
                totalCost: item.totalCost || '',
                remarks: item.remarks || ''
            }));
            
            setRows(formattedData);
            setHasChanges(true);
            alert('Data fetched and sorted by Stock Number!');
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data. Please try again.');
        }
    };

    const onExportExcel = () => {
        const exportData = [
            ['Republic of the Philippines'],
            ['Department of National Defense'],
            ['OFFICE OF CIVIL DEFENSE'],
            ['NATIONAL CAPITAL REGION'],
            ['NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY'],
            ['Telephone No: (02) 421-1918; OPCEN Mobile Number: 0917-827-6325'],
            ['E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com'],
            [],
            ['RPCI'],
            [],
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

        const ws = XLSX.utils.aoa_to_sheet(exportData);
        ws['!cols'] = [
            { width: 15 }, { width: 15 }, 
            { width: 10 }, { width: 12 }, { width: 12 },
            { width: 10 }, { width: 12 }, { width: 12 },
            { width: 10 }, { width: 15 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "RPCI");
        XLSX.writeFile(wb, `RPCI_Inventory.xlsx`);
    };

    const onExportPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(12);
        doc.text('Republic of the Philippines', 105, 10, { align: 'center' });
        doc.text('Department of National Defense', 105, 16, { align: 'center' });
        doc.text('OFFICE OF CIVIL DEFENSE', 105, 22, { align: 'center' });
        doc.text('NATIONAL CAPITAL REGION', 105, 28, { align: 'center' });
        doc.text('NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY', 105, 34, { align: 'center' });
        doc.text('Telephone No: (02) 421-1918; OPCEN Mobile Number: 0917-827-6325', 105, 40, { align: 'center' });
        doc.text('E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com', 105, 46, { align: 'center' });
        doc.text('RPCI', 105, 56, { align: 'center' });
        
        const startY = 60;
        const cellWidth = 20;
        const cellHeight = 10;
        
        const headers = ['Article', 'Description', 'Stock No.', 'Unit', 'Value', 
                       'Balance', 'On Hand', 'S/O', 'Total', 'Remarks'];
        
        headers.forEach((header, i) => {
            doc.text(header, 10 + (i * cellWidth), startY);
        });
        
        rows.forEach((row, rowIndex) => {
            const y = startY + ((rowIndex + 1) * cellHeight);
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
                doc.text(cell, 10 + (i * cellWidth), y);
            });
        });
        
        doc.save('RPCI_Inventory.pdf');
    };

    const onSave = () => {
        console.log('Data saved:', rows);
        setHasChanges(false);
        alert('Changes saved successfully!');
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
        setHasChanges(true);
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
        setHasChanges(true);
    };

    return (
        <div className="rpci-container">
            <div className="header-top">
                <button className="return-button" onClick={onBack}> &larr; </button>
                <h1>RPCI</h1>
                {hasChanges && (
                <div className="pending-changes-notification">
                    Pending Changes
                </div>
                )}
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

            <div className="action-buttons-container">
                <div className="action-buttons">
                    <button className="fetch-button" onClick={onFetchData}>
                        Fetch Data
                    </button>
                    <button className="add-row-button" onClick={handleAddRow}>
                        Add New Row
                    </button>
                    <div className="export-dropdown">
                        <button className="export-main-button">Export ▼</button>
                        <div className="export-dropdown-content">
                            <button onClick={onExportExcel}>Export to Excel</button>
                            <button onClick={onExportPDF}>Export to PDF</button>
                        </div>
                    </div>
                    <button className="save-button" onClick={onSave}>
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="right-image-section">
                <img src={logo} alt="OCD logo" className="vertical-OCD-image" />
            </div>
        </div>
    );
};

export default RPCIPage;