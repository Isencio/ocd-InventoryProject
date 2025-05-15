import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import './OtherRPCIPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const OtherRPCIPage = () => {
    const [fundCluster, setFundCluster] = useState('');
    const [accountableOfficer, setAccountableOfficer] = useState('MR. NIEL PATRICK PALLADA');
    const [assumptionDate, setAssumptionDate] = useState('February 01, 2021');
    const [reportDate, setReportDate] = useState('March 13, 2023');
    const [rows, setRows] = useState([
        {
            article: '10404990-00-14-011',
            description: 'Desk Calendar',
            stockNumber: '1',
            unitofMeasure: 'pcs',
            unitValue: '0',
            balancePerCard: '',
            onhandPerCount: '0',
            shortageOverage: '',
            totalCost: '0',
            remarks: ''
        },
        {
            article: '10404990-00-14-010',
            description: 'Wall Calendar',
            stockNumber: '2',
            unitofMeasure: 'pcs',
            unitValue: '0',
            balancePerCard: '',
            onhandPerCount: '0',
            shortageOverage: '',
            totalCost: '0',
            remarks: ''
        },
        {
            article: '10404990-00-14-012',
            description: 'Executive Planner',
            stockNumber: '3',
            unitofMeasure: 'pcs',
            unitValue: '0',
            balancePerCard: '',
            onhandPerCount: '0',
            shortageOverage: '',
            totalCost: '0',
            remarks: ''
        },
        {
            article: '10404990-00-14-005',
            description: 'Ethyl Alcohol',
            stockNumber: '4',
            unitofMeasure: 'gal',
            unitValue: '450',
            balancePerCard: '',
            onhandPerCount: '28',
            shortageOverage: '',
            totalCost: '12600',
            remarks: 'RIS 2023-03-39\nRIS 2023-02-11\nRIS 2022-12-47\nRIS 2022-08-14'
        },
        {
            article: '10404990-00-14-023',
            description: 'Surgical Mask',
            stockNumber: '5',
            unitofMeasure: 'pcs',
            unitValue: '0',
            balancePerCard: '',
            onhandPerCount: '0',
            shortageOverage: '',
            totalCost: '0',
            remarks: 'RIS 2022-06-08'
        }
    ]);
    
    const navigate = useNavigate();

    const onBack = () => {
        navigate(-1);
    };

    const onExport = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('OtherSuppliesRPCI');

            // Add header information
            worksheet.addRow(['Republic of the Philippines']);
            worksheet.addRow(['Department of National Defense']);
            worksheet.addRow(['OFFICE OF CIVIL DEFENSE']);
            worksheet.addRow(['NATIONAL CAPITAL REGION']);
            worksheet.addRow(['NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY']);
            worksheet.addRow(['Telephone Number: (02) 421-1918; OPCEN Mobile Number: 0917-8276325']);
            worksheet.addRow(['E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com']);
            worksheet.addRow([]);

            // Add report title
            const reportTitleRow = worksheet.addRow(['REPORT ON THE PHYSICAL COUNT OF INVENTORIES']);
            reportTitleRow.font = { bold: true, size: 14 };
            reportTitleRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells('A8:J8');

            // Add inventory type
            const inventoryTypeRow = worksheet.addRow(['OTHER SUPPLIES']);
            inventoryTypeRow.font = { bold: true };
            inventoryTypeRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells('A9:J9');
            worksheet.addRow(['(Type of Inventory Item)']);
            worksheet.mergeCells('A10:J10');
            worksheet.addRow([`As of ${reportDate}`]);
            worksheet.mergeCells('A11:J11');
            worksheet.addRow([]);

            // Add fund cluster and accountable officer
            worksheet.addRow([`Fund Cluster : ${fundCluster}`]);
            worksheet.mergeCells('A13:J13');
            worksheet.addRow([`For which ${accountableOfficer}, Supply Accountable Officer, OCD-NCR is accountable, having assumed such accountability on _${assumptionDate}_.`]);
            worksheet.mergeCells('A14:J14');
            worksheet.addRow([]);

            // Add table headers
            const headerRow1 = worksheet.addRow([
                'Article', 'Description', 'Stock Number', 'Unit of Measure', 'Unit Value', 
                'Balance Per Card', 'On Hand Per Count', 'Shortage/Overage', 'TOTAL COST', 'Remarks'
            ]);
            headerRow1.font = { bold: true };

            const headerRow2 = worksheet.addRow([
                '', '', '', '', '', '(Quantity)', '(Quantity)', 'Quantity', 'Value', ''
            ]);
            headerRow2.font = { bold: true };

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

            // Add total row
            const lastRowNum = worksheet.rowCount;
            worksheet.addRow([]);
            worksheet.mergeCells(`A${lastRowNum+1}:H${lastRowNum+1}`);
            worksheet.getCell(`I${lastRowNum+1}`).value = 'TOTAL';
            worksheet.getCell(`J${lastRowNum+1}`).value = { formula: `SUM(J${headerRow1.number+1}:J${lastRowNum})` };
            worksheet.getRow(lastRowNum+1).font = { bold: true };

            // Add signature rows
            worksheet.addRow([]);
            worksheet.addRow(['Prepared by:', 'Certified Correct by:', '', 'Approved by:', '', '', '', 'Verified by:', '', '']);
            worksheet.addRow(['KRIZELLE JANE MATIAS', 'ROSEMARIE BARGAN', '', 'DIR. ROMULO M. CABANTAC JR.', '', '', '', 'ROBY JANE L. BERNABE', '', '']);
            worksheet.addRow(['Member of Inventory Committee', 'Chairman, Inventory Committee', '', 'OCD NCR, Regional Director', '', '', '', 'State Auditor III/OIC, Audit Team Leader', '', '']);
            worksheet.addRow([]);
            worksheet.addRow(['', 'NIEL PATRICK PALLADA', '', '', '', '', '', '', '', '']);
            worksheet.addRow(['', 'Member of Inventory Committee', '', '', '', '', '', '', '', '']);

            // Set column widths
            worksheet.columns = [
                { width: 20 },  // Article
                { width: 35 },  // Description
                { width: 12 },  // Stock Number
                { width: 15 },  // Unit of Measure
                { width: 12 },  // Unit Value
                { width: 15 },  // Balance Per Card
                { width: 15 },  // On Hand Per Count
                { width: 15 },  // Shortage/Overage
                { width: 12 },  // Value
                { width: 25 }   // Remarks
            ];

            // Format all cells with borders
            const dataStartRow = headerRow1.number;
            const dataEndRow = lastRowNum;
            for (let i = dataStartRow; i <= dataEndRow; i++) {
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

            // Format number cells
            for (let i = dataStartRow + 1; i <= dataEndRow; i++) {
                // Unit Value and Total Cost
                worksheet.getCell(`E${i}`).numFmt = '#,##0.00';
                worksheet.getCell(`J${i}`).numFmt = '#,##0.00';
            }

            // Save file
            await workbook.xlsx.writeFile(`OtherSupplies_RPCI_${reportDate.replace(/\s+/g, '_')}.xlsx`);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
        }
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
                <h1>RPCI - Other Supplies</h1>
            </div>

            <div className="rpci-controls">
                <div className="control-group">
                    <label>Fund Cluster:</label>
                    <input
                        type="text"
                        value={fundCluster}
                        onChange={(e) => setFundCluster(e.target.value)}
                    />
                </div>
                <div className="control-group">
                    <label>Accountable Officer:</label>
                    <input
                        type="text"
                        value={accountableOfficer}
                        onChange={(e) => setAccountableOfficer(e.target.value)}
                    />
                </div>
                <div className="control-group">
                    <label>Assumption Date:</label>
                    <input
                        type="text"
                        value={assumptionDate}
                        onChange={(e) => setAssumptionDate(e.target.value)}
                    />
                </div>
                <div className="control-group">
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
                                <th>Value</th>
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
                                        <textarea
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
            <div className="action-buttons">
                <button className="add-row-button" onClick={handleAddRow}>Add Row</button>
                <button className="export-button" onClick={onExport}>Export to Excel</button>
            </div>
            <div className="right-image-section">
                <img src={logo} alt="OCD logo" className="vertical-OCD-image" />
            </div>
        </div>
    );
};

export default OtherRPCIPage;