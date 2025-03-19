import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './StockCardsPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const StockCardsPage = () => {
    const navigate = useNavigate();
    const tableRef = useRef(null);

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

        // Create cells for the new row
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

    return (
        <div className="stock-cards-container">
            <button className="return-button" onClick={onBack}> &larr; </button>
            <div className="stock-cards-header">
                <h1>Stock Card</h1>
                <div className="table-container">
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
                            {/* Initial editable row */}
                            <tr>
                                <td contentEditable="true" onKeyDown={handleKeyDown}></td>
                                <td contentEditable="true" onKeyDown={handleKeyDown}></td>
                                {/* Receipt Data */}
                                <td contentEditable="true" onKeyDown={handleKeyDown}></td>
                                <td contentEditable="true" onKeyDown={handleKeyDown}></td>
                                <td contentEditable="true" onKeyDown={handleKeyDown}></td>
                                {/* Balance Data */}
                                <td contentEditable="true" onKeyDown={handleKeyDown}></td>
                                <td contentEditable="true" onKeyDown={handleKeyDown}></td>
                                <td contentEditable="true" onKeyDown={handleKeyDown}></td>
                                {/* Issue Data */}
                                <td contentEditable="true" onKeyDown={handleKeyDown}></td>
                                <td contentEditable="true" onKeyDown={handleKeyDown}></td>
                                <td contentEditable="true" onKeyDown={handleKeyDown}></td>
                            </tr>
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