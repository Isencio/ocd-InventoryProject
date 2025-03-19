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
                                <th>Column 1</th>
                                <th>Column 2</th>
                                <th>Column 3</th>
                                <th>Column 4</th>
                                <th>Column 5</th>
                                <th>Column 6</th>
                                <th>Column 7</th>
                                <th>Column 8</th>
                                <th>Column 9</th>
                                <th>Column 10</th>
                                <th>Column 11</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Data 1</td>
                                <td>Data 2</td>
                                <td>Data 3</td>
                                <td>Data 4</td>
                                <td>Data 5</td>
                                <td>Data 6</td>
                                <td>Data 7</td>
                                <td>Data 8</td>
                                <td>Data 9</td>
                                <td>Data 10</td>
                                <td>Data 11</td>
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