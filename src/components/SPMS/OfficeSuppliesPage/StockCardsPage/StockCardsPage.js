import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StockCardsPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const StockCardsPage = () => {
    const navigate = useNavigate();

    const onBack = () => {
        navigate(-1);
    };

    const onExport = () => {
        console.log('Export button clicked');
    };

    return (
        <div className="stock-cards-container">
            <button className="return-button" onClick={onBack}> &larr; </button>
            <div className="stock-cards-header">
                <h1>Stock Card</h1>
                <div className="table-container">
                    <table>
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
                            <tr>
                                <td>2023-10-01</td>
                                <td>REF123</td>
                                {/* Receipt Data */}
                                <td>100</td>
                                <td>$10</td>
                                <td>$1000</td>
                                {/* Balance Data */}
                                <td>200</td>
                                <td>$10</td>
                                <td>$2000</td>
                                {/* Issue Data */}
                                <td>50</td>
                                <td>Office A</td>
                                <td>30</td> {/* No. of Days to Consume */}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <button className="export-button" onClick={onExport}>Export</button>
            <div className="right-image-section">
                <img src={logo} 
                alt="OCD logo" 
                className="vertical-OCD-image" />
            </div>
        </div>
    );
};

export default StockCardsPage;