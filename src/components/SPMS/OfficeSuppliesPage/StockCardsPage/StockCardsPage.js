import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StockCardsPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const StockCardsPage = () => {
    const navigate = useNavigate();
    const tableRef = useRef(null);
    const [item, setItem] = useState('');
    const [stockNo, setStockNo] = useState('');
    const [description, setDescription] = useState('');
    const [reorderPoint, setReorderPoint] = useState('');
    const [unitofmeasurement, setUnitofMeasurement] = useState('');

    const onBack = () => {
        navigate(-1);
    };

    const onExport = () => {
        console.log('Export button clicked');
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addNewRow();
        }
    };

    const addNewRow = () => {
        const table = tableRef.current;
        const newRow = table.insertRow(-1);
        
        const columns = [
            { editable: true }, // DATE
            { editable: true }, // REFERENCE
            { editable: true }, // RECEIPT Qty
            { editable: true }, // RECEIPT Unit Cost
            { editable: true }, // RECEIPT Total Cost
            { editable: true }, // BALANCE Qty
            { editable: true }, // BALANCE Unit Cost
            { editable: true }, // BALANCE Total Cost
            { editable: true }, // ISSUE Qty
            { editable: true }, // ISSUE Office
            { editable: true }, // No. of Days to Consume
        ];

        columns.forEach((column) => {
            const cell = newRow.insertCell();
            if (column.editable) {
                cell.contentEditable = true;
                cell.addEventListener('keydown', handleKeyDown); // Add event listener to new cells
            }
        });
    };

    useEffect(() => {
        const table = tableRef.current;
        for (let i = 0; i < 5; i++) {
            addNewRow();
        }
    }, []);
    
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
                    {/* Add a new row for Item and Stock No. with input fields */}
                    <div className="item-stock-row">
                        <div className="item-cell">
                            <label>Item:</label>
                            <input
                                type="text"
                                placeholder="Enter Item"
                                value={item}
                                onChange={(e) => setItem(e.target.value)}
                            />
                        </div>
                        <div className="stock-no-cell">
                            <label>Stock No.:</label>
                            <input
                                type="text"
                                placeholder="Enter Stock No."
                                value={stockNo}
                                onChange={(e) => setStockNo(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Add a new row for Description and Re-order point with input fields */}
                    <div className="description-reorder-row">
                        <div className="description-cell">
                            <label>Description:</label>
                            <input
                                type="text"
                                placeholder="Enter Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="reorder-point-cell">
                            <label>Re-order Point:</label>
                            <input
                                type="text"
                                placeholder="Enter Re-order Point"
                                value={reorderPoint}
                                onChange={(e) => setReorderPoint(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="unit-of-measurement">
                        <div className="unit-of-measurement-cell">
                            <label>Unit of Measurement:</label>
                            <input
                                type="text"
                                placeholder="Enter Unit of Measurement"
                                value={unitofmeasurement}
                                onChange={(e) => setUnitofMeasurement(e.target.value)}
                            />
                        </div>
                    </div>
                    {/* Existing table */}
                    <table ref={tableRef}>
                        <thead>
                            <tr>
                                <th>DATE</th>
                                <th>REFERENCE</th>
                                <th colSpan="3">RECEIPT</th>
                                <th colSpan="3">BALANCE</th>
                                <th colSpan="2">ISSUE</th>
                                <th>No. of Days to Consume</th>
                            </tr>
                            <tr>
                                <th></th> {/* Empty for DATE */}
                                <th></th> {/* Empty for REFERENCE */}
                                {/* Sub-columns for RECEIPT */}
                                <th>Qty</th>
                                <th>Unit Cost</th>
                                <th>Total Cost</th>
                                {/* Sub-columns for BALANCE */}
                                <th>Qty</th>
                                <th>Unit Cost</th>
                                <th>Total Cost</th>
                                {/* Sub-columns for ISSUE */}
                                <th>Qty</th>
                                <th>Office</th>
                                <th></th> {/* Empty for No. of Days to Consume */}
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
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