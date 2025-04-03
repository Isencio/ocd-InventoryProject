import React,{ useState }  from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './RSMIPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const RSMIPage = () => {
    const [entityName, setEntityName] = useState('');
    const [fundCluster, setFundCluster] = useState('');
    const [serialNo, setSerialNo] = useState('');
    const [date, setDate] = useState('');
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
                row.risNo,
                row.responsibilityCenterCode,
                row.stockNo,
                row.item,
                row.unit,
                row.quantityIssued,
                row.unitCost,
                row.amount,
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
            risNo: '',
            responsibilityCenterCode: '',
            stockNo: '',
            item:'',
            unit:'',
            quantityIssued:'',
            unitCost:'',
            amount:'',
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
                                    <input
                                        type="text"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
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
                <button className="export-button" onClick={onExport}>Export to Excel</button>
                <div className="right-image-section">
                    <img src={logo} alt="OCD logo" className="vertical-OCD-image" />
                </div>
            </div>
        );
};

export default RSMIPage;