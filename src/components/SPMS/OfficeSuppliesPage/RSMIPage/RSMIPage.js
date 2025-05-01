import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './RSMIPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const RSMIPage = () => {
    const [entityName, setEntityName] = useState('');
    const [fundCluster, setFundCluster] = useState('');
    const [serialNo, setSerialNo] = useState('');
    const [date, setDate] = useState('');
    const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [rows, setRows] = useState(Array(5).fill({
        risNo: '',
        responsibilityCenterCode: '',
        stockNo: '',
        item: '',
        unit: '',
        quantityIssued: '',
        unitCost: '',
        amount: '',
    }));
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const months = [
        'January', 'February', 'March', 'April', 
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 5}, (_, i) => currentYear + i);

    // Mock function to fetch data - replace with your actual API call
    const fetchRSMIData = async (month, year) => {
        setIsLoading(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Replace this with your actual data fetching logic
            const mockData = [
                {
                    risNo: 'RIS001',
                    responsibilityCenterCode: 'RC001',
                    stockNo: 'ST001',
                    item: 'Item 1',
                    unit: 'pc',
                    quantityIssued: '10',
                    unitCost: '100',
                    amount: '1000'
                },
                {
                    risNo: 'RIS002',
                    responsibilityCenterCode: 'RC002',
                    stockNo: 'ST002',
                    item: 'Item 2',
                    unit: 'pc',
                    quantityIssued: '5',
                    unitCost: '200',
                    amount: '1000'
                }
            ];
            
            // Fill remaining rows with empty data if needed
            const emptyRows = Array(3).fill({
                risNo: '',
                responsibilityCenterCode: '',
                stockNo: '',
                item: '',
                unit: '',
                quantityIssued: '',
                unitCost: '',
                amount: '',
            });
            
            setRows([...mockData, ...emptyRows]);
        } catch (error) {
            console.error('Error fetching RSMI data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onBack = () => {
        navigate(-1);
    };

    const handleDateSelect = (month, year) => {
        const selectedDate = `${month}/${year}`;
        setDate(selectedDate);
        setShowMonthYearPicker(false);
        // Automatically fetch data when date is selected
        fetchRSMIData(month, year);
    };

    const toggleExportMenu = () => {
        setShowExportOptions(!showExportOptions);
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
            ['RSMI'],
            [],
            ['Entity Name:', entityName, 'Fund Cluster:', fundCluster],
            ['Serial No:', serialNo, 'Date:', date],
            [],
            [
                'RIS No.',
                'Responsibility Center Code',
                'Stock No.',
                'Item',
                'Unit',
                'QuantityIssued',
                'Unit Cost',
                'Amount',
            ],
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

        const ws = XLSX.utils.aoa_to_sheet(exportData);
        ws['!cols'] = [
            { width: 15 }, { width: 15 }, 
            { width: 10 }, { width: 12 }, { width: 12 },
            { width: 10 }, { width: 12 }, { width: 12 },
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "RSMI");
        XLSX.writeFile(wb, `RSMI_Inventory_${date.replace('/', '-')}.xlsx`);
        setShowExportOptions(false);
    };

    const onExportPDF = () => {
        alert(`PDF export functionality would be implemented here for ${date}`);
        setShowExportOptions(false);
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

    // Automatically select current month/year and fetch data on component mount
    useEffect(() => {
        const currentMonth = months[new Date().getMonth()];
        const currentYear = new Date().getFullYear();
        handleDateSelect(currentMonth, currentYear);
    }, []);

    return (
        <div className="rsmi-container">
            {/* Loading Popup */}
            {isLoading && (
            <div className="loading-popup">
                <div className="loading-content">
                <div className="loading-spinner"></div>
                <p>Fetching data...</p>
                </div>
            </div>
            )}

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
                                    />
                                </td>
                                <th className="Item-right-align">Fund Cluster :</th>
                                <td className="input-fundcluster-cell">
                                    <input
                                        type="text"
                                        value={fundCluster}
                                        onChange={(e) => setFundCluster(e.target.value)}
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
                                    />
                                </td>
                                <th className="Item-right-align">Date:</th>
                                <td>
                                    <div className="date-input-container">
                                        <input
                                            type="text"
                                            value={date}
                                            readOnly
                                            onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
                                            placeholder="Select Month/Year"
                                            className="date-input"
                                        />
                                        {showMonthYearPicker && (
                                            <div className="month-year-picker">
                                                <div className="picker-header">
                                                    <select 
                                                        className="year-select"
                                                        defaultValue={currentYear}
                                                        onChange={(e) => {
                                                            const selectedYear = e.target.value;
                                                            const currentMonth = document.querySelector('.month-grid button.active')?.textContent || months[0];
                                                            handleDateSelect(currentMonth, selectedYear);
                                                        }}
                                                    >
                                                        {years.map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="month-grid">
                                                    {months.map(month => (
                                                        <button
                                                            key={month}
                                                            onClick={() => {
                                                                const selectedYear = document.querySelector('.year-select')?.value || currentYear;
                                                                handleDateSelect(month, selectedYear);
                                                            }}
                                                            className={date.includes(month) ? 'active' : ''}
                                                        >
                                                            {month.substring(0, 3)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.responsibilityCenterCode}
                                                            onChange={(e) => handleInputChange(index, 'responsibilityCenterCode', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.stockNo}
                                                            onChange={(e) => handleInputChange(index, 'stockNo', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.item}
                                                            onChange={(e) => handleInputChange(index, 'item', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.unit}
                                                            onChange={(e) => handleInputChange(index, 'unit', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.quantityIssued}
                                                            onChange={(e) => handleInputChange(index, 'quantityIssued', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.unitCost}
                                                            onChange={(e) => handleInputChange(index, 'unitCost', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.amount}
                                                            onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
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
            <div className="right-image-section">
                <img src={logo} alt="OCD logo" className="vertical-OCD-image" />
            </div>

            {/* Export button in bottom right with pop-up menu */}
            <div className={`export-container ${showExportOptions ? 'active' : ''}`}>
                <button className="export-button" onClick={toggleExportMenu}>
                    Export
                </button>
                {showExportOptions && (
                    <div className="export-options">
                        <button onClick={onExportExcel}>Export as Excel</button>
                        <button onClick={onExportPDF}>Export as PDF</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RSMIPage;