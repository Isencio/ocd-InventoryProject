import React,{ useState }  from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './OtherRISPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const OtherRISPage = () => {
    const [division, setDivision] = useState('');
    const [sectionUnit, setSectionUnit] = useState('');
    const [responsibilityCenterCode, setResponsibilityCenterCode] = useState('');
    const [risNo, setRisNo] = useState('');
    const [rows, setRows] = useState(Array(5).fill({
        stockNo: '',
        unit: '',
        description: '',
        quantity:'',
        yes:'',
        no:'',
        quantity2:'',
        remarks:''
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
            ['RIS'],
            [],
            // Table headers
            [
                'Stock No.',
                'Unit',
                'Description',
                'Quantity',
                'Yes',
                'No',
                'Quantity',
                'Remarks',
            ],
            // Data rows
            ...rows.map(row => [
                row.stockNo,
                row.unit,
                row.description,
                row.quantity,
                row.yes,
                row.no,
                row.quantity2,
                row.remarks,
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
        XLSX.writeFile(wb, `RIS_Inventory.xlsx`);
    };

    const handleAddRow = () => {
        setRows([...rows, {
            stockNo: '',
            unit: '',
            description: '',
            quantity:'',
            yes:'',
            no:'',
            quantity2:'',
            remarks:''
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
                            <th className="Item-left-align">Division:</th>
                                <td>
                                    <input
                                        type="text"
                                        value={division}
                                        onChange={(e) => setDivision(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                </td>
                                
                                <th className="Item-right-align">Section Unit :</th>
                                <td className="input-sectionUnit-cell">
                                    <input
                                        type="text"
                                        value={sectionUnit}
                                        onChange={(e) => setSectionUnit(e.target.value)}
                                        onKeyDown={handleKeyDown} 
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th className="Item-left-align">Responsibility Center Code:</th>
                                    <td><b> 2016 </b></td>
                                <th className="Item-right-align">RIS No:</th>
                                <td>
                                    <input
                                        type="text"
                                        value={responsibilityCenterCode}
                                        onChange={(e) => setResponsibilityCenterCode(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                    
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
                                                    value={row.description}
                                                    onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                    type="text"
                                                    value={row.quantity}
                                                    onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                    type="text"
                                                    value={row.yes}
                                                    onChange={(e) => handleInputChange(index, 'yes', e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                    type="text"
                                                    value={row.no}
                                                    onChange={(e) => handleInputChange(index, 'no', e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                    type="text"
                                                    value={row.quantity2}
                                                    onChange={(e) => handleInputChange(index, 'quantity2', e.target.value)}
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

export default OtherRISPage;