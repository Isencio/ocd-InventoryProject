import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './RSMIPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const RSMIPage = () => {
    const [entityName, setEntityName] = useState('OFFICE OF CIVIL DEFENSE - NCR');
    const [fundCluster, setFundCluster] = useState('01');
    const [serialNo, setSerialNo] = useState('');
    const [date, setDate] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
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
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const months = [
        'January', 'February', 'March', 'April', 
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 5}, (_, i) => currentYear - i);

    const fetchRSMIData = async (month, year) => {
        if (!month || !year) {
            setError('Please select both month and year');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            const monthIndex = months.indexOf(month) + 1;
            const response = await fetch(`http://10.16.4.247/project/rsmi_api.php?month=${monthIndex}&year=${year}`);
            
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
    
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch RSMI data');
            }
    
            if (!result.data || result.data.length === 0) {
                throw new Error(`No RSMI data found for ${month} ${year}`);
            }

            // Process the data to match RSMI format
            const processedData = result.data.map(item => ({
                risNo: item.reference || 'N/A',
                responsibilityCenterCode: item.issueoffice || 'N/A',
                stockNo: item.stocknumber || 'N/A',
                item: item.item || item.description || 'N/A',
                unit: item.unitofmeasurement || 'N/A',
                quantityIssued: item.issueqty || '0',
                unitCost: item.balanceunitcost || '0.00',
                amount: item.balancetotalcost || '0.00',
                date: item.formatted_date || ''
            }));

            // Ensure minimum 5 rows
            const emptyRowsCount = Math.max(0, 5 - processedData.length);
            const emptyRows = Array(emptyRowsCount).fill({
                risNo: '',
                responsibilityCenterCode: '',
                stockNo: '',
                item: '',
                unit: '',
                quantityIssued: '',
                unitCost: '',
                amount: '',
                date: ''
            });
            
            setRows([...processedData, ...emptyRows]);
            
        } catch (error) {
            console.error('Fetch error:', error);
            setError(error.message);
            setRows(Array(5).fill({
                risNo: '',
                responsibilityCenterCode: '',
                stockNo: '',
                item: '',
                unit: '',
                quantityIssued: '',
                unitCost: '',
                amount: '',
                date: ''
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const onBack = () => {
        navigate(-1);
    };

    const handleMonthSelect = (month) => {
        setSelectedMonth(month);
        if (selectedYear) {
            const selectedDate = `${month} ${selectedYear}`;
            setDate(selectedDate);
            fetchRSMIData(month, selectedYear);
        }
    };

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        if (selectedMonth) {
            const selectedDate = `${selectedMonth} ${year}`;
            setDate(selectedDate);
            fetchRSMIData(selectedMonth, year);
        }
    };

    const toggleExportMenu = () => {
        setShowExportOptions(!showExportOptions);
    };

    const onExportExcel = () => {
        if (!date) {
            alert('Please select a date first');
            return;
        }

        const exportData = [
            ['Republic of the Philippines'],
            ['Department of National Defense'],
            ['OFFICE OF CIVIL DEFENSE'],
            ['NATIONAL CAPITAL REGION'],
            ['NO. 81 RBA BLDG. 15TH AVENUE, MURPHY, CUBAO, QUEZON CITY'],
            ['Telephone No: (02) 421-1918; OPCEN Mobile Number: 0917-827-6325'],
            ['E-Mail Address: ncr@ocd.gov.ph / civildefensencr@gmail.com'],
            [],
            ['REPORT OF SUPPLIES AND MATERIALS ISSUED (RSMI)'],
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
                'Quantity Issued',
                'Unit Cost',
                'Amount',
                'Date'
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
                row.date
            ])
        ];

        const ws = XLSX.utils.aoa_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "RSMI");
        XLSX.writeFile(wb, `RSMI_${selectedMonth}_${selectedYear}.xlsx`);
        setShowExportOptions(false);
    };

    const handleInputChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index] = { ...updatedRows[index], [field]: value };
        
        // Recalculate amount if unit cost or quantity changes
        if (field === 'unitCost' || field === 'quantityIssued') {
            const quantity = parseFloat(updatedRows[index].quantityIssued) || 0;
            const unitCost = parseFloat(updatedRows[index].unitCost) || 0;
            updatedRows[index].amount = (quantity * unitCost).toFixed(2);
        }
        
        setRows(updatedRows);
    };

    // Load current month/year data on initial render
    useEffect(() => {
        const currentMonth = months[new Date().getMonth()];
        const currentYear = new Date().getFullYear();
        setSelectedMonth(currentMonth);
        setSelectedYear(currentYear);
        setDate(`${currentMonth} ${currentYear}`);
        fetchRSMIData(currentMonth, currentYear);
    }, []);

    return (
        <div className="rsmi-container">
            {isLoading && (
                <div className="loading-popup">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <p>Fetching RSMI data for {selectedMonth} {selectedYear}...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="error-popup">
                    <div className="error-content">
                        <p>Error: {error}</p>
                        <button onClick={() => setError(null)}>Close</button>
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
                                                        value={selectedYear}
                                                        onChange={(e) => handleYearSelect(e.target.value)}
                                                    >
                                                        <option value="">Select Year</option>
                                                        {years.map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="month-grid">
                                                    {months.map(month => (
                                                        <button
                                                            key={month}
                                                            onClick={() => handleMonthSelect(month)}
                                                            className={selectedMonth === month ? 'active' : ''}
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
                                                <th>Date</th>
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
                                                            type="number"
                                                            step="0.01"
                                                            value={row.quantityIssued}
                                                            onChange={(e) => handleInputChange(index, 'quantityIssued', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={row.unitCost}
                                                            onChange={(e) => handleInputChange(index, 'unitCost', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        {row.amount}
                                                    </td>
                                                    <td>
                                                        {row.date}
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

            <div className={`export-container ${showExportOptions ? 'active' : ''}`}>
                <button className="export-button" onClick={toggleExportMenu}>
                    Export
                </button>
                {showExportOptions && (
                    <div className="export-options">
                        <button onClick={onExportExcel}>Export as Excel</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RSMIPage;