import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './RSMIPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const RSMIPage = () => {
    const [rows, setRows] = useState(Array(5).fill({
        risNo: '',
        responsibilityCenterCode: '',
        stockNo: '',
        item:'',
        unit:'',
        quantityIssued:'',
        unitCost:'',
        amount:'',
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
            ['RPCI'],
            [],
            // Table headers
            [
                'Article',
                'Remarks',
            ],
            // Data rows
            ...rows.map(row => [
                row.article,
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
        XLSX.utils.book_append_sheet(wb, ws, "RSMI");

        // Generate Excel file and trigger download
        XLSX.writeFile(wb, `RSMI_Inventory.xlsx`);
    };

    const handleAddRow = () => {
        setRows([...rows, {
            article: '',
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
            <div className="rpci-container">
                <div className="header-top">
                    <button className="return-button" onClick={onBack}> &larr; </button>
                    <h1>RSMI</h1>
                </div>
                <div className="stock-cards-header">
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
    
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th></th>
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
                    </div>
                </div>
                <button className="export-button" onClick={onExport}>Export to Excel</button>
                <div className="right-image-section">
                    <img src={logo} alt="OCD logo" className="vertical-OCD-image" />
                </div>
            </div>
        );
};

export default RSMIPage;