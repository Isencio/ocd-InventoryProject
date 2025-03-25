import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StockCardsPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const StockCardsPage = () => {
    const [item, setItem] = useState('');
    const [stockNo, setStockNo] = useState('');
    const [description, setDescription] = useState('');
    const [reorderpoint, setReOrderPoint] = useState('');
    const [unitofmeasurement, setUnitofMeasurement] = useState('');
    const [rows, setRows] = useState(Array(5).fill({
        date: '',
        reference: '',
        receiptQty: '',
        receiptUnitCost: '',
        receiptTotalCost: '',
        balanceQty: '',
        balanceUnitCost: '',
        balanceTotalCost: '',
        issueQty: '',
        issueOffice: '',
        daysToConsume: ''
    }));
    const navigate = useNavigate();

    const onBack = () => {
        navigate(-1);
    };

    const onExport = () => {
        console.log('Export button clicked');
    };

    const handleAddRow = () => {
        setRows([...rows, {
            date: '',
            reference: '',
            receiptQty: '',
            receiptUnitCost: '',
            receiptTotalCost: '',
            balanceQty: '',
            balanceUnitCost: '',
            balanceTotalCost: '',
            issueQty: '',
            issueOffice: '',
            daysToConsume: ''
        }]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddRow();
        }
    };

    const itemOptions = [
        { value: '', label: 'Select an item' },
        { value: 'first_aid_kit', label: 'First Aid Kit' },
        { value: 'flashlight', label: 'Flashlight' },
        { value: 'battery', label: 'Battery' },
        { value: 'water_container', label: 'Water Container' },
    ];

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
        <div className="stock-cards-container">
            <div className="header-top">
                <button className="return-button" onClick={onBack}> &larr; </button>
                <h1>Stock Card</h1>
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
                    <table>
                        <thead>
                            <tr>
                                <th className="Item-left-align">Item:</th>
                                <td className="input-Item-cell">
                                <select
                                value={item}
                                onChange={(e) => setItem(e.target.value)}
                                className="dropdown-select"
                            >
                                {itemOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                                </td>
                                <th className="Item-right-align">Stock No. :</th>
                                <td className="input-stockno-cell">
                                    <input
                                        type="text"
                                        value={stockNo}
                                        onChange={(e) => setStockNo(e.target.value)}
                                        onKeyDown={handleKeyDown} 
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th className="Item-left-align">Description:</th>
                                <td>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                </td>
                                <th className="Item-right-align">Re-order point:</th>
                                <td>
                                    <input
                                        type="text"
                                        value={reorderpoint}
                                        onChange={(e) => setReOrderPoint(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th className="Item-left-align">Unit of Measurement:</th>
                                <td>
                                    <input
                                        type="text"
                                        value={unitofmeasurement}
                                        onChange={(e) => setUnitofMeasurement(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                </td>
                                <td colSpan="2"></td>
                            </tr>
                            <tr>
                                <th colSpan="4">
                                    <table className="inner-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Reference</th>
                                                <th colSpan="3">RECEIPT</th>
                                                <th colSpan="3">BALANCE</th>
                                                <th colSpan="2">ISSUE</th>
                                                <th>No. of Days to Consume</th>
                                            </tr>
                                            <tr>
                                                <th></th>
                                                <th></th>
                                                <th>Qty</th>
                                                <th>Unit Cost</th>
                                                <th>Total Cost</th>
                                                <th>Qty</th>
                                                <th>Unit Cost</th>
                                                <th>Total Cost</th>
                                                <th>Qty</th>
                                                <th>Office</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.date}
                                                            onChange={(e) => handleInputChange(index, 'date', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.reference}
                                                            onChange={(e) => handleInputChange(index, 'reference', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.receiptQty}
                                                            onChange={(e) => handleInputChange(index, 'receiptQty', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.receiptUnitCost}
                                                            onChange={(e) => handleInputChange(index, 'receiptUnitCost', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.receiptTotalCost}
                                                            onChange={(e) => handleInputChange(index, 'receiptTotalCost', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.balanceQty}
                                                            onChange={(e) => handleInputChange(index, 'balanceQty', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.balanceUnitCost}
                                                            onChange={(e) => handleInputChange(index, 'balanceUnitCost', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.balanceTotalCost}
                                                            onChange={(e) => handleInputChange(index, 'balanceTotalCost', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.issueQty}
                                                            onChange={(e) => handleInputChange(index, 'issueQty', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.issueOffice}
                                                            onChange={(e) => handleInputChange(index, 'issueOffice', e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.daysToConsume}
                                                            onChange={(e) => handleInputChange(index, 'daysToConsume', e.target.value)}
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
            <button className="export-button" onClick={onExport}>Export</button>
            <div className="right-image-section">
                <img src={logo} alt="OCD logo" className="vertical-OCD-image" />
            </div>
        </div>
    );
};

export default StockCardsPage;